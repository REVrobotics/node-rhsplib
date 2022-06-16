/*
 * RHSPlib_servo.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "RHSPlib_servo.h"

int RHSPlib_servo_setConfiguration(RHSPlib_Module_T *obj,
                                    uint8_t servoChannel, uint16_t framePeriod, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    else if (framePeriod <= 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 31, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3];
    RHSPLIB_ARRAY_SET_BYTE(buffer, 0, servoChannel);
    RHSPLIB_ARRAY_SET_WORD(buffer, 1, framePeriod);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_servo_getConfiguration(RHSPlib_Module_T *obj,
                                    uint8_t servoChannel, uint16_t *framePeriod, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 32, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (framePeriod)
    {
        *framePeriod = RHSPLIB_ARRAY_WORD(uint16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_servo_setPulseWidth(RHSPlib_Module_T *obj,
                                 uint8_t servoChannel, uint16_t pulseWidth, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (pulseWidth == 0)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 33, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3];
    RHSPLIB_ARRAY_SET_BYTE(buffer, 0, servoChannel);
    RHSPLIB_ARRAY_SET_WORD(buffer, 1, pulseWidth);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_servo_getPulseWidth(RHSPlib_Module_T *obj,
                                 uint8_t servoChannel, uint16_t *pulseWidth, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 34, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (pulseWidth)
    {
        *pulseWidth = RHSPLIB_ARRAY_WORD(uint16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_servo_setEnable(RHSPlib_Module_T *obj,
                             uint8_t servoChannel, uint8_t enable, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (enable > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 35, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[2] = {servoChannel, enable};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_servo_getEnable(RHSPlib_Module_T *obj,
                             uint8_t servoChannel, uint8_t *enable, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (servoChannel >= RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 36, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (enable)
    {
        *enable = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}


