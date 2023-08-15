/*
 * servo.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSP_SERVO_H_
#define RHSP_SERVO_H_

#include "revhub.h"
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief set servo configuration
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  framePeriod       frame period(usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 * */
int rhsp_setServoConfiguration(RhspRevHub* hub,
                               uint8_t servoChannel,
                               uint16_t framePeriod,
                               uint8_t* nackReasonCode);

/**
 * @brief get servo configuration
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] framePeriod       frame period(usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 * */
int rhsp_getServoConfiguration(RhspRevHub* hub,
                               uint8_t servoChannel,
                               uint16_t* framePeriod,
                               uint8_t* nackReasonCode);

/**
 * @brief set servo pulse width
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setServoPulseWidth(RhspRevHub* hub,
                            uint8_t servoChannel,
                            uint16_t pulseWidth,
                            uint8_t* nackReasonCode);

/**
 * @brief get servo pulse width
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getServoPulseWidth(RhspRevHub* hub,
                            uint8_t servoChannel,
                            uint16_t* pulseWidth,
                            uint8_t* nackReasonCode);

/**
 * @brief set servo enable
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  enable            enable (1 = enable, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setServoEnable(RhspRevHub* hub,
                        uint8_t servoChannel,
                        uint8_t enable,
                        uint8_t* nackReasonCode);

/**
 * @brief get servo enable
 *
 * @param[in]  hub               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] enable            enable (1 = enable, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getServoEnable(RhspRevHub* hub,
                        uint8_t servoChannel,
                        uint8_t* enable,
                        uint8_t* nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSP_SERVO_H_ */
