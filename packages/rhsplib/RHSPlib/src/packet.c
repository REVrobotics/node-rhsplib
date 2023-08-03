
#include <memory.h>
#include "internal/packet.h"
#include "rhsp/revhub.h"
#include "rhsp/compiler.h"
#include "rhsp/time.h"

#define RHSP_HOST_ADDRESS                   0x00 // host address.

static int serialWrite(RhspSerial* serialPort, const uint8_t* buffer, size_t bytesToWrite)
{
    int bytes_transferred;

    size_t bytes_to_write = bytesToWrite;
    size_t bytes_written = 0;

    while (bytes_to_write > 0)
    {
        bytes_transferred = rhsp_serialWrite(serialPort, &buffer[bytes_written], bytes_to_write);
        if (bytes_transferred < 0)
        {
            // @TODO to get extended error we should add a function into serial port that will return serial port error
            return RHSP_ERROR_SERIALPORT;
        }
        bytes_to_write -= (size_t) bytes_transferred;
        bytes_written += (size_t) bytes_transferred;
    }

    return (int) bytes_written;
}

static int serialRead(RhspSerial* serialPort, uint8_t* buffer, size_t bytesToRead)
{
    int retval = rhsp_serialRead(serialPort, buffer, bytesToRead);
    return (retval < 0) ? RHSP_ERROR_SERIALPORT : retval;
}

void serialPurgeRxBuffer(RhspSerial* serialPort)
{
    uint8_t buffer[64];
    // read out rx buffer until becomes empty
    while (serialRead(serialPort, buffer, sizeof(buffer)) > 0)
    {
    }
}

static uint8_t calcChecksum(const uint8_t* buffer, size_t bufferSize)
{
    uint8_t sum = 0;
    for (size_t i = 0; i < bufferSize; i++)
    {
        sum += buffer[i];
    }
    return sum;
}

// The function parses received bytes and return 1 if the packet is received and checksum is correct.
// zero return value means that the receiving is in progress
// if serial port returns and error, the parse will exit with RHSP_ERROR_SERIALPORT
static int parse(RhspRevHubInternal* hub)
{
    uint16_t packetLength;
    uint16_t payloadSize;
    int bytesTransferred;
    int retval = 0;

    switch (hub->rxState)
    {
        case RHSP_RX_STATES_FIRST_BYTE:
            bytesTransferred = serialRead(hub->serialPort, &hub->rxBuffer[0], 1);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }
            // @TODO First and second bytes should be replaced by macro like RHSP_PACKET_FIRST_BYTE
            if (bytesTransferred != 1 || hub->rxBuffer[0] != 0x44)
            {
                break;
            }
            hub->rxState = RHSP_RX_STATES_SECOND_BYTE;
            // fall through
            // break;

        case RHSP_RX_STATES_SECOND_BYTE:
            bytesTransferred = serialRead(hub->serialPort, &hub->rxBuffer[1], 1);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            if (bytesTransferred != 1 || hub->rxBuffer[1] != 0x4B)
            {
                hub->rxState = RHSP_RX_STATES_FIRST_BYTE;
                break;
            }
            hub->receivedBytes = 2;
            // we have received two bytes already and must receive remaining header bytes
            hub->bytesToReceive = RHSP_PACKET_HEADER_SIZE - 2;
            hub->rxState = RHSP_RX_STATES_HEADER;

            // fall through
            //break;

        case RHSP_RX_STATES_HEADER:
            bytesTransferred = serialRead(hub->serialPort, &hub->rxBuffer[hub->receivedBytes], hub->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            hub->bytesToReceive -= (size_t) bytesTransferred;
            hub->receivedBytes += (size_t) bytesTransferred;
            if (hub->bytesToReceive > 0)
            {
                break;
            }
            packetLength = RHSP_PACKET_SIZE(hub->rxBuffer);

            // reset receiveing logic if the payload is out of range. We may get and error and should reset the logic.
            if (packetLength < RHSP_PACKET_HEADER_SIZE + RHSP_PACKET_CRC_SIZE ||
                packetLength > RHSP_BUFFER_SIZE)
            {
                hub->rxState = RHSP_RX_STATES_FIRST_BYTE;
                break;
            }

            payloadSize = packetLength - (RHSP_PACKET_HEADER_SIZE + RHSP_PACKET_CRC_SIZE);
            if (payloadSize > 0)
            {
                hub->bytesToReceive = payloadSize;
                hub->rxState = RHSP_RX_STATES_PAYLOAD;
            } else
            {
                hub->bytesToReceive = RHSP_PACKET_CRC_SIZE;
                hub->rxState = RHSP_RX_STATES_CRC;
            }
            break;

        case RHSP_RX_STATES_PAYLOAD:
            bytesTransferred = serialRead(hub->serialPort, &hub->rxBuffer[hub->receivedBytes], hub->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }
            hub->bytesToReceive -= (size_t) bytesTransferred;
            hub->receivedBytes += (size_t) bytesTransferred;
            if (hub->bytesToReceive > 0)
            {
                break;
            }
            hub->bytesToReceive = RHSP_PACKET_CRC_SIZE;
            hub->rxState = RHSP_RX_STATES_CRC;

            // fall through
            // break;
        case RHSP_RX_STATES_CRC:
            bytesTransferred = serialRead(hub->serialPort, &hub->rxBuffer[hub->receivedBytes], hub->bytesToReceive);
            if (bytesTransferred < 0)
            {
                return bytesTransferred;
            }

            hub->bytesToReceive -= (size_t) bytesTransferred;
            //hub->receivedBytes += bytesTransferred;
            if (hub->bytesToReceive > 0)
            {
                break;
            }
            if (calcChecksum(hub->rxBuffer, hub->receivedBytes) == hub->rxBuffer[hub->receivedBytes])
            {
                retval = 1;
            }
            hub->rxState = RHSP_RX_STATES_FIRST_BYTE;
            break;
        default:
            /* Normally we don't reach the default section */
            break;
    }
    return retval;
}

int sendPacket(RhspRevHubInternal* hub,
               uint8_t destAddr,
               uint8_t messageNumber,
               uint8_t referenceNumber,
               uint16_t packetTypeId,
               const uint8_t* payload,
               uint16_t payloadSize)
{
    // @TODO Create macro for magic numbers like LIBREFHI_OFFSET_FIRST_BYTE, etc
    hub->txBuffer[0] = 0x44;
    hub->txBuffer[1] = 0x4B;
    uint16_t bytesToSend = RHSP_PACKET_HEADER_SIZE + payloadSize + RHSP_PACKET_CRC_SIZE;
    // @TODO implement function to make uint16 from two uint8 values
    hub->txBuffer[2] = (uint8_t) bytesToSend;
    hub->txBuffer[3] = (uint8_t) (bytesToSend >> 8);
    hub->txBuffer[4] = destAddr;
    hub->txBuffer[5] = RHSP_HOST_ADDRESS;
    hub->txBuffer[6] = messageNumber;
    hub->txBuffer[7] = referenceNumber;
    // @TODO implement function to make uint16 from two uint8 values
    hub->txBuffer[8] = (uint8_t) packetTypeId;
    hub->txBuffer[9] = (uint8_t) (packetTypeId >> 8);
    if (payload && payloadSize)
    {
        memcpy(&hub->txBuffer[10], payload, payloadSize);
    }
    hub->txBuffer[10 + payloadSize] = calcChecksum(hub->txBuffer, RHSP_PACKET_HEADER_SIZE + payloadSize);

    // @TODO we may need tx timeout. Possibly on some systems we won't able to transfer whole buffer during one transaction.
    int retval = serialWrite(hub->serialPort, hub->txBuffer, bytesToSend);
    if (retval >= 0)
    {
        // normally serial write always write whole buffer and an assert is enough to check whether we send whole buffer
        rhsp_assert(retval == (int) bytesToSend);
    }
    return (retval < 0) ? retval : RHSP_RESULT_OK;
}

/**
 * Receives packet with timeout
 *
 * returns RHSP_RESULT_OK if the packet has been received and checksum is correct
 *         RHSP_ERROR_RESPONSE_TIMEOUT if there is no any packet during response timeout
 *         RHSP_ERROR_SERIALPORT if serial port returns an error
 *
 * */
int receivePacket(RhspRevHubInternal* hub)
{
    int parseResult;
    int retval = RHSP_RESULT_OK;
    /* reset receiving logic */
    hub->rxState = RHSP_RX_STATES_FIRST_BYTE;

    uint32_t responseTimeoutMsTimestamp = rhsp_getSteadyClockMs();

    while ((parseResult = parse(hub)) == 0)
    {
        /* process timeout*/
        if (rhsp_getSteadyClockMs() - responseTimeoutMsTimestamp >= hub->responseTimeoutMs &&
            hub->responseTimeoutMs != 0)
        {
            /* no response is received. return timeout error. */
            retval = RHSP_ERROR_RESPONSE_TIMEOUT;
            break;
        }
    }

    return (parseResult < 0) ? parseResult : retval;
}

void fillPayloadData(const RhspRevHubInternal* hub, RhspPayloadData* payload)
{
    // we've checked buffer overflow in receive logic hence an assert is enough
    rhsp_assert(RHSP_PACKET_SIZE(hub->rxBuffer) >= (RHSP_PACKET_HEADER_SIZE + RHSP_PACKET_CRC_SIZE));
    size_t size = RHSP_PACKET_SIZE(hub->rxBuffer) - RHSP_PACKET_HEADER_SIZE - RHSP_PACKET_CRC_SIZE;
    rhsp_assert(size <= RHSP_MAX_PAYLOAD_SIZE);

    if (payload)
    {
        memcpy(payload->data, RHSP_PACKET_PAYLOAD_PTR(hub->rxBuffer), size);
        payload->size = (uint16_t) size;
    }
}
