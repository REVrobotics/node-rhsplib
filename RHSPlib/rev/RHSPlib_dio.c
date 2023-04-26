/*
 * RHSPlib_dio.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "RHSPlib_dio.h"

int RHSPlib_dio_setSingleOutput(RHSPlib_Module_T *obj,
                                 uint8_t dioPin, uint8_t value, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }

    if (dioPin >= RHSPLIB_MAX_NUMBER_OF_GPIO)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    else if (value > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 1, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[2] = {dioPin, value};
    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_dio_setAllOutputs(RHSPlib_Module_T *obj,
                               uint8_t bitPacketField, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 2, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    return RHSPlib_sendWriteCommandInternal(obj, packetID, &bitPacketField, sizeof(bitPacketField), nackReasonCode);
}

int RHSPlib_dio_setDirection(RHSPlib_Module_T *obj,
                              uint8_t dioPin, uint8_t directionOutput, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }

    if (dioPin >= RHSPLIB_MAX_NUMBER_OF_GPIO)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (directionOutput > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 3, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[2] = {dioPin, directionOutput};
    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_dio_getDirection(RHSPlib_Module_T *obj,
                              uint8_t dioPin, uint8_t *directionOutput, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }

    if (dioPin >= RHSPLIB_MAX_NUMBER_OF_GPIO)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 4, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &dioPin, sizeof(dioPin), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (directionOutput)
    {
        *directionOutput = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_dio_getSingleInput(RHSPlib_Module_T *obj,
                                uint8_t dioPin, uint8_t *inputValue, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (dioPin >= RHSPLIB_MAX_NUMBER_OF_GPIO)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 5, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &dioPin, sizeof(dioPin), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (inputValue)
    {
        *inputValue = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_dio_getAllInputs(RHSPlib_Module_T *obj,
                              uint8_t *bitPacketField, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 6, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (bitPacketField)
    {
        *bitPacketField = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

