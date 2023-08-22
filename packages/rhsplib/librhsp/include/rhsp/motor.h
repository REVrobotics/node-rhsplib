/*
 * motor.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSP_MOTOR_H_
#define RHSP_MOTOR_H_

#include "revhub.h"
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define LEGACY_PID_TAG 0
#define PIDF_TAG 1

typedef enum {
    /**
     * Open loop control. Sets power in [-1.0, 1.0] range.
     */
    MOTOR_MODE_OPEN_LOOP,
    /**
     * Regulated velocity mode. Sets target velocity in counts/second.
     */
    MOTOR_MODE_REGULATED_VELOCITY,
    /**
     * Regulated position mode. Motor will attempt to hold a given
     * encoder count to a given tolerance.
     */
    MOTOR_MODE_REGULATED_POSITION
} MotorMode;

/**
 * Coefficients for PID mode
 */
typedef struct {
    double p;
    double i;
    double d;
} PidCoefficients;

/**
 * Coefficients for PID with feed-forward control mode.
 */
typedef struct {
    double p;
    double i;
    double d;
    double f;
} PidfCoefficients;

/**
 * Closed Loop Control Parameters. This struct
 * holds EITHER a PID or PIDF value. The 'type'
 * field tells you which is set. Accessing or
 * setting 'pid' when type is 'PIDF_TAG' or vice-versa
 * is undefined behavior.
 */
typedef struct {
    /**
     * One of 'LEGACY_PID_TAG' or 'PIDF_TAG'
     */
    int type;

    union {
        PidCoefficients pid;
        PidfCoefficients pidf;
    };
} ClosedLoopControlParameters;

/**
 * @brief Sets the run mode for the specified motor channel
 *
 * @param[in] hub             module instance
 * @param[in] motorChannel    motor channel in range 0 - 3
 * @param[in] motorMode       motor mode in range 0 - 2. See protocol spec for details
 * @param[in] floatAtZero     Float at zero (0 = active brake, 1 = float)
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorChannelMode(RhspRevHub* hub,
                             uint8_t motorChannel,
                             MotorMode motorMode,
                             uint8_t floatAtZero,
                             uint8_t* nackReasonCode);

/**
 * @brief Retrieves the run mode of the motor on the specified channel
 *
 * @param[in]  hub              module instance
 * @param[in]  motorChannel     motor channel in range 0 - 3
 * @param[out] motorMode        motor mode in range 0 - 2. See protocol spec for details
 * @param[out] floatAtZero      Float at zero (0 = active brake, 1 = float)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorChannelMode(RhspRevHub* hub,
                             uint8_t motorChannel,
                             uint8_t* motorMode,
                             uint8_t* floatAtZero,
                             uint8_t* nackReasonCode);

/**
 * @brief Enables operation for the specified motor
 *
 * @param[in] hub             module instance
 * @param[in] motorChannel    motor channel in range 0 - 3
 * @param[in] enabled         Enabled (1 = enabled; 0 = float)
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorChannelEnable(RhspRevHub* hub,
                               uint8_t motorChannel,
                               uint8_t enabled,
                               uint8_t* nackReasonCode);

/**
 * @brief Retrieves the enable state of the specified motor channel
 *
 * @param[in] hub                  module instance
 * @param[in] motorChannel         motor channel in range 0 - 3
 * @param[out] enabled             Enabled (1 = enabled; 0 = float)
 * @param[out] nackReasonCode      nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorChannelEnable(RhspRevHub* hub,
                               uint8_t motorChannel,
                               uint8_t* enabled,
                               uint8_t* nackReasonCode);

/**
 * @brief Sets an alert level for the motor current
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] currentLimit      motor current limit value (mA)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorChannelCurrentAlertLevel(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          uint16_t currentLimit,
                                          uint8_t* nackReasonCode);

/**
 * @brief Retrieves the current limit alert level for the specified motor channel
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] currentLimit     motor current limit value (mA)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorChannelCurrentAlertLevel(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          uint16_t* currentLimit,
                                          uint8_t* nackReasonCode);

/**
 * @brief Clears encoder to zero for the specified motor channel
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel number
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_resetEncoder(RhspRevHub* hub,
                      uint8_t motorChannel,
                      uint8_t* nackReasonCode);

/**
 * @brief Sets the drive power for the specified motor when in Constant Power mode
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel number
 * @param[in] powerLevel        power level to set [-1.0, 1.0]
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorConstantPower(RhspRevHub* hub,
                               uint8_t motorChannel,
                               double powerLevel,
                               uint8_t* nackReasonCode);

/**
 * @brief Retrieves the constant power configuration of the specified motor
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel number
 * @param[out] powerLevel       power level to get [-1.0, 1.0]
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorConstantPower(RhspRevHub* hub,
                               uint8_t motorChannel,
                               double* powerLevel,
                               uint8_t* nackReasonCode);

/**
 * @brief Sets the target velocity when motor is in Constant Velocity mode
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] velocity          velocity to set (counts/sec)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorTargetVelocity(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int16_t velocity,
                                uint8_t* nackReasonCode);

/**
 * @brief Retrives the configured target velocity
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] velocity         velocity to set (counts/sec)
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorTargetVelocity(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int16_t* velocity,
                                uint8_t* nackReasonCode);

/**
 * @brief Sets the specified motor’s target position (in encoder counts) for Position Target mode
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[in] targetPosition    target position
 * @param[in] targetTolerance   at-target tolerance
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setMotorTargetPosition(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int32_t targetPosition,
                                uint16_t targetTolerance,
                                uint8_t* nackReasonCode);

/**
 * @brief Retrieves the specified motor’s target position
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] targetPosition   target position
 * @param[out] targetTolerance  at-target tolerance
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getMotorTargetPosition(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int32_t* targetPosition,
                                uint16_t* targetTolerance,
                                uint8_t* nackReasonCode);

/**
 * @brief Checks if the motor is at the target position (with specified tolerance), valid only in Position Target mode
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] atTarget         At target (1 = yes, 0 = no)
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_isMotorAtTarget(RhspRevHub* hub,
                         uint8_t motorChannel,
                         uint8_t* atTarget,
                         uint8_t* nackReasonCode);

/**
 * @brief Retrieves the specified motor’s current encoder position
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel
 * @param[out] currentPosition  current position
 * @param[out] nackReasonCode   nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getEncoderPosition(RhspRevHub* hub,
                            uint8_t motorChannel,
                            int32_t* currentPosition,
                            uint8_t* nackReasonCode);

/**
 * @brief Sets the control loop coefficients for the specified motor channel and mode
 *
 * @param[in] hub               module instance
 * @param[in] motorChannel      motor channel number
 * @param[in] motorMode         motor mode, PID control is active for Target Velocity and Target Position modes only
 * @param[in] parameters        PID or PIDF parameters
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setClosedLoopControlCoefficients(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          MotorMode mode,
                                          ClosedLoopControlParameters* parameters,
                                          uint8_t* nackReasonCode);

/**
 * @brief Retrieves the control loop coefficients of the specified motor channel and mode
 *
 * @param[in] hub                module instance
 * @param[in] motorChannel       motor channel number
 * @param[in] motorMode          motor mode, PID control is active for Target Velocity and Target Position modes only
 * @param[out] parameters        PID or PIDF coefficients
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getClosedLoopControlCoefficients(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          MotorMode mode,
                                          ClosedLoopControlParameters* parameters,
                                          uint8_t* nackReasonCode);


#ifdef __cplusplus
}
#endif

#endif /* RHSP_MOTOR_H_ */
