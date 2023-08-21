
#include "internal/command.h"
#include "rhsp/revhub.h"
#include "rhsp/compiler.h"
#include "internal/packet.h"
#include "internal/revhub.h"

static bool isAckReceived(RhspRevHubInternal* hub, bool* isAttentionRequired)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    if (RHSP_PACKET_IS_ACK(hub->rxBuffer))
    {
        if (isAttentionRequired)
        {
            *isAttentionRequired = (bool) RHSP_PACKET_PAYLOAD_PTR(hub->rxBuffer)[0];
        }
        return true;
    }
    return false;
}

static bool isNackReceived(RhspRevHubInternal* hub, uint8_t* nackReasonCode)
{
    if (!hub)
    {
        return RHSP_ERROR;
    }

    if (RHSP_PACKET_IS_NACK(hub->rxBuffer))
    {
        if (nackReasonCode)
        {
            *nackReasonCode = RHSP_PACKET_PAYLOAD_PTR(hub->rxBuffer)[0];
        }
        return true;
    }
    return false;
}

static int validateWriteCommand(RhspRevHub* hub, uint8_t* nackReasonCode)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    bool isAttentionRequired = false;
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    if (isAckReceived(internalHub, &isAttentionRequired))
    {
        return (isAttentionRequired == true) ? RHSP_RESULT_ATTENTION_REQUIRED : RHSP_RESULT_OK;
    } else if (isNackReceived(internalHub, nackReasonCode))
    {
        return RHSP_ERROR_NACK_RECEIVED;
    }
    return RHSP_ERROR_UNEXPECTED_RESPONSE;
}

static int validateReadCommand(RhspRevHubInternal* hub, uint8_t* nackReasonCode)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    if (RHSP_PACKET_ID(hub->rxBuffer) == (RHSP_PACKET_ID(hub->txBuffer) | 0x8000))
    {
        return RHSP_RESULT_OK;
    } else if (isNackReceived(hub, nackReasonCode))
    {
        return RHSP_ERROR_NACK_RECEIVED;
    }
    return RHSP_ERROR_UNEXPECTED_RESPONSE;
}

int sendCommand(RhspRevHubInternal* hub,
                uint8_t destAddr,
                uint16_t packetTypeID,
                const uint8_t* payload,
                uint16_t payloadSize)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    // Purge receive buffers to avoid unexpected responses from previous commands
    serialPurgeRxBuffer(hub->serialPort);

    // send command and wait for response
    int result = sendPacket(hub, destAddr, hub->messageNumber, 0, packetTypeID, payload, payloadSize);
    if (result < 0)
    {
        return result;
    }
    // we should increment message number upon successful data transfer
    // otherwise we may get unexpected response when we send a new message with the same messageNumber
    hub->messageNumber++;
    if (hub->messageNumber == 0)
    {
        hub->messageNumber = 1;
    }
    result = receivePacket(hub);
    if (result < 0)
    {
        return result;
    }
    // transaction was successful.
    // check whether the response match sent command
    if (hub->rxBuffer[7] != hub->txBuffer[6])
    {
        return RHSP_ERROR_MSG_NUMBER_MISMATCH;
    }

    return RHSP_RESULT_OK;
}

int rhsp_sendReadCommandInternal(RhspRevHub* hub,
                                 uint16_t packetTypeID,
                                 const uint8_t* payload,
                                 uint16_t payloadSize,
                                 uint8_t* nackReasonCode)
{
    rhsp_assert(payloadSize <= RHSP_MAX_PAYLOAD_SIZE);
    if (payloadSize)
    {
        rhsp_assert(payload);
    }

    if (!hub || (payloadSize > 0 && !payload))
    {
        return RHSP_ERROR;
    }
    if (payloadSize > RHSP_MAX_PAYLOAD_SIZE)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    if (!rhsp_isOpened(hub))
    {
        return RHSP_ERROR_NOT_OPENED;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    int retval = sendCommand(internalHub, internalHub->address, packetTypeID, payload, payloadSize);
    if (retval < 0)
    {
        return retval;
    }
    return validateReadCommand(internalHub, nackReasonCode);
}

int rhsp_sendWriteCommandInternal(RhspRevHub* hub,
                                  uint16_t packetTypeID,
                                  const uint8_t* payload,
                                  uint16_t payloadSize,
                                  uint8_t* nackReasonCode)
{
    rhsp_assert(payloadSize <= RHSP_MAX_PAYLOAD_SIZE);
    if (payloadSize)
    {
        rhsp_assert(payload);
    }

    if (!hub || (payloadSize > 0 && !payload))
    {
        return RHSP_ERROR;
    }
    if (payloadSize > RHSP_MAX_PAYLOAD_SIZE)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    if (!rhsp_isOpened(hub))
    {
        return RHSP_ERROR_NOT_OPENED;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    int retval = sendCommand(internalHub, internalHub->address, packetTypeID, payload, payloadSize);
    if (retval < 0)
    {
        return retval;
    }
    return validateWriteCommand(hub, nackReasonCode);
}

int rhsp_sendWriteCommand(RhspRevHub* hub,
                          uint16_t packetTypeID,
                          const uint8_t* payload,
                          uint16_t payloadSize,
                          RhspPayloadData* responsePayloadData,
                          uint8_t* nackReasonCode)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_sendWriteCommandInternal(hub, packetTypeID, payload, payloadSize, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    fillPayloadData((const RhspRevHubInternal*) hub, responsePayloadData);

    return retval;
}

int rhsp_sendReadCommand(RhspRevHub* hub,
                         uint16_t packetTypeID,
                         const uint8_t* payload,
                         uint16_t payloadSize,
                         RhspPayloadData* responsePayloadData,
                         uint8_t* nackReasonCode)
{
    if(!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_sendReadCommandInternal(hub, packetTypeID, payload, payloadSize, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    fillPayloadData((const RhspRevHubInternal*) hub, responsePayloadData);

    return retval;
}

