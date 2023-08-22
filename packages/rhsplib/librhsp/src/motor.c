/*
 *  motor.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "rhsp/motor.h"
#include "rhsp/module.h"
#include <math.h>
#include "internal/arrayutils.h"
#include "internal/command.h"
#include "internal/packet.h"
#include "internal/revhub.h"

#define RHSP_NUMBER_OF_MOTOR_CHANNELS 4

#define POWER_CONVERSION 32767
#define CLOSED_LOOP_COEFF_CONVERSION 65536

int rhsp_setMotorChannelMode(RhspRevHub* hub,
                             uint8_t motorChannel,
                             MotorMode motorMode,
                             uint8_t floatAtZero,
                             uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (floatAtZero > 1)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 8, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t cmdPayload[3] = {motorChannel, motorMode, floatAtZero};

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorChannelMode(RhspRevHub* hub,
                             uint8_t motorChannel,
                             uint8_t* motorMode,
                             uint8_t* floatAtZero,
                             uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int result = rhsp_getInterfacePacketID(hub, "DEKA", 9, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    if (motorMode)
    {
        *motorMode = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    if (floatAtZero)
    {
        *floatAtZero = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setMotorChannelEnable(RhspRevHub* hub,
                               uint8_t motorChannel,
                               uint8_t enabled,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (enabled > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 10, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t cmdPayload[2] = {motorChannel, enabled};

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorChannelEnable(RhspRevHub* hub,
                               uint8_t motorChannel,
                               uint8_t* enabled,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 11, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (enabled)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *enabled = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setMotorChannelCurrentAlertLevel(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          uint16_t currentLimit,
                                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 12, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t cmdPayload[3];

    RHSP_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSP_ARRAY_SET_WORD(cmdPayload, 1, currentLimit);

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorChannelCurrentAlertLevel(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          uint16_t* currentLimit,
                                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 13, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (currentLimit)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *currentLimit = RHSP_ARRAY_WORD(uint16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    return RHSP_RESULT_OK;
}

int rhsp_resetEncoder(RhspRevHub* hub,
                      uint8_t motorChannel,
                      uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 14, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
}

int rhsp_setMotorConstantPower(RhspRevHub* hub,
                               uint8_t motorChannel,
                               double powerLevel,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 15, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    uint8_t cmdPayload[3];

    int16_t adjustedPowerLevel = (int16_t) (powerLevel * POWER_CONVERSION);

    RHSP_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSP_ARRAY_SET_WORD(cmdPayload, 1, adjustedPowerLevel);

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorConstantPower(RhspRevHub* hub,
                               uint8_t motorChannel,
                               double* powerLevel,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 16, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (powerLevel)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        int16_t rawPowerLevel = RHSP_ARRAY_WORD(int16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
        *powerLevel = (rawPowerLevel * 1.0 / POWER_CONVERSION);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setMotorTargetVelocity(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int16_t velocity,
                                uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 17, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    uint8_t cmdPayload[3];

    RHSP_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSP_ARRAY_SET_WORD(cmdPayload, 1, velocity);

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorTargetVelocity(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int16_t* velocity,
                                uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 18, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (velocity)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *velocity = RHSP_ARRAY_WORD(int16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setMotorTargetPosition(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int32_t targetPosition,
                                uint16_t targetTolerance,
                                uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 19, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    uint8_t cmdPayload[7];

    RHSP_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSP_ARRAY_SET_DWORD(cmdPayload, 1, targetPosition);
    RHSP_ARRAY_SET_WORD(cmdPayload, 5, targetTolerance);

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getMotorTargetPosition(RhspRevHub* hub,
                                uint8_t motorChannel,
                                int32_t* targetPosition,
                                uint16_t* targetTolerance,
                                uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 20, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    const uint8_t* rspPayload = RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer);

    if (targetPosition)
    {
        *targetPosition = RHSP_ARRAY_DWORD(int32_t, rspPayload, 0);
    }
    if (targetTolerance)
    {
        *targetTolerance = RHSP_ARRAY_WORD(uint16_t, rspPayload, 4);
    }

    return RHSP_RESULT_OK;
}

int rhsp_isMotorAtTarget(RhspRevHub* hub,
                         uint8_t motorChannel,
                         uint8_t* atTarget,
                         uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int result = rhsp_getInterfacePacketID(hub, "DEKA", 21, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    const uint8_t* const rspPayload = RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer);

    if (atTarget)
    {
        *atTarget = RHSP_ARRAY_BYTE(uint8_t, rspPayload, 0);
    }

    return RHSP_RESULT_OK;
}

int rhsp_getEncoderPosition(RhspRevHub* hub,
                            uint8_t motorChannel,
                            int32_t* currentPosition,
                            uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int result = rhsp_getInterfacePacketID(hub, "DEKA", 22, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (currentPosition)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *currentPosition = RHSP_ARRAY_DWORD(int32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    return RHSP_RESULT_OK;
}

int rhsp_setClosedLoopControlCoefficients(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          MotorMode mode,
                                          ClosedLoopControlParameters* parameters,
                                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (mode != MOTOR_MODE_REGULATED_VELOCITY && mode != MOTOR_MODE_REGULATED_POSITION)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int functionNumber = (parameters->type == LEGACY_PID_TAG) ? 23 : 51;
    int result = rhsp_getInterfacePacketID(hub, "DEKA", functionNumber, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    uint8_t cmdPayload[19];

    RHSP_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSP_ARRAY_SET_BYTE(cmdPayload, 1, mode);

    if (parameters->type == LEGACY_PID_TAG)
    {
        int32_t p = (int) round(parameters->pid.p * CLOSED_LOOP_COEFF_CONVERSION);
        int32_t i = (int) round(parameters->pid.i * CLOSED_LOOP_COEFF_CONVERSION);
        int32_t d = (int) round(parameters->pid.d * CLOSED_LOOP_COEFF_CONVERSION);

        RHSP_ARRAY_SET_DWORD(cmdPayload, 2, p);
        RHSP_ARRAY_SET_DWORD(cmdPayload, 6, i);
        RHSP_ARRAY_SET_DWORD(cmdPayload, 10, d);
    } else if (parameters->type == PIDF_TAG)
    {
        int32_t p = (int) round(parameters->pidf.p * CLOSED_LOOP_COEFF_CONVERSION);
        int32_t i = (int) round(parameters->pidf.i * CLOSED_LOOP_COEFF_CONVERSION);
        int32_t d = (int) round(parameters->pidf.d * CLOSED_LOOP_COEFF_CONVERSION);
        int32_t f = (int) round(parameters->pidf.f * CLOSED_LOOP_COEFF_CONVERSION);

        RHSP_ARRAY_SET_DWORD(cmdPayload, 2, p);
        RHSP_ARRAY_SET_DWORD(cmdPayload, 6, i);
        RHSP_ARRAY_SET_DWORD(cmdPayload, 10, d);
        RHSP_ARRAY_SET_DWORD(cmdPayload, 14, f);
        RHSP_ARRAY_SET_BYTE(cmdPayload, 18, PIDF_TAG); //1 is PIDF
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int rhsp_getClosedLoopControlCoefficients(RhspRevHub* hub,
                                          uint8_t motorChannel,
                                          MotorMode mode,
                                          ClosedLoopControlParameters* parameters,
                                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (motorChannel >= RHSP_NUMBER_OF_MOTOR_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (mode != MOTOR_MODE_REGULATED_VELOCITY && mode != MOTOR_MODE_REGULATED_POSITION)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    // Check which PID algorithms are supported.
    // First try PIDF, then try PID if PIDF is
    // not supported.
    int supportsPidf = 1;
    int result = rhsp_getInterfacePacketID(hub, "DEKA", 53, &packetID, nackReasonCode);

    if (result < 0)
    {
        // PIDF is not supported. Try PID.
        supportsPidf = 0;
        result = rhsp_getInterfacePacketID(hub, "DEKA", 24, &packetID, nackReasonCode);
        if (result < 0)
        {
            // Neither PID mode is supported. Error.
            return result;
        }
    }

    uint8_t cmdPayload[2] = {motorChannel, mode};

    result = rhsp_sendReadCommandInternal(hub, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    const uint8_t* rspPayload = RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer);

    if (parameters)
    {
        int32_t p = RHSP_ARRAY_DWORD(int32_t, rspPayload, 0);
        int32_t i = RHSP_ARRAY_DWORD(int32_t, rspPayload, 4);
        int32_t d = RHSP_ARRAY_DWORD(int32_t, rspPayload, 8);

        int usingPidf = supportsPidf;

        if (supportsPidf)
        {
            uint8_t pidMode = RHSP_ARRAY_BYTE(uint8_t, rspPayload, 16);

            // we support PIDF, but we're currently using the legacy PID.
            if (pidMode == LEGACY_PID_TAG)
            {
                usingPidf = 0;
            }
        }

        if (usingPidf)
        {
            int32_t f = RHSP_ARRAY_DWORD(int32_t, rspPayload, 12);
            parameters->type = PIDF_TAG;
            parameters->pidf.p = p * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
            parameters->pidf.i = i * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
            parameters->pidf.d = d * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
            parameters->pidf.f = f * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
        } else
        {
            parameters->type = LEGACY_PID_TAG;
            parameters->pid.p = p * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
            parameters->pid.i = i * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
            parameters->pid.d = d * 1.0 / CLOSED_LOOP_COEFF_CONVERSION;
        }
    }

    return RHSP_RESULT_OK;
}
