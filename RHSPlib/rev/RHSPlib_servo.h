/*
 * RHSPlib_servo.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSPLIB_SERVO_H_
#define RHSPLIB_SERVO_H_

#include "RHSPlib.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief set servo configuration
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  framePeriod       frame period(usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 * */
int RHSPlib_servo_setConfiguration(RHSPlib_Module_T *obj,
                                    uint8_t servoChannel, uint16_t framePeriod, uint8_t *nackReasonCode);

/**
 * @brief get servo configuration
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] framePeriod       frame period(usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 * */
int RHSPlib_servo_getConfiguration(RHSPlib_Module_T *obj,
                                    uint8_t servoChannel, uint16_t *framePeriod, uint8_t *nackReasonCode);

/**
 * @brief set servo pulse width
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_servo_setPulseWidth(RHSPlib_Module_T *obj,
                                 uint8_t servoChannel, uint16_t pulseWidth, uint8_t *nackReasonCode);

/**
 * @brief get servo pulse width
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_servo_getPulseWidth(RHSPlib_Module_T *obj,
                                 uint8_t servoChannel, uint16_t *pulseWidth, uint8_t *nackReasonCode);

/**
 * @brief set servo enable
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[in]  enable            enable (1 = enable, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_servo_setEnable(RHSPlib_Module_T *obj,
                             uint8_t servoChannel, uint8_t enable, uint8_t *nackReasonCode);

/**
 * @brief get servo enable
 *
 * @param[in]  obj               module instance
 * @param[in]  servoChannel      servo channel in range 0 - 5
 * @param[out] enable            enable (1 = enable, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_servo_getEnable(RHSPlib_Module_T *obj,
                             uint8_t servoChannel, uint8_t *enable, uint8_t *nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSPLIB_SERVO_H_ */
