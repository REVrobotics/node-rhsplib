/*
 * RHSPlib_motor.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "RHSPlib_motor.h"

int RHSPlib_motor_setChannelMode(RHSPlib_Module_T *obj,
                                  uint8_t motorChannel, uint8_t motorMode, uint8_t floatAtZero,
                                  uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    else if (motorMode > RHSPLIB_MAX_NUMBER_OF_MOTOR_MODES)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    else if (floatAtZero > 1)
    {
    	return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 8, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t cmdPayload[3] = {motorChannel, motorMode, floatAtZero};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getChannelMode(RHSPlib_Module_T *obj,
                                  uint8_t motorChannel, uint8_t *motorMode, uint8_t *floatAtZero,
                                  uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 9, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (motorMode)
    {
        *motorMode = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    if (floatAtZero)
    {
        *floatAtZero = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_setChannelEnable(RHSPlib_Module_T *obj,
                                	uint8_t motorChannel,
									uint8_t enabled, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (enabled > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 10, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t cmdPayload[2] = {motorChannel, enabled};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getChannelEnable(RHSPlib_Module_T *obj,
                                	uint8_t motorChannel,
									uint8_t *enabled, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 11, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (enabled)
    {
        *enabled = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_setChannelCurrentAlertLevel(RHSPlib_Module_T *obj,
                                			   uint8_t motorChannel,
											   uint16_t currentLimit, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 12, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t cmdPayload[3];

    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSPLIB_ARRAY_SET_WORD(cmdPayload, 1, currentLimit);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getChannelCurrentAlertLevel(RHSPlib_Module_T *obj,
                                			   uint8_t motorChannel,
											   uint16_t *currentLimit, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 13, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (currentLimit)
    {
        *currentLimit = RHSPLIB_ARRAY_WORD(uint16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_resetEncoder(RHSPlib_Module_T *obj,
                                uint8_t motorChannel, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 14, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    return RHSPlib_sendWriteCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
}

int RHSPlib_motor_setConstantPower(RHSPlib_Module_T *obj,
                                	uint8_t motorChannel,
									int16_t powerLevel, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 15, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t cmdPayload[3];

    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSPLIB_ARRAY_SET_WORD(cmdPayload, 1, powerLevel);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getConstantPower(RHSPlib_Module_T *obj,
                                    uint8_t motorChannel,
                                    int16_t *powerLevel, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 16, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (powerLevel)
    {
        *powerLevel = RHSPLIB_ARRAY_WORD(int16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_setTargetVelocity(RHSPlib_Module_T *obj,
                                     uint8_t motorChannel,
                                     int16_t velocity, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 17, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t cmdPayload[3];

    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSPLIB_ARRAY_SET_WORD(cmdPayload, 1, velocity);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getTargetVelocity(RHSPlib_Module_T *obj,
                                	 uint8_t motorChannel,
									 int16_t *velocity, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 18, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (velocity)
    {
        *velocity = RHSPLIB_ARRAY_WORD(int16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_setTargetPosition(RHSPlib_Module_T *obj,
                                	 uint8_t motorChannel,
									 int32_t targetPosition,
									 uint16_t targetTolerance, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 19, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t cmdPayload[7];

    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSPLIB_ARRAY_SET_DWORD(cmdPayload, 1, targetPosition);
    RHSPLIB_ARRAY_SET_WORD(cmdPayload, 5, targetTolerance);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getTargetPosition(RHSPlib_Module_T *obj,
                                	 uint8_t motorChannel,
									 int32_t *targetPosition,
									 uint16_t *targetTolerance, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 20, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    const uint8_t *rspPayload = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer);

    if (targetPosition)
    {
        *targetPosition = RHSPLIB_ARRAY_DWORD(int32_t, rspPayload, 0);
    }
    if (targetTolerance)
    {
        *targetTolerance = RHSPLIB_ARRAY_WORD(uint16_t, rspPayload, 4);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_getMotorAtTarget(RHSPlib_Module_T *obj,
									uint8_t motorChannel,
									uint8_t *atTarget, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 21, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    const uint8_t * const rspPayload = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer);

    if (atTarget)
    {
        *atTarget = RHSPLIB_ARRAY_BYTE(uint8_t, rspPayload, 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_getEncoderPosition(RHSPlib_Module_T *obj,
									  uint8_t motorChannel,
									  int32_t *currentPosition, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 22, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, &motorChannel, sizeof(motorChannel), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (currentPosition)
    {
        *currentPosition = RHSPLIB_ARRAY_DWORD(int32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_motor_setPIDControlLoopCoefficients(RHSPlib_Module_T *obj,
                                				 uint8_t motorChannel,
												 uint8_t mode, int32_t proportionalCoeff,
												 int32_t integralCoeff, int32_t derivativeCoeff, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (mode != 1 && mode != 2)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 23, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t cmdPayload[14];

    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 0, motorChannel);
    RHSPLIB_ARRAY_SET_BYTE(cmdPayload, 1, mode);
    RHSPLIB_ARRAY_SET_DWORD(cmdPayload, 2, proportionalCoeff);
    RHSPLIB_ARRAY_SET_DWORD(cmdPayload, 6, integralCoeff);
    RHSPLIB_ARRAY_SET_DWORD(cmdPayload, 10, derivativeCoeff);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
}

int RHSPlib_motor_getPIDControlLoopCoefficients(RHSPlib_Module_T *obj,
                                				 uint8_t motorChannel,
												 uint8_t mode, int32_t *proportionalCoeff,
												 int32_t *integralCoeff, int32_t *derivativeCoeff, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (motorChannel >= RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (mode != 1 && mode != 2)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 24, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t cmdPayload[2] = {motorChannel, mode};

    result = RHSPlib_sendReadCommandInternal(obj, packetID, cmdPayload, sizeof(cmdPayload), nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    const uint8_t *rspPayload = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer);

    if (proportionalCoeff)
    {
        *proportionalCoeff = RHSPLIB_ARRAY_DWORD(int32_t, rspPayload, 0);
    }
    if (integralCoeff)
    {
        *integralCoeff = RHSPLIB_ARRAY_DWORD(int32_t, rspPayload, 4);
    }
    if (derivativeCoeff)
    {
        *derivativeCoeff = RHSPLIB_ARRAY_DWORD(int32_t, rspPayload, 8);
    }

    return RHSPLIB_RESULT_OK;
}

