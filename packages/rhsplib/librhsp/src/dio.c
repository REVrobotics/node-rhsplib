/*
 * dio.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include "rhsp/dio.h"
#include "internal/arrayutils.h"
#include "rhsp/module.h"
#include "internal/command.h"
#include "internal/packet.h"
#include "internal/revhub.h"

#define RHSP_NUMBER_OF_GPIO 8

int rhsp_setSingleOutput(RhspRevHub* hub,
                         uint8_t dioPin,
                         uint8_t value,
                         uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }

    if (dioPin >= RHSP_NUMBER_OF_GPIO)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (value > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 1, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {dioPin, value};
    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_setAllOutputs(RhspRevHub* hub,
                       uint8_t bitPacketField,
                       uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 2, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, &bitPacketField, sizeof(bitPacketField), nackReasonCode);
}

int rhsp_setDirection(RhspRevHub* hub,
                      uint8_t dioPin,
                      uint8_t directionOutput,
                      uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }

    if (dioPin >= RHSP_NUMBER_OF_GPIO)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (directionOutput > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 3, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {dioPin, directionOutput};
    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_getDirection(RhspRevHub* hub,
                      uint8_t dioPin,
                      uint8_t* directionOutput,
                      uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }

    if (dioPin >= RHSP_NUMBER_OF_GPIO)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 4, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &dioPin, sizeof(dioPin), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (directionOutput)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *directionOutput = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_getSingleInput(RhspRevHub* hub,
                        uint8_t dioPin,
                        uint8_t* inputValue,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (dioPin >= RHSP_NUMBER_OF_GPIO)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 5, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &dioPin, sizeof(dioPin), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (inputValue)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *inputValue = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_getAllInputs(RhspRevHub* hub,
                      uint8_t* bitPacketField,
                      uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 6, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (bitPacketField)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *bitPacketField = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

