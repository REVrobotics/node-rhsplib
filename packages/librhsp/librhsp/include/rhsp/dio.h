/*
 * dio.h
 *
 *  Created on: Dec 17, 2020
 *  Author: user
 */

#ifndef RHSP_DIO_H_
#define RHSP_DIO_H_

#include "revhub.h"
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief set single DIO output
 *
 * @param[in] hub       module instance
 * @param[in] dioPin    DIO pin. range 0 - 7
 * @param[in] value     value. range 0 - 1
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 * */
int rhsp_setSingleOutput(RhspRevHub* hub,
                         uint8_t dioPin,
                         uint8_t value,
                         uint8_t* nackReasonCode);

/**
 * @brief set all DIO outputs
 *
 * @param[in] hub               module instance
 * @param[in] bitPackedField    Bit packed field representing the values to set all of the DIO ports from 0 ~ 7.
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 * */
int rhsp_setAllOutputs(RhspRevHub* hub,
                       uint8_t bitPacketField,
                       uint8_t* nackReasonCode);

/**
 * @brief set DIO direction
 *
 * @param[in] hub               module instance
 * @param[in] dioPin            DIO pin. range 0 - 7
 * @param[in] directionOutput   DirectionOutput (input = 0, output = 1)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 * */
int rhsp_setDirection(RhspRevHub* hub,
                      uint8_t dioPin,
                      uint8_t directionOutput,
                      uint8_t* nackReasonCode);

/**
 * @brief get DIO direction
 *
 * @param[in]  hub               module instance
 * @param[in]  dioPin            DIO pin. range 0 - 7
 * @param[out] directionOutput   DirectionOutput (input = 0, output = 1)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 * */
int rhsp_getDirection(RhspRevHub* hub,
                      uint8_t dioPin,
                      uint8_t* directionOutput,
                      uint8_t* nackReasonCode);

/**
 * @brief get single DIO input
 *
 * @param[in]  hub               module instance
 * @param[in]  dioPin            DIO pin. range 0 - 7
 * @param[out] inputValue        input value. range 0 - 1
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getSingleInput(RhspRevHub* hub,
                        uint8_t dioPin,
                        uint8_t* inputValue,
                        uint8_t* nackReasonCode);

/**
 * @brief get all DIO inputs
 *
 * @param[in]  hub               module instance
 * @param[out] bitPacketField    input value. Bit packed field representing the values read from all of the DIO ports from 0 ~ 7.
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getAllInputs(RhspRevHub* hub,
                      uint8_t* bitPacketField,
                      uint8_t* nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSP_DIO_H_ */
