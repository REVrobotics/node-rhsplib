/*
 *  deviceControl.c
 *
 *  Created on: Dec 1, 2020
 *  Authors: Andrey Mihadyuk, Eugene Shushkevich
 */
#include <stdio.h>
#include <string.h>

#include "rhsp/deviceControl.h"
#include "internal/arrayutils.h"
#include "internal/packet.h"
#include "rhsp/compiler.h"
#include "rhsp/module.h"
#include "internal/command.h"
#include "internal/revhub.h"

#define RHSP_NUMBER_OF_ADC_CHANNELS 15
#define BULK_READ_FUNCTION_ID    0

static void fillBulkInputData(const RhspRevHub* hub, RhspBulkInputData* data);

static void fillBulkInputData(const RhspRevHub* hub, RhspBulkInputData* data)
{
    if (!data)
    {
        return;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    const uint8_t* payload = RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer);
    data->digitalInputs = RHSP_ARRAY_BYTE(uint8_t, payload, 0);

    data->motor0position_enc = RHSP_ARRAY_DWORD(int32_t, payload, 1);
    data->motor1position_enc = RHSP_ARRAY_DWORD(int32_t, payload, 5);
    data->motor2position_enc = RHSP_ARRAY_DWORD(int32_t, payload, 9);
    data->motor3position_enc = RHSP_ARRAY_DWORD(int32_t, payload, 13);

    data->motorStatus = RHSP_ARRAY_BYTE(uint8_t, payload, 17);

    data->motor0velocity_cps = RHSP_ARRAY_WORD(int16_t, payload, 18);
    data->motor0velocity_cps = RHSP_ARRAY_WORD(int16_t, payload, 20);
    data->motor0velocity_cps = RHSP_ARRAY_WORD(int16_t, payload, 22);
    data->motor0velocity_cps = RHSP_ARRAY_WORD(int16_t, payload, 24);

    data->analog0_mV = RHSP_ARRAY_WORD(int16_t, payload, 26);
    data->analog1_mV = RHSP_ARRAY_WORD(int16_t, payload, 28);
    data->analog2_mV = RHSP_ARRAY_WORD(int16_t, payload, 30);
    data->analog3_mV = RHSP_ARRAY_WORD(int16_t, payload, 32);

    data->attentionRequired = RHSP_ARRAY_BYTE(uint8_t, payload, 34);
}

int rhsp_getBulkInputData(RhspRevHub* hub,
                          RhspBulkInputData* response,
                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    int result = rhsp_getInterfacePacketID(hub, "DEKA", BULK_READ_FUNCTION_ID, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    result = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    fillBulkInputData(hub, response);

    return RHSP_RESULT_OK;
}

int rhsp_setBulkOutputData(RhspRevHub* hub,
                           const RhspBulkOutputData* bulkOutputData,
                           RhspBulkInputData* bulkInputDataResponse,
                           uint8_t* nackReasonCode)
{
    uint16_t packetID;
    uint16_t packetIDBulkRead;

    if (!hub || !bulkOutputData)
    {
        return RHSP_ERROR;
    }

    // check whether we support bulk read/write and get packetID of course
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 56, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_getInterfacePacketID(hub, "DEKA", BULK_READ_FUNCTION_ID, &packetIDBulkRead, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[34];
    RHSP_ARRAY_SET_BYTE(buffer, 0, bulkOutputData->digitalOutputs);
    RHSP_ARRAY_SET_BYTE(buffer, 1, bulkOutputData->digitalDirections);
    RHSP_ARRAY_SET_BYTE(buffer, 2, bulkOutputData->motorEnable);
    RHSP_ARRAY_SET_BYTE(buffer, 3, bulkOutputData->motorMode0_1);
    RHSP_ARRAY_SET_BYTE(buffer, 4, bulkOutputData->motorMode2_3);

    RHSP_ARRAY_SET_DWORD(buffer, 5, bulkOutputData->motor0Target);
    RHSP_ARRAY_SET_DWORD(buffer, 9, bulkOutputData->motor1Target);
    RHSP_ARRAY_SET_DWORD(buffer, 13, bulkOutputData->motor2Target);
    RHSP_ARRAY_SET_DWORD(buffer, 17, bulkOutputData->motor3Target);

    RHSP_ARRAY_SET_BYTE(buffer, 21, bulkOutputData->servoEnable);

    RHSP_ARRAY_SET_WORD(buffer, 22, bulkOutputData->servo0Command);
    RHSP_ARRAY_SET_WORD(buffer, 24, bulkOutputData->servo1Command);
    RHSP_ARRAY_SET_WORD(buffer, 26, bulkOutputData->servo2Command);
    RHSP_ARRAY_SET_WORD(buffer, 28, bulkOutputData->servo3Command);
    RHSP_ARRAY_SET_WORD(buffer, 30, bulkOutputData->servo4Command);
    RHSP_ARRAY_SET_WORD(buffer, 32, bulkOutputData->servo5Command);

    retval = rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
    // RHSP_ERROR_UNEXPECTED_RESPONSE means that we received nor ack or nack. Then we should check for bulk read packet
    if (retval < 0 && retval != RHSP_ERROR_UNEXPECTED_RESPONSE)
    {
        return retval;
    }
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    // check whether received packetID is correct
    if (RHSP_PACKET_ID(internalHub->rxBuffer) != (packetIDBulkRead | 0x8000))
    {
        return RHSP_ERROR_UNEXPECTED_RESPONSE;
    }

    // fill out bulk read data
    fillBulkInputData(hub, bulkInputDataResponse);

    return RHSP_RESULT_OK;
}

int rhsp_getADC(RhspRevHub* hub,
                uint8_t adcChannelToRead,
                uint8_t rawMode,
                int16_t* adcValue,
                uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (adcChannelToRead >= RHSP_NUMBER_OF_ADC_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (rawMode > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }
    int result = rhsp_getInterfacePacketID(hub, "DEKA", 7, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    uint8_t buffer[2] = {adcChannelToRead, rawMode};
    int retval = rhsp_sendReadCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (adcValue)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *adcValue = RHSP_ARRAY_WORD(int16_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;

}

int rhsp_phoneChargeControl(RhspRevHub* hub,
                            uint8_t chargeEnable,
                            uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (chargeEnable > 1)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int result = rhsp_getInterfacePacketID(hub, "DEKA", 44, &packetID, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, &chargeEnable, sizeof(chargeEnable), nackReasonCode);
}

int rhsp_phoneChargeQuery(RhspRevHub* hub,
                          uint8_t* chargeEnabled,
                          uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 45, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (chargeEnabled)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *chargeEnabled = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_injectDataLogHint(RhspRevHub* hub,
                           const char* hintText,
                           uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub || !hintText)
    {
        return RHSP_ERROR;
    }

    size_t length = strlen(hintText);
    if (length > RHSP_INJECT_DATA_LOG_MAX_HINT_TEXT_LENGTH)
    {
        length = RHSP_INJECT_DATA_LOG_MAX_HINT_TEXT_LENGTH;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 46, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[1 + RHSP_INJECT_DATA_LOG_MAX_HINT_TEXT_LENGTH];

    buffer[0] = length;
    memcpy(&buffer[1], hintText, length);

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_readVersion(RhspRevHub* hub, RhspVersion* version, uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 57, &packetID, nackReasonCode);
    if (retval < 0)
    {
        // ReadVersion not supported, use ReadVersionString logic
#define VERSION_FORMATTED_LENGTH    40 //buffer size for formatted version string including null terminated symbol
        retval = rhsp_getInterfacePacketID(hub, "DEKA", 48, &packetID, nackReasonCode);
        if (retval < 0)
        {
            return retval;
        }

        retval = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
        if (retval < 0)
        {
            return retval;
        }

        // version string contains 40 chars including null terminated symbol
        char fw_version_formatted[VERSION_FORMATTED_LENGTH];
        uint8_t length;

        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        length = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
        if (length > VERSION_FORMATTED_LENGTH - 1)
        {
            length = VERSION_FORMATTED_LENGTH - 1;
        }
        memcpy(fw_version_formatted, RHSP_ARRAY_BYTE_PTR(uint8_t*, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1),
               length);
        fw_version_formatted[length] = '\0';

        // extract major, minor and eng numbers from string "HW: 20, Maj: 1, Min: 8, Eng: 2"
        char* start = strstr(fw_version_formatted, "Maj");
        rhsp_assert(start);
        if (!start)
        {
            return RHSP_ERROR;
        }
        const char* maj_name = strtok(start, ",");
        rhsp_assert(maj_name);
        if (!maj_name)
        {
            return RHSP_ERROR;
        }

        const char* min_name = strtok(NULL, ",");
        rhsp_assert(min_name);
        if (!min_name)
        {
            return RHSP_ERROR;
        }

        const char* eng_name = strtok(NULL, ",");
        rhsp_assert(eng_name);
        if (!eng_name)
        {
            return RHSP_ERROR;
        }

        uint32_t maj = 0, min = 0, eng = 0;
        retval = sscanf(maj_name, "%*s %u", &maj);
        rhsp_assert(retval == 1);
        if (retval != 1)
        {
            return RHSP_ERROR;
        }

        retval = sscanf(min_name, "%*s %u", &min);
        rhsp_assert(retval == 1);
        if (retval != 1)
        {
            return RHSP_ERROR;
        }

        retval = sscanf(eng_name, "%*s %u", &eng);
        rhsp_assert(retval == 1);
        if (retval != 1)
        {
            return RHSP_ERROR;
        }

        if (version)
        {
            version->engineeringRevision = eng;
            version->minorVersion = min;
            version->majorVersion = maj;
            version->minorHwRevision = 0;
            version->majorHwRevision = 2;
            version->hwType = 0x311153;
        }

        return RHSP_RESULT_OK;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (version)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        version->engineeringRevision = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
        version->minorVersion = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
        version->majorVersion = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 2);
        version->minorHwRevision = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 3);
        version->majorHwRevision = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 4);
        version->hwType = RHSP_ARRAY_DWORD(uint32_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 5);
    }
    return RHSP_RESULT_OK;
}

int rhsp_readVersionString(RhspRevHub* hub,
                           uint8_t* textLength,
                           char* text,
                           uint8_t* nackReasonCode)
{
    // call read version
    RhspVersion version;
    int retval = rhsp_readVersion(hub, &version, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    // return version in format "<major>.<minor>.<eng>" .We copy string without null terminated symbol
    char fw_version_formatted[VERSION_FORMATTED_LENGTH];
    retval = snprintf(fw_version_formatted, VERSION_FORMATTED_LENGTH, "%u.%u.%u", version.majorVersion,
                      version.minorVersion, version.engineeringRevision);
    rhsp_assert(retval >= 0);
    if (retval < 0)
    {
        return RHSP_ERROR;
    }
    *textLength = (uint8_t) strlen(fw_version_formatted);
    memcpy(text, fw_version_formatted, *textLength);

    return RHSP_RESULT_OK;
}

#undef VERSION_FORMATTED_LENGTH

int rhsp_ftdiResetControl(RhspRevHub* hub,
                          uint8_t ftdiResetControl,
                          uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (ftdiResetControl > 1)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 49, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, &ftdiResetControl, sizeof(ftdiResetControl), nackReasonCode);
}

int rhsp_ftdiResetQuery(RhspRevHub* hub,
                        uint8_t* ftdiResetControl,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 50, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (ftdiResetControl)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *ftdiResetControl = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    return RHSP_RESULT_OK;
}

