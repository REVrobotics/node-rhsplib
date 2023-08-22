#ifndef RHSP_PACKET_H
#define RHSP_PACKET_H

#ifdef __cplusplus
extern "C" {
#endif

#include "rhsp/serial.h"
#include "rhsp/revhub.h"
#include "revhub.h"

// macro to manipulate packet entities such as payload, payload size, etc.
#define RHSP_PACKET_DST_ADDRESS(buffer)     ((buffer)[4])
#define RHSP_PACKET_SRC_ADDRESS(buffer)     ((buffer)[5])
#define RHSP_PACKET_ID(buffer)              ((uint16_t)(buffer)[9] << 8 | (uint16_t)(buffer)[8])
#define RHSP_PACKET_PAYLOAD_PTR(buffer)     (&(buffer)[RHSP_PACKET_HEADER_SIZE])
#define RHSP_PACKET_SIZE(buffer)            ((uint16_t)(buffer)[3] << 8 | (uint16_t)(buffer)[2])
#define RHSP_PACKET_IS_ACK(buffer)          (RHSP_PACKET_ID(buffer) == 0x7F01)
#define RHSP_PACKET_IS_NACK(buffer)         (RHSP_PACKET_ID(buffer) == 0x7F02)

#define RHSP_PACKET_HEADER_SIZE             10   // packet header size in bytes. it is started from first byte till payload field.
#define RHSP_PACKET_CRC_SIZE                1
#define RHSP_MAX_PAYLOAD_SIZE               512  // TODO: Adjust payload size

// Packet payload data
typedef struct {
    uint8_t data[RHSP_MAX_PAYLOAD_SIZE];
    uint16_t size;
} RhspPayloadData;

void serialPurgeRxBuffer(RhspSerial* serialPort);

/**
 * Receives packet with timeout
 *
 * returns RHSP_RESULT_OK if the packet has been received and checksum is correct
 *         RHSP_ERROR_RESPONSE_TIMEOUT if there is no any packet during response timeout
 *         RHSP_ERROR_SERIALPORT if serial port returns an error
 *
 * */
int receivePacket(RhspRevHubInternal* hub);

int sendPacket(RhspRevHubInternal* hub,
               uint8_t destAddr,
               uint8_t messageNumber,
               uint8_t referenceNumber,
               uint16_t packetTypeId,
               const uint8_t* payload,
               uint16_t payloadSize);

void fillPayloadData(const RhspRevHubInternal* hub, RhspPayloadData* payload);

#ifdef __cplusplus
}
#endif

#endif //RHSP_PACKET_H
