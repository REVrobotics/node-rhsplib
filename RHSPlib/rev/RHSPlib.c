/**
 * RHSPlib.c
 *
 *  Created on: Nov 25, 2020
 *  Author: Andrey Mihadyuk
 */
#include <string.h>

#include "RHSPlib.h"
#include "RHSPlib_time.h"
#include "RHSPlib_serial.h"

static void fillPayloadData(const RHSPlib_Module_T *obj, RHSPlib_PayloadData_T *payload);
static uint16_t getInterfacePacketID(const RHSPlib_Module_InterfaceList_T *interfaceList,
        							 const char* interfaceName, uint16_t functionNumber);
static int getDiscoveryResult(size_t numberOfParents);
static int validateWriteCommand(RHSPlib_Module_T *obj, uint8_t *nackReasonCode);
static int validateReadCommand(RHSPlib_Module_T *obj, uint8_t *nackReasonCode);
static bool isAckReceived(RHSPlib_Module_T *obj, bool *isAttentionRequired);
static bool isNackReceived(RHSPlib_Module_T *obj, uint8_t *nackReasonCode);
static int sendPacket(RHSPlib_Module_T *obj, uint8_t destAddr, uint8_t messageNumber, uint8_t referenceNumber,
                      uint16_t packetTypeId, const uint8_t *payload, uint16_t payloadSize);
static int receivePacket(RHSPlib_Module_T *obj);
static int sendCommand(RHSPlib_Module_T *obj, uint8_t destAddr, uint16_t packetTypeID,
                         const uint8_t *payload, uint16_t payloadSize);
static uint8_t calcChecksum(const uint8_t *buffer, size_t bufferSize);
static int parse(RHSPlib_Module_T *obj);
static int serialWrite(RHSPlib_Serial_T *serialPort, const uint8_t *buffer, size_t bytesToWrite);
static int serialRead(RHSPlib_Serial_T *serialPort, uint8_t *buffer, size_t bytesToRead);
static void serialPurgeRxBuffer(RHSPlib_Serial_T *serialPort);

static void addInterface(RHSPlib_Module_InterfaceList_T *list, const RHSPlib_Module_Interface_T *intf);
static const RHSPlib_Module_Interface_T *getInterfaceByName(const RHSPlib_Module_InterfaceList_T *list,
                                                             const char *interfaceName);


void RHSPlib_init(RHSPlib_Module_T *obj)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
        return;

    memset(obj, 0, sizeof(*obj));
    obj->messageNumber        = 1;
    obj->srcAddress           = RHSPLIB_HOST_ADDRESS;
    obj->dstAddress           = RHSPLIB_DEFAULT_DST_ADDRESS;
    obj->responseTimeoutMs    = RHSPLIB_RESPONSE_TIMEOUT_MS;
}


int RHSPlib_open(RHSPlib_Module_T *obj, RHSPlib_Serial_T *serialPort, uint8_t destAddress)
{
    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(serialPort);
    if (!obj || !serialPort)
    {
        return RHSPLIB_ERROR;
    }
    obj->serialPort = serialPort;
    obj->dstAddress = destAddress;

    return RHSPLIB_RESULT_OK;
}

bool RHSPlib_isOpened(const RHSPlib_Module_T *obj)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return false;
    }
    return (obj->serialPort != NULL) ? true : false;
}

void RHSPlib_close(RHSPlib_Module_T *obj)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return;
    }
    // add closure logic if it's needed
    obj->serialPort = NULL;
    memset(&obj->interfaceList, 0, sizeof(obj->interfaceList));
}


void RHSPlib_setDestAddress(RHSPlib_Module_T *obj, uint8_t dstAddress)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return;
    }
    obj->dstAddress = dstAddress;
}

uint8_t RHSPlib_destAddress(const RHSPlib_Module_T *obj)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return 0;
    }
    return obj->dstAddress;
}

void RHSPlib_setResponseTimeoutMs(RHSPlib_Module_T *obj, uint32_t responseTimeoutMs)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return;
    }
    obj->responseTimeoutMs = responseTimeoutMs;
}

uint32_t RHSPlib_responseTimeoutMs(const RHSPlib_Module_T *obj)
{
    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return 0;
    }
    return obj->responseTimeoutMs;
}

int RHSPlib_getModuleStatus(RHSPlib_Module_T *obj, uint8_t clearStatusAfterResponse,
                             RHSPlib_ModuleStatus_T *status, uint8_t *nackReasonCode)
{

    RHSPLIB_ASSERT(obj);
    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (clearStatusAfterResponse > 1)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = RHSPlib_sendReadCommandInternal(obj, 0x7F03,
                                          &clearStatusAfterResponse, sizeof(clearStatusAfterResponse),
                                          nackReasonCode);
    if (result < 0)
    {
        return result;
    }
    if (status)
    {
        const uint8_t *payload = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer);
        status->statusWord  = RHSPLIB_ARRAY_BYTE(uint8_t, payload, 0);
        status->motorAlerts = RHSPLIB_ARRAY_BYTE(uint8_t, payload, 1);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_sendKeepAlive(RHSPlib_Module_T *obj, uint8_t *nackReasonCode)
{
    return RHSPlib_sendWriteCommandInternal(obj,  0x7F04, NULL, 0, nackReasonCode);
}

int RHSPlib_sendFailSafe(RHSPlib_Module_T *obj, uint8_t *nackReasonCode)
{
    return RHSPlib_sendWriteCommandInternal(obj, 0x7F05, NULL, 0, nackReasonCode);
}

int RHSPlib_setNewModuleAddress(RHSPlib_Module_T *obj, uint8_t newModuleAddress, uint8_t *nackReasonCode)
{
	if (newModuleAddress == 0 || newModuleAddress == 0xFF)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    return RHSPlib_sendWriteCommandInternal(obj, 0x7F06, &newModuleAddress, sizeof(newModuleAddress),
                                     nackReasonCode);
}

int RHSPlib_queryInterface(RHSPlib_Module_T *obj, const char *interfaceName, RHSPlib_Module_Interface_T *intf, uint8_t *nackReasonCode)
{
    size_t interfaceNameLength = strlen(interfaceName) + 1; // interfaceNameLength should include null terminated symbol

    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(interfaceNameLength <= RHSPLIB_MAX_PAYLOAD_SIZE);

    if (!obj || interfaceNameLength > RHSPLIB_MAX_PAYLOAD_SIZE)
    {
        return RHSPLIB_ERROR;
    }

    int result = RHSPlib_sendReadCommandInternal(obj, 0x7F07, (const uint8_t*)interfaceName,
                                                  (uint16_t)interfaceNameLength, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    // save discovered interface for further using in device control messages.
    RHSPlib_Module_Interface_T intf_;
    memcpy(intf_.name, interfaceName, interfaceNameLength);
    intf_.firstPacketID  = RHSPLIB_ARRAY_WORD(uint16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    intf_.numberIDValues = RHSPLIB_ARRAY_WORD(uint16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 2);
    addInterface(&obj->interfaceList, &intf_);
    if (intf)
    {
        *intf = intf_;
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_setModuleLEDColor(RHSPlib_Module_T *obj, uint8_t red, uint8_t green, uint8_t blue, uint8_t *nackReasonCode)
{
    uint8_t buffer[3] = {red, green, blue};
    return RHSPlib_sendWriteCommandInternal(obj, 0x7F0A, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_getModuleLEDColor(RHSPlib_Module_T *obj, uint8_t *red, uint8_t *green, uint8_t *blue, uint8_t *nackReasonCode)
{
    int retval = RHSPlib_sendReadCommandInternal(obj, 0x7F0B, NULL, 0, nackReasonCode);
    if (retval >= 0)
    {
        if (red)
        {
            *red   = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
        }
        if (green)
        {
            *green = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1);
        }
        if (blue)
        {
            *blue  = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 2);
        }
    }
    return retval;
}

int RHSPlib_setModuleLEDPattern(RHSPlib_Module_T *obj, const RHSPlib_LEDPattern_T *ledPattern, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(ledPattern);
    if (!ledPattern)
    {
        return RHSPLIB_ERROR;
    }
    uint32_t buffer[16];
    buffer[0] = ledPattern->rgbtPatternStep0;
    buffer[1] = ledPattern->rgbtPatternStep1;
    buffer[2] = ledPattern->rgbtPatternStep2;
    buffer[3] = ledPattern->rgbtPatternStep3;
    buffer[4] = ledPattern->rgbtPatternStep4;
    buffer[5] = ledPattern->rgbtPatternStep5;
    buffer[6] = ledPattern->rgbtPatternStep6;
    buffer[7] = ledPattern->rgbtPatternStep7;
    buffer[8] = ledPattern->rgbtPatternStep8;
    buffer[9] = ledPattern->rgbtPatternStep9;
    buffer[10] = ledPattern->rgbtPatternStep10;
    buffer[11] = ledPattern->rgbtPatternStep11;
    buffer[12] = ledPattern->rgbtPatternStep12;
    buffer[13] = ledPattern->rgbtPatternStep13;
    buffer[14] = ledPattern->rgbtPatternStep14;
    buffer[15] = ledPattern->rgbtPatternStep15;
    return RHSPlib_sendWriteCommandInternal(obj, 0x7F0C, (const uint8_t*)buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_getModuleLEDPattern(RHSPlib_Module_T *obj, RHSPlib_LEDPattern_T *ledPattern, uint8_t *nackReasonCode)
{
    int retval = RHSPlib_sendReadCommandInternal(obj, 0x7F0D, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (ledPattern)
    {
    	ledPattern->rgbtPatternStep0  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    	ledPattern->rgbtPatternStep1  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 4);
    	ledPattern->rgbtPatternStep2  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 8);
    	ledPattern->rgbtPatternStep3  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 12);
    	ledPattern->rgbtPatternStep4  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 16);
    	ledPattern->rgbtPatternStep5  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 20);
    	ledPattern->rgbtPatternStep6  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 24);
    	ledPattern->rgbtPatternStep7  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 28);
    	ledPattern->rgbtPatternStep8  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 32);
    	ledPattern->rgbtPatternStep9  = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 36);
    	ledPattern->rgbtPatternStep10 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 40);
    	ledPattern->rgbtPatternStep11 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 44);
    	ledPattern->rgbtPatternStep12 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 48);
    	ledPattern->rgbtPatternStep13 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 52);
    	ledPattern->rgbtPatternStep14 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 56);
    	ledPattern->rgbtPatternStep15 = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 60);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_setDebugLogLevel(RHSPlib_Module_T *obj, RHSPlib_DebugGroupNumber_T debugGroupNumber,
                                               RHSPlib_VerbosityLevel_T verbosityLevel, uint8_t *nackReasonCode)
{
    uint8_t buffer[2] = {(uint8_t)debugGroupNumber, (uint8_t)verbosityLevel};
    return RHSPlib_sendWriteCommandInternal(obj, 0x7F0E, buffer, sizeof(buffer), nackReasonCode);
}

static int getDiscoveryResult(size_t numberOfParents)
{
    if (numberOfParents == 1)
    {
        return RHSPLIB_RESULT_OK;
    }
    else if (numberOfParents == 0)
    {
        return RHSPLIB_RESULT_DISCOVERY_NO_PARENT_DETECTED;
    }
    return RHSPLIB_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED;
}

int RHSPlib_discovery(RHSPlib_Serial_T *serialPort, RHSPlib_DiscoveredAddresses_T *discoveredAddresses)
{
    RHSPLIB_ASSERT(serialPort);
    RHSPLIB_ASSERT(discoveredAddresses);

    if (!serialPort || !discoveredAddresses)
    {
        return RHSPLIB_ERROR;
    }

    RHSPlib_Module_T module;
    RHSPlib_init(&module);
    module.responseTimeoutMs = RHSPLIB_DISCOVERY_RESPONSE_TIMEOUT_MS;

    int retval = RHSPlib_open(&module, serialPort, RHSPLIB_BROADCAST_ADDRESS);
    if (retval < 0)
    {
        return retval;
    }

    memset(discoveredAddresses, 0, sizeof(*discoveredAddresses));

    // Purge receive buffers to avoid unexpected responses from previous commands
    serialPurgeRxBuffer(module.serialPort);

    /* send discovery message and wait for parent and children responses
     *
     * discovery returns RHSPLIB_RESULT_OK upon completing discovery process.
     * timeout response is considered as normal exiting if we have received at least one discovery response
     * (timeout means "end of discovery")
     *
     * */
    int result = sendPacket(&module, RHSPLIB_BROADCAST_ADDRESS, module.messageNumber, 0, 0x7F0F, NULL, 0);
    if (result < 0)
    {
        RHSPlib_close(&module);
        return result;
    }

    size_t responseCount   = 0;
    size_t numberOfParents = 0;

    while (discoveredAddresses->numberOfChildModules < RHSPLIB_MAX_NUMBER_OF_CHILD_MODULES)
    {
        result = receivePacket(&module);
        if (result < 0)
        {
            RHSPlib_close(&module);
            // timeout response is considered as normal exiting if we have received at least one discovery response
            if (responseCount > 0 && result == RHSPLIB_ERROR_RESPONSE_TIMEOUT)
            {
                /*
                 * We are under normal exiting by timeout when we received at least one discovery response
                 *
                 * at this point, we shall return RHSPLIB_RESULT_DISCOVERY_NO_PARENT_DETECTED, if no parent is found
                 * if we have multiple parents, return RHSPLIB_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED
                 *
                 * */
                return getDiscoveryResult(numberOfParents);
            }
            else
            {
                return result;
            }
        }
        else if (RHSPLIB_PACKET_ID(module.rxBuffer) == 0xFF0F)
        {
            uint8_t packetArrivalWay  = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(module.rxBuffer), 0);
            uint8_t addr              = RHSPLIB_PACKET_SRC_ADDRESS(module.rxBuffer);
            if (packetArrivalWay)
            {
                numberOfParents++;
                discoveredAddresses->parentAddress = addr;
            }
            else
            {
                discoveredAddresses->childAddresses[discoveredAddresses->numberOfChildModules++] = addr;
            }
            responseCount++;
        }
        else
        {
            // @TODO We got non discovery response that may be an erratic module behavior. It could be handled somehow.
            // Now we simply ignore any non discovery response packets
        }
    }

    RHSPlib_close(&module);
    return getDiscoveryResult(numberOfParents);
}

static uint16_t getInterfacePacketID(const RHSPlib_Module_InterfaceList_T *interfaceList,
        							 const char* interfaceName, uint16_t functionNumber)
{
	const RHSPlib_Module_Interface_T *intf = getInterfaceByName(interfaceList, interfaceName);
	if (intf == NULL)
	{
		return RHSPLIB_INTERFACE_INVALID_PACKET_ID;
	}
	if (functionNumber < intf->numberIDValues)
	{
		return intf->firstPacketID + functionNumber;
	}
	return RHSPLIB_INTERFACE_INVALID_PACKET_ID;
}

int RHSPlib_getInterfacePacketID(RHSPlib_Module_T *obj,
                                  const char* interfaceName, uint16_t functionNumber, uint16_t *packetID,
								  uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(interfaceName);
    if (!obj || !interfaceName)
    {
        return RHSPLIB_ERROR;
    }

    uint16_t packet_id = getInterfacePacketID(&obj->interfaceList, interfaceName, functionNumber);
    if (packet_id != RHSPLIB_INTERFACE_INVALID_PACKET_ID)
    {
    	if (packetID)
    	{
    		*packetID = packet_id;
    	}
    	return RHSPLIB_RESULT_OK;
    }
    int retval = RHSPlib_queryInterface(obj, interfaceName, NULL, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    packet_id = getInterfacePacketID(&obj->interfaceList, interfaceName, functionNumber);
	if (packet_id == RHSPLIB_INTERFACE_INVALID_PACKET_ID)
	{
		return RHSPLIB_ERROR_COMMAND_NOT_SUPPORTED;
	}
	if (packetID)
	{
		*packetID = packet_id;
	}
	return RHSPLIB_RESULT_OK;
}


int RHSPlib_sendWriteCommandInternal(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                              	  	  const uint8_t *payload, uint16_t payloadSize, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(payloadSize <= RHSPLIB_MAX_PAYLOAD_SIZE);
    if (payloadSize)
    {
        RHSPLIB_ASSERT(payload);
    }

    if (!obj || (payloadSize > 0 && !payload))
    {
        return RHSPLIB_ERROR;
    }
    if (payloadSize > RHSPLIB_MAX_PAYLOAD_SIZE)
    {
        return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    if (!RHSPlib_isOpened(obj))
    {
        return RHSPLIB_ERROR_NOT_OPENED;
    }

    int retval = sendCommand(obj, obj->dstAddress, packetTypeID, payload, payloadSize);
    if (retval < 0)
    {
        return retval;
    }
    return validateWriteCommand(obj, nackReasonCode);
}

int RHSPlib_sendWriteCommand(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                              const uint8_t *payload, uint16_t payloadSize,
                              RHSPlib_PayloadData_T *responsePayloadData, uint8_t *nackReasonCode)
{
    int retval = RHSPlib_sendWriteCommandInternal(obj, packetTypeID, payload, payloadSize, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    fillPayloadData(obj, responsePayloadData);

    return retval;
}


int RHSPlib_sendReadCommandInternal(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                                     const uint8_t *payload, uint16_t payloadSize, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(payloadSize <= RHSPLIB_MAX_PAYLOAD_SIZE);
    if (payloadSize)
    {
        RHSPLIB_ASSERT(payload);
    }

    if (!obj || (payloadSize > 0 && !payload))
    {
        return RHSPLIB_ERROR;
    }
    if (payloadSize > RHSPLIB_MAX_PAYLOAD_SIZE)
    {
        return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    if (!RHSPlib_isOpened(obj))
    {
        return RHSPLIB_ERROR_NOT_OPENED;
    }

    int retval = sendCommand(obj, obj->dstAddress, packetTypeID, payload, payloadSize);
    if (retval < 0)
    {
        return retval;
    }
    return validateReadCommand(obj, nackReasonCode);
}


int RHSPlib_sendReadCommand(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                            const uint8_t *payload, uint16_t payloadSize,
                            RHSPlib_PayloadData_T *responsePayloadData, uint8_t *nackReasonCode)
{

    int retval = RHSPlib_sendReadCommandInternal(obj, packetTypeID, payload, payloadSize, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    fillPayloadData(obj, responsePayloadData);

    return retval;
}

static void fillPayloadData(const RHSPlib_Module_T *obj, RHSPlib_PayloadData_T *payload)
{
	// we've checked buffer overflow in receive logic hence an assert is enough
	RHSPLIB_ASSERT(RHSPLIB_PACKET_SIZE(obj->rxBuffer) >= (RHSPLIB_PACKET_HEADER_SIZE + RHSPLIB_PACKET_CRC_SIZE));
	size_t size = RHSPLIB_PACKET_SIZE(obj->rxBuffer) - RHSPLIB_PACKET_HEADER_SIZE - RHSPLIB_PACKET_CRC_SIZE;
	RHSPLIB_ASSERT(size <= RHSPLIB_MAX_PAYLOAD_SIZE);

	if (payload)
	{
		memcpy(payload->data, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), size);
		payload->size = (uint16_t)size;
	}
}


static void addInterface(RHSPlib_Module_InterfaceList_T *list,
                         const RHSPlib_Module_Interface_T *intf)
{
    /* probably we need return an error if the list is full */
    if (list->numberOfInterfaces >= RHSPLIB_MAX_NUMBER_OF_INTERFACES)
    {
        return;
    }
    /* check whether interface is already added and return if we have already discovered interface */
    if (getInterfaceByName(list, intf->name))
    {
        return;
    }
    list->interfaces[list->numberOfInterfaces++] = *intf;
}


static const RHSPlib_Module_Interface_T *getInterfaceByName(const RHSPlib_Module_InterfaceList_T *list,
                                                             const char *interfaceName)
{
    for (size_t i = 0; i < list->numberOfInterfaces; i++)
    {
        if (strcmp(interfaceName, list->interfaces[i].name) == 0)
        {
            return &list->interfaces[i];
        }
    }
    return NULL;
}


static int sendCommand(RHSPlib_Module_T *obj, uint8_t destAddr, uint16_t packetTypeID,
                         const uint8_t *payload, uint16_t payloadSize)
{
	// Purge receive buffers to avoid unexpected responses from previous commands
	serialPurgeRxBuffer(obj->serialPort);

    // send command and wait for response
    int result = sendPacket(obj, destAddr, obj->messageNumber, 0, packetTypeID, payload, payloadSize);
    if (result < 0)
    {
        return result;
    }
    // we should increment message number upon successful data transfer
    // otherwise we may get unexpected response when we send a new message with the same messageNumber
    obj->messageNumber++;
	if (obj->messageNumber == 0)
	{
		obj->messageNumber = 1;
	}
    result = receivePacket(obj);
    if (result < 0)
    {
        return result;
    }
    // transaction was successful.
    // check whether the response match sent command
    if (obj->rxBuffer[7] != obj->txBuffer[6])
    {
        return RHSPLIB_ERROR_MSG_NUMBER_MISMATCH;
    }

    return RHSPLIB_RESULT_OK;
}

static int sendPacket(RHSPlib_Module_T *obj, uint8_t destAddr, uint8_t messageNumber, uint8_t referenceNumber,
                      uint16_t packetTypeId, const uint8_t *payload, uint16_t payloadSize)
{
    // @TODO Create macro for magic numbers like LIBREFHI_OFFSET_FIRST_BYTE, etc
    obj->txBuffer[0] = 0x44;
    obj->txBuffer[1] = 0x4B;
    uint16_t bytesToSend = RHSPLIB_PACKET_HEADER_SIZE + payloadSize + RHSPLIB_PACKET_CRC_SIZE;
    // @TODO implement function to make uint16 from two uint8 values
    obj->txBuffer[2] = (uint8_t)bytesToSend;
    obj->txBuffer[3] = (uint8_t)(bytesToSend >> 8);
    obj->txBuffer[4] = destAddr;
    obj->txBuffer[5] = obj->srcAddress;
    obj->txBuffer[6] = messageNumber;
    obj->txBuffer[7] = referenceNumber;
    // @TODO implement function to make uint16 from two uint8 values
    obj->txBuffer[8] = (uint8_t)packetTypeId;
    obj->txBuffer[9] = (uint8_t)(packetTypeId >> 8);
    if (payload && payloadSize)
    {
        memcpy(&obj->txBuffer[10], payload, payloadSize);
    }
    obj->txBuffer[10 + payloadSize] = calcChecksum(obj->txBuffer, RHSPLIB_PACKET_HEADER_SIZE + payloadSize);

    // @TODO we may need tx timeout. Possibly on some systems we won't able to transfer whole buffer during one transaction.
    int retval = serialWrite(obj->serialPort, obj->txBuffer, bytesToSend);
    if (retval >= 0)
    {
        // normally serial write always write whole buffer and an assert is enough to check whether we send whole buffer
        RHSPLIB_ASSERT(retval == (int)bytesToSend);
    }
    return (retval < 0) ? retval: RHSPLIB_RESULT_OK;
}

/**
 * Receives packet with timeout
 *
 * returns RHSPLIB_RESULT_OK if the packet has been received and checksum is correct
 *         RHSPLIB_ERROR_RESPONSE_TIMEOUT if there is no any packet during response timeout
 *         RHSPLIB_ERROR_SERIALPORT if serial port returns an error
 *
 * */
static int receivePacket(RHSPlib_Module_T *obj)
{
    int parseResult;
    int retval = RHSPLIB_RESULT_OK;
    /* reset receiving logic */
    obj->rxState = RHSPLIB_RX_STATES_FIRST_BYTE;

    uint32_t responseTimeoutMsTimestamp = RHSPlib_time_getSteadyClockMs();

    while ((parseResult = parse(obj)) == 0)
    {
        /* process timeout*/
        if (RHSPlib_time_getSteadyClockMs() - responseTimeoutMsTimestamp >= obj->responseTimeoutMs && obj->responseTimeoutMs != 0)
        {
            /* no response is received. return timeout error. */
            retval = RHSPLIB_ERROR_RESPONSE_TIMEOUT;
            break;
        }
    }

    return (parseResult < 0) ? parseResult : retval;
}

// The function parses received bytes and return 1 if the packet is received and checksum is correct.
// zero return value means that the receiving is in progress
// if serial port returns and error, the parse will exit with RHSPLIB_ERROR_SERIALPORT
static int parse(RHSPlib_Module_T *obj)
{
    uint16_t packetLength;
    uint16_t payloadSize;
    int bytesTransferred;
    int retval = 0;

    switch(obj->rxState)
    {
        case RHSPLIB_RX_STATES_FIRST_BYTE:
            bytesTransferred = serialRead(obj->serialPort, &obj->rxBuffer[0], 1);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }
            // @TODO First and second bytes should be replaced by macro like RHSPLIB_PACKET_FIRST_BYTE
            if (bytesTransferred != 1 || obj->rxBuffer[0] != 0x44)
            {
                break;
            }
            obj->rxState = RHSPLIB_RX_STATES_SECOND_BYTE;
            // fall through
            // break;

        case RHSPLIB_RX_STATES_SECOND_BYTE:
            bytesTransferred = serialRead(obj->serialPort, &obj->rxBuffer[1], 1);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            if (bytesTransferred != 1 || obj->rxBuffer[1] != 0x4B)
            {
                obj->rxState = RHSPLIB_RX_STATES_FIRST_BYTE;
                break;
            }
            obj->receivedBytes  = 2;
            // we have received two bytes already and must receive remaining header bytes
            obj->bytesToReceive = RHSPLIB_PACKET_HEADER_SIZE - 2;
            obj->rxState = RHSPLIB_RX_STATES_HEADER;

            // fall through
            //break;

        case RHSPLIB_RX_STATES_HEADER:
            bytesTransferred = serialRead(obj->serialPort, &obj->rxBuffer[obj->receivedBytes], obj->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            obj->bytesToReceive -= (size_t)bytesTransferred;
            obj->receivedBytes += (size_t)bytesTransferred;
            if (obj->bytesToReceive > 0)
            {
                break;
            }
            packetLength = RHSPLIB_PACKET_SIZE(obj->rxBuffer);

            // reset receiveing logic if the payload is out of range. We may get and error and should reset the logic.
            if (packetLength < RHSPLIB_PACKET_HEADER_SIZE + RHSPLIB_PACKET_CRC_SIZE ||
                packetLength > RHSPLIB_BUFFER_SIZE)
            {
                obj->rxState = RHSPLIB_RX_STATES_FIRST_BYTE;
                break;
            }

            payloadSize = packetLength - (RHSPLIB_PACKET_HEADER_SIZE + RHSPLIB_PACKET_CRC_SIZE);
            if (payloadSize > 0)
            {
                obj->bytesToReceive = payloadSize;
                obj->rxState        = RHSPLIB_RX_STATES_PAYLOAD;
            }
            else
            {
                obj->bytesToReceive = RHSPLIB_PACKET_CRC_SIZE;
                obj->rxState        = RHSPLIB_RX_STATES_CRC;
            }
            break;

        case RHSPLIB_RX_STATES_PAYLOAD:
            bytesTransferred = serialRead(obj->serialPort, &obj->rxBuffer[obj->receivedBytes], obj->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }
            obj->bytesToReceive -= (size_t)bytesTransferred;
            obj->receivedBytes += (size_t)bytesTransferred;
            if (obj->bytesToReceive > 0)
            {
                break;
            }
            obj->bytesToReceive = RHSPLIB_PACKET_CRC_SIZE;
            obj->rxState        = RHSPLIB_RX_STATES_CRC;

            // fall through
            // break;
        case RHSPLIB_RX_STATES_CRC:
            bytesTransferred = serialRead(obj->serialPort, &obj->rxBuffer[obj->receivedBytes], obj->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            obj->bytesToReceive -= (size_t)bytesTransferred;
            //obj->receivedBytes += bytesTransferred;
            if (obj->bytesToReceive > 0)
            {
                break;
            }
            if (calcChecksum(obj->rxBuffer, obj->receivedBytes) == obj->rxBuffer[obj->receivedBytes])
            {
                retval = 1;
            }
            obj->rxState = RHSPLIB_RX_STATES_FIRST_BYTE;
            break;
        default:
            /* Normally we don't reach the default section */
            RHSPLIB_ASSERT(0);
            break;
    }
    return retval;
}


static bool isAckReceived(RHSPlib_Module_T *obj, bool *isAttentionRequired)
{
    RHSPLIB_ASSERT(obj);

    if (RHSPLIB_PACKET_IS_ACK(obj->rxBuffer))
    {
        if (isAttentionRequired)
        {
            *isAttentionRequired = (bool)RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer)[0];
        }
        return true;
    }
    return false;
}


static bool isNackReceived(RHSPlib_Module_T *obj, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);

    if (RHSPLIB_PACKET_IS_NACK(obj->rxBuffer))
    {
        if (nackReasonCode)
        {
            *nackReasonCode = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer)[0];
        }
        return true;
    }
    return false;
}


static int validateWriteCommand(RHSPlib_Module_T *obj, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);

    bool isAttentionRequired = false;
    if (isAckReceived(obj, &isAttentionRequired))
    {

        return (isAttentionRequired == true )? RHSPLIB_RESULT_ATTENTION_REQUIRED : RHSPLIB_RESULT_OK;
    }
    else if (isNackReceived(obj, nackReasonCode))
    {
        return RHSPLIB_ERROR_NACK_RECEIVED;
    }
    return RHSPLIB_ERROR_UNEXPECTED_RESPONSE;
}


static int validateReadCommand(RHSPlib_Module_T *obj, uint8_t *nackReasonCode)
{
    RHSPLIB_ASSERT(obj);

    if (RHSPLIB_PACKET_ID(obj->rxBuffer) == (RHSPLIB_PACKET_ID(obj->txBuffer) | 0x8000))
    {
        return RHSPLIB_RESULT_OK;
    }
    else if (isNackReceived(obj, nackReasonCode))
    {
        return RHSPLIB_ERROR_NACK_RECEIVED;
    }
    return RHSPLIB_ERROR_UNEXPECTED_RESPONSE;
}


static uint8_t calcChecksum(const uint8_t *buffer, size_t bufferSize)
{
    uint8_t sum = 0;
    for (size_t i = 0; i < bufferSize; i++)
    {
        sum += buffer[i];
    }
    return sum;
}

static int serialWrite(RHSPlib_Serial_T *serialPort, const uint8_t *buffer, size_t bytesToWrite)
{
    int bytes_transferred;

    size_t bytes_to_write = bytesToWrite;
    size_t bytes_written  = 0;

    while (bytes_to_write > 0)
    {
        bytes_transferred = RHSPlib_serial_write(serialPort, &buffer[bytes_written], bytes_to_write);
        if (bytes_transferred < 0)
        {
            // @TODO to get extended error we should add a function into serial port that will return serial port error
            return RHSPLIB_ERROR_SERIALPORT;
        }
        bytes_to_write -= (size_t)bytes_transferred;
        bytes_written  += (size_t)bytes_transferred;
    }

    return (int)bytes_written;
}

static int serialRead(RHSPlib_Serial_T *serialPort, uint8_t *buffer, size_t bytesToRead)
{
    int retval = RHSPlib_serial_read(serialPort, buffer, bytesToRead);
    return (retval < 0)? RHSPLIB_ERROR_SERIALPORT : retval;
}

static void serialPurgeRxBuffer(RHSPlib_Serial_T *serialPort)
{
	uint8_t buffer[64];
	int retval;

	// read out rx buffer until becomes empty
	while ((retval = serialRead(serialPort, buffer, sizeof(buffer))) > 0)
	{
	}
}
