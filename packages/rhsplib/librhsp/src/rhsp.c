/**
 * rhsp.c
 *
 *  Created on: Nov 25, 2020
 *  Author: Andrey Mihadyuk
 */
#include <string.h>

#include "rhsp/rhsp.h"
#include "internal/arrayutils.h"
#include "internal/command.h"
#include "internal/packet.h"

#define RHSP_BROADCAST_ADDRESS              0xFF

int rhsp_setResponseTimeoutMs(RhspRevHub* hub, uint32_t responseTimeoutMs)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    internalHub->responseTimeoutMs = responseTimeoutMs;

    return 0;
}

uint32_t rhsp_responseTimeoutMs(const RhspRevHub* hub)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    return internalHub->responseTimeoutMs;
}

int rhsp_getModuleStatus(RhspRevHub* hub,
                         uint8_t clearStatusAfterResponse,
                         RhspModuleStatus* status,
                         uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (clearStatusAfterResponse > 1)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_sendReadCommandInternal(hub, 0x7F03,
                                              &clearStatusAfterResponse, sizeof(clearStatusAfterResponse),
                                              nackReasonCode);
    if (result < 0)
    {
        return result;
    }
    if (status)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        const uint8_t* payload = RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer);
        status->statusWord = RHSP_ARRAY_BYTE(uint8_t, payload, 0);
        status->motorAlerts = RHSP_ARRAY_BYTE(uint8_t, payload, 1);
    }
    return RHSP_RESULT_OK;
}

int rhsp_sendKeepAlive(RhspRevHub* hub, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    return rhsp_sendWriteCommandInternal(hub, 0x7F04, NULL, 0, nackReasonCode);
}

int rhsp_sendFailSafe(RhspRevHub* hub, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    return rhsp_sendWriteCommandInternal(hub, 0x7F05, NULL, 0, nackReasonCode);
}

int rhsp_setNewModuleAddress(RhspRevHub* hub, uint8_t newModuleAddress, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (newModuleAddress == 0 || newModuleAddress == 0xFF)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int result = rhsp_sendWriteCommandInternal(hub, 0x7F06, &newModuleAddress, sizeof(newModuleAddress),
                                         nackReasonCode);

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    if(result >= 0) {
        internalHub->address = newModuleAddress;
    }

    return result;
}

int rhsp_setModuleLedColor(RhspRevHub* hub, uint8_t red, uint8_t green, uint8_t blue, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    uint8_t buffer[3] = {red, green, blue};
    return rhsp_sendWriteCommandInternal(hub, 0x7F0A, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getModuleLedColor(RhspRevHub* hub,
                           uint8_t* red,
                           uint8_t* green,
                           uint8_t* blue,
                           uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    int retval = rhsp_sendReadCommandInternal(hub, 0x7F0B, NULL, 0, nackReasonCode);
    if (retval >= 0)
    {
        if (red)
        {
            *red = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
        }
        if (green)
        {
            *green = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
        }
        if (blue)
        {
            *blue = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 2);
        }
    }
    return retval;
}

int rhsp_setModuleLedPattern(RhspRevHub* hub, const RhspLedPattern* ledPattern, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (!ledPattern)
    {
        return RHSP_ERROR;
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
    return rhsp_sendWriteCommandInternal(hub, 0x7F0C, (const uint8_t*) buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getModuleLedPattern(RhspRevHub* hub, RhspLedPattern* ledPattern, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_sendReadCommandInternal(hub, 0x7F0D, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (ledPattern)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        ledPattern->rgbtPatternStep0 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
        ledPattern->rgbtPatternStep1 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 4);
        ledPattern->rgbtPatternStep2 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 8);
        ledPattern->rgbtPatternStep3 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 12);
        ledPattern->rgbtPatternStep4 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 16);
        ledPattern->rgbtPatternStep5 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 20);
        ledPattern->rgbtPatternStep6 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 24);
        ledPattern->rgbtPatternStep7 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 28);
        ledPattern->rgbtPatternStep8 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 32);
        ledPattern->rgbtPatternStep9 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 36);
        ledPattern->rgbtPatternStep10 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 40);
        ledPattern->rgbtPatternStep11 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 44);
        ledPattern->rgbtPatternStep12 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 48);
        ledPattern->rgbtPatternStep13 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 52);
        ledPattern->rgbtPatternStep14 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 56);
        ledPattern->rgbtPatternStep15 = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 60);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setDebugLogLevel(RhspRevHub* hub,
                          RhspDebugGroupNumber debugGroupNumber,
                          RhspVerbosityLevel verbosityLevel,
                          uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }
    uint8_t buffer[2] = {(uint8_t) debugGroupNumber, (uint8_t) verbosityLevel};
    return rhsp_sendWriteCommandInternal(hub, 0x7F0E, buffer, sizeof(buffer), nackReasonCode);
}

static int getDiscoveryResult(size_t numberOfParents)
{
    if (numberOfParents == 1)
    {
        return RHSP_RESULT_OK;
    } else if (numberOfParents == 0)
    {
        /*
         * If the parent wasn't found, there shouldn't be any children found, and even if there were, we couldn't
         * communicate with them unless the parent is communicated with first, which isn't possible since we don't know
         * it's address
         */
        return RHSP_ERROR_NO_HUBS_DISCOVERED;
    }
    return RHSP_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED;
}

int rhsp_discoverRevHubs(RhspSerial* serialPort, RhspDiscoveredAddresses* discoveredAddresses)
{
    if (!serialPort || !discoveredAddresses)
    {
        return RHSP_ERROR;
    }

    RhspRevHubInternal* module = (RhspRevHubInternal*) rhsp_allocRevHub(serialPort, RHSP_BROADCAST_ADDRESS);
    module->responseTimeoutMs = RHSP_DISCOVERY_RESPONSE_TIMEOUT_MS;

    memset(discoveredAddresses, 0, sizeof(*discoveredAddresses));

    // Purge receive buffers to avoid unexpected responses from previous commands
    serialPurgeRxBuffer(module->serialPort);

    /* send discovery message and wait for parent and children responses
     *
     * discovery returns RHSP_RESULT_OK upon completing discovery process.
     * timeout response is considered as normal exiting if we have received at least one discovery response
     * (timeout means "end of discovery")
     *
     * */
    int result = sendPacket(module, RHSP_BROADCAST_ADDRESS, module->messageNumber, 0, 0x7F0F, NULL, 0);
    if (result < 0)
    {
        rhsp_close((RhspRevHub*) module);
        freeRevHub((RhspRevHub*) module);
        return result;
    }

    size_t responseCount = 0;
    size_t numberOfParents = 0;

    while (discoveredAddresses->numberOfChildModules < RHSP_MAX_NUMBER_OF_CHILD_MODULES)
    {
        result = receivePacket(module);
        if (result < 0)
        {
            rhsp_close((RhspRevHub*) module);
            freeRevHub((RhspRevHub*) module);
            // timeout response is considered as normal exiting
            if (result == RHSP_ERROR_RESPONSE_TIMEOUT)
            {
                /*
                 * Discovery will always time out unless the max number of children is present, so this is the typical
                 * exit path.
                 *
                 * At this point, we shall return RHSP_ERROR_NO_HUBS_DISCOVERED if no parent is found,
                 * RHSP_RESULT_OK if exactly one parent is found, and RHSP_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED
                 * if multiple parents are found.
                 */
                return getDiscoveryResult(numberOfParents);
            } else
            {
                return result;
            }
        } else if (RHSP_PACKET_ID(module->rxBuffer) == 0xFF0F)
        {
            uint8_t packetArrivalWay = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(module->rxBuffer), 0);
            uint8_t addr = RHSP_PACKET_SRC_ADDRESS(module->rxBuffer);
            if (packetArrivalWay)
            {
                numberOfParents++;
                discoveredAddresses->parentAddress = addr;
            } else
            {
                discoveredAddresses->childAddresses[discoveredAddresses->numberOfChildModules++] = addr;
            }
            responseCount++;
        } else
        {
            // @TODO We got non discovery response that may be an erratic module behavior. It could be handled somehow.
            // Now we simply ignore any non discovery response packets
        }
    }

    rhsp_close((RhspRevHub*) module);
    freeRevHub((RhspRevHub*) module);
    return getDiscoveryResult(numberOfParents);
}
