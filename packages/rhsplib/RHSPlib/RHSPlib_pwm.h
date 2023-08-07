/*
 * RHSPlib_pwm.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSPLIB_PWM_H_
#define RHSPLIB_PWM_H_

#include "RHSPlib.h"

#ifdef __cplusplus
extern "C" {
#endif


/**
 * @brief set pwm configuration
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[in]  framePeriod       frame period (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_pwm_setConfiguration(RHSPlib_Module_T *obj,
                                 uint8_t pwmChannel, uint16_t framePeriod, uint8_t *nackReasonCode);

/**
 * @brief get pwm configuration
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[out] framePeriod       frame period (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_pwm_getConfiguration(RHSPlib_Module_T *obj,
                                 uint8_t pwmChannel, uint16_t *framePeriod, uint8_t *nackReasonCode);

/**
 * @brief set pwm pulse width
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[in]  pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_pwm_setPulseWidth(RHSPlib_Module_T *obj,
                              uint8_t pwmChannel, uint16_t pulseWidth, uint8_t *nackReasonCode);

/**
 * @brief get pwm pulse width
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[out] pulseWidth        pulse width (usec)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_pwm_getPulseWidth(RHSPlib_Module_T *obj,
                              uint8_t pwmChannel, uint16_t *pulseWidth, uint8_t *nackReasonCode);

/**
 * @brief set pwm enable
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[in]  enable            Enable (1 = on, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_pwm_setEnable(RHSPlib_Module_T *obj,
                          uint8_t pwmChannel, uint8_t enable, uint8_t *nackReasonCode);

/**
 * @brief get pwm enable
 *
 * @param[in]  obj               module instance
 * @param[in]  pwmChannel        PWM channel. 0 - 3
 * @param[out] enable            Enabled (1 = on, 0 = off)
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_pwm_getEnable(RHSPlib_Module_T *obj,
                          uint8_t pwmChannel, uint8_t *enable, uint8_t *nackReasonCode);

#ifdef __cplusplus
}
#endif


#endif /* RHSPLIB_PWM_H_ */
