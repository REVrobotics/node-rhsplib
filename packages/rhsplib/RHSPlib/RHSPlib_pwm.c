/*
 * RHSPlib_pwm.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "RHSPlib_pwm.h"

int RHSPlib_pwm_setConfiguration(RHSPlib_Module_T *obj,
                                 uint8_t pwmChannel, uint16_t framePeriod, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 25, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3];
    RHSPLIB_ARRAY_SET_BYTE(buffer, 0, pwmChannel);
    RHSPLIB_ARRAY_SET_WORD(buffer, 1, framePeriod);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_pwm_getConfiguration(RHSPlib_Module_T *obj,
                                 uint8_t pwmChannel, uint16_t *framePeriod, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
        return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 26, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &pwmChannel, sizeof(pwmChannel), nackReasonCode);
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

int RHSPlib_pwm_setPulseWidth(RHSPlib_Module_T *obj,
                              uint8_t pwmChannel, uint16_t pulseWidth, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
        return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 27, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3];
    RHSPLIB_ARRAY_SET_BYTE(buffer, 0, pwmChannel);
    RHSPLIB_ARRAY_SET_WORD(buffer, 1, pulseWidth);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_pwm_getPulseWidth(RHSPlib_Module_T *obj,
                              uint8_t pwmChannel, uint16_t *pulseWidth, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
        return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 28, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &pwmChannel, sizeof(pwmChannel), nackReasonCode);
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

int RHSPlib_pwm_setEnable(RHSPlib_Module_T *obj,
                          uint8_t pwmChannel, uint8_t enable, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
        return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    else if (enable > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 29, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }


    uint8_t buffer[2] = {pwmChannel, enable};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_pwm_getEnable(RHSPlib_Module_T *obj,
                          uint8_t pwmChannel, uint8_t *enable, uint8_t *nackReasonCode)
{
    uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (pwmChannel >= RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS)
    {
        return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 30, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &pwmChannel, sizeof(pwmChannel), nackReasonCode);
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


