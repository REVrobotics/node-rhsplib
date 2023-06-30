/*
 * RHSPlib_motor.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSPLIB_MOTOR_H_
#define RHSPLIB_MOTOR_H_
#include "RHSPlib.h"

#ifdef __cplusplus
extern "C" {
#endif


/**
 * @brief Sets the run mode for the specified motor channel
 *
 * @param[in] obj             module instance
 * @param[in] motorChannel    motor channel in range 0 - 3
 * @param[in] motorMode       motor mode in range 0 - 2. See protocol spec for details
 * @param[in] floatAtZero     Float at zero (0 = active brake, 1 = float)
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setChannelMode(RHSPlib_Module_T *obj,
                                  uint8_t motorChannel,
                                  uint8_t motorMode, uint8_t floatAtZero, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the run mode of the motor on the specified channel
 *
 * @param[in]  obj              module instance
 * @param[in]  motorChannel     motor channel in range 0 - 3
 * @param[out] motorMode        motor mode in range 0 - 2. See protocol spec for details
 * @param[out] floatAtZero      Float at zero (0 = active brake, 1 = float)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getChannelMode(RHSPlib_Module_T *obj,
                                  uint8_t motorChannel, uint8_t *motorMode, uint8_t *floatAtZero,
                                  uint8_t *nackReasonCode);


/**
 * @brief Enables operation for the specified motor
 *
 * @param[in] obj             module instance
 * @param[in] motorChannel    motor channel in range 0 - 3
 * @param[in] enabled         Enabled (1 = enabled; 0 = float)
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setChannelEnable(RHSPlib_Module_T *obj,
                                    uint8_t motorChannel,
                                    uint8_t enabled, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the enable state of the specified motor channel
 *
 * @param[in] obj                  module instance
 * @param[in] motorChannel         motor channel in range 0 - 3
 * @param[out] enabled             Enabled (1 = enabled; 0 = float)
 * @param[out] nackReasonCode      nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getChannelEnable(RHSPlib_Module_T *obj,
                                    uint8_t motorChannel,
                                    uint8_t *enabled, uint8_t *nackReasonCode);

/**
 * @brief Sets an alert level for the motor current
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] currentLimit      motor current limit value (mA)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setChannelCurrentAlertLevel(RHSPlib_Module_T *obj,
                                			   uint8_t motorChannel,
											   uint16_t currentLimit, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the current limit alert level for the specified motor channel
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] currentLimit     motor current limit value (mA)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getChannelCurrentAlertLevel(RHSPlib_Module_T *obj,
                                		       uint8_t motorChannel,
											   uint16_t *currentLimit, uint8_t *nackReasonCode);

/**
 * @brief Clears encoder to zero for the specified motor channel
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel number
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_resetEncoder(RHSPlib_Module_T *obj,
                                uint8_t motorChannel, uint8_t *nackReasonCode);

/**
 * @brief Sets the drive power for the specified motor when in Constant Power mode
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel number
 * @param[in] powerLevel        power level to set
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setConstantPower(RHSPlib_Module_T *obj,
                                	uint8_t motorChannel,
									double powerLevel, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the constant power configuration of the specified motor
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel number
 * @param[out] powerLevel       power level to set
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getConstantPower(RHSPlib_Module_T *obj,
                                    uint8_t motorChannel,
                                    double *powerLevel, uint8_t *nackReasonCode);

/**
 * @brief Sets the target velocity when motor is in Constant Velocity mode
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] velocity          velocity to set (counts/sec)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setTargetVelocity(RHSPlib_Module_T *obj,
                                     uint8_t motorChannel,
                                     int16_t velocity, uint8_t *nackReasonCode);

/**
 * @brief Retrives the configured target velocity
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] velocity         velocity to set (counts/sec)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getTargetVelocity(RHSPlib_Module_T *obj,
                                     uint8_t motorChannel,
                                     int16_t *velocity, uint8_t *nackReasonCode);

/**
 * @brief Sets the specified motor’s target position (in encoder counts) for Position Target mode
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] targetPosition    target position
 * @param[in] targetTolerance   at-target tolerance
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setTargetPosition(RHSPlib_Module_T *obj,
                                     uint8_t motorChannel,
                                     int32_t targetPosition,
                                     uint16_t targetTolerance, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the specified motor’s target position
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] targetPosition   target position
 * @param[out] targetTolerance  at-target tolerance
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getTargetPosition(RHSPlib_Module_T *obj,
                                     uint8_t motorChannel,
                                     int32_t *targetPosition,
                                     uint16_t *targetTolerance, uint8_t *nackReasonCode);

/**
 * @brief Checks if the motor is at the target position (with specified tolerance), valid only in Position Target mode
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] atTarget         At target (1 = yes, 0 = no)
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getMotorAtTarget(RHSPlib_Module_T *obj,
                                    uint8_t motorChannel,
                                    uint8_t *atTarget, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the specified motor’s current encoder position
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] currentPosition  current position
 * @param[out] nackReasonCode   nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getEncoderPosition(RHSPlib_Module_T *obj,
                                      uint8_t motorChannel,
                                      int32_t *currentPosition, uint8_t *nackReasonCode);

/**
 * @brief Sets the control loop coefficients for the specified motor channel and mode
 *
 * @param[in] obj               module instance
 * @param[in] motorChannel      motor channel number
 * @param[in] motorMode         motor mode, PID control is active for Target Velocity and Target Position modes only
 * @param[in] proportionalCoeff proportional coefficient
 * @param[in] integralCoeff     integral coefficient
 * @param[in] derivativeCoeff   derivative coefficient
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_motor_setPIDControlLoopCoefficients(RHSPlib_Module_T *obj,
                                                 uint8_t motorChannel,
                                                 uint8_t mode, double proportionalCoeff,
                                                 double integralCoeff, double derivativeCoeff, uint8_t *nackReasonCode);

/**
 * @brief Retrieves the control loop coefficients of the specified motor channel and mode
 *
 * @param[in] obj                module instance
 * @param[in] motorChannel       motor channel number
 * @param[in] motorMode          motor mode, PID control is active for Target Velocity and Target Position modes only
 * @param[out] proportionalCoeff proportional coefficient
 * @param[out] integralCoeff     integral coefficient
 * @param[out] derivativeCoeff   derivative coefficient
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_motor_getPIDControlLoopCoefficients(RHSPlib_Module_T *obj,
                                				 uint8_t motorChannel,
												 uint8_t mode, double *proportionalCoeff,
												 double *integralCoeff, double *derivativeCoeff, uint8_t *nackReasonCode);

#ifdef __cplusplus
}
#endif


#endif /* RHSPLIB_MOTOR_H_ */
