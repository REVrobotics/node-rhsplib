/*
 * servo.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "rhsp/servo.h"
#include "internal/arrayutils.h"
#include "internal/packet.h"
#include "internal/command.h"
#include "rhsp/module.h"

#define RHSP_NUMBER_OF_SERVO_CHANNELS 6

int rhsp_setServoConfiguration(RhspRevHub* hub,
                               uint8_t servoChannel,
                               uint16_t framePeriod,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (framePeriod <= 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 31, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[3];
    RHSP_ARRAY_SET_BYTE(buffer, 0, servoChannel);
    RHSP_ARRAY_SET_WORD(buffer, 1, framePeriod);

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getServoConfiguration(RhspRevHub* hub,
                               uint8_t servoChannel,
                               uint16_t* framePeriod,
                               uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 32, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (framePeriod)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *framePeriod = RHSP_ARRAY_WORD(uint16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_setServoPulseWidth(RhspRevHub* hub,
                            uint8_t servoChannel,
                            uint16_t pulseWidth,
                            uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (pulseWidth == 0)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 33, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[3];
    RHSP_ARRAY_SET_BYTE(buffer, 0, servoChannel);
    RHSP_ARRAY_SET_WORD(buffer, 1, pulseWidth);

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getServoPulseWidth(RhspRevHub* hub,
                            uint8_t servoChannel,
                            uint16_t* pulseWidth,
                            uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 34, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (pulseWidth)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *pulseWidth = RHSP_ARRAY_WORD(uint16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_setServoEnable(RhspRevHub* hub,
                        uint8_t servoChannel,
                        uint8_t enable,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (enable > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 35, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {servoChannel, enable};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getServoEnable(RhspRevHub* hub,
                        uint8_t servoChannel,
                        uint8_t* enable,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (servoChannel >= RHSP_NUMBER_OF_SERVO_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 36, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &servoChannel, sizeof(servoChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (enable)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *enable = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}


