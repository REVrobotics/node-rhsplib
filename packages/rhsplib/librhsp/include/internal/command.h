#ifndef RHSP_COMMAND_H
#define RHSP_COMMAND_H

#ifdef __cplusplus
extern "C" {
#endif

#include "rhsp/revhub.h"
#include "packet.h"

/**
 * @brief send read command
 * @details sends a command that has an data/nack response
 *
 * @param[in] hub           module instance
 * @param[in] packetTypeID  packet type id
 * @param[in] payload       command payload
 * @param[in] payloadSize   payload size in bytes
 * @param[out] nackReasonCode it is set if the return value is RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * @note this function is for internal usage
 * */
int rhsp_sendReadCommandInternal(RhspRevHub* hub,
                                 uint16_t packetTypeID,
                                 const uint8_t* payload,
                                 uint16_t payloadSize,
                                 uint8_t* nackReasonCode);

/**
 * @brief   send write command
 * @details sends a command that has an ack/nack response
 *
 * @param[in] hub               module instance
 * @param[in] packetTypeID      packet type id
 * @param[in] payload           command payload
 * @param[in] payloadSize       payload size in bytes
 * @param[out] nackReasonCode   it is set if the return value is RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * @note this function is for internal usage
 *
 * */
int rhsp_sendWriteCommandInternal(RhspRevHub* hub,
                                  uint16_t packetTypeID,
                                  const uint8_t* payload,
                                  uint16_t payloadSize,
                                  uint8_t* nackReasonCode);

/**
 * @brief   send write command
 * @details sends a command that has an ack/nack response
 *
 * @param[in]  hub                 module instance
 * @param[in]  packetTypeID        packet type id
 * @param[in]  payload             command payload
 * @param[in]  payloadSize         payload size in bytes
 * @param[out] responsePayloadData payload data
 * @param[out] nackReasonCode   it is set if the return value is RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 *
 * */
int rhsp_sendWriteCommand(RhspRevHub* hub,
                          uint16_t packetTypeID,
                          const uint8_t* payload,
                          uint16_t payloadSize,
                          RhspPayloadData* responsePayloadData,
                          uint8_t* nackReasonCode);

/**
 * @brief send read command
 * @details sends a command that has an data/nack response
 *
 * @param[in] hub           		module instance
 * @param[in] packetTypeID  		packet type id
 * @param[in] payload       		command payload
 * @param[in] payloadSize   		payload size in bytes
 * @param[out] responsePayloadData 	payload data
 * @param[out] nackReasonCode 		it is set if the return value is RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_sendReadCommand(RhspRevHub* hub,
                         uint16_t packetTypeID,
                         const uint8_t* payload,
                         uint16_t payloadSize,
                         RhspPayloadData* responsePayloadData,
                         uint8_t* nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif //RHSP_COMMAND_H
