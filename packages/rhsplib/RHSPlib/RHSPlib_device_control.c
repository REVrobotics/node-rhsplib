/*
 * RHSPlib_device_control.c
 *
 *  Created on: Dec 1, 2020
 *  Authors: Andrey Mihadyuk, Eugene Shushkevich
 */
#include <stdio.h>
#include <string.h>

#include "RHSPlib_device_control.h"

#define BULK_READ_FUNCTION_ID	0

static void fillBulkInputData(const RHSPlib_Module_T *obj, RHSPlib_BulkInputData_T *data);

static void fillBulkInputData(const RHSPlib_Module_T *obj, RHSPlib_BulkInputData_T *data)
{
	if (!data)
	{
		return;
	}

	const uint8_t *payload   = RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer);
	data->digitalInputs      = RHSPLIB_ARRAY_BYTE(uint8_t, payload, 0);

	data->motor0position_enc = RHSPLIB_ARRAY_DWORD(int32_t, payload, 1);
	data->motor1position_enc = RHSPLIB_ARRAY_DWORD(int32_t, payload, 5);
	data->motor2position_enc = RHSPLIB_ARRAY_DWORD(int32_t, payload, 9);
	data->motor3position_enc = RHSPLIB_ARRAY_DWORD(int32_t, payload, 13);

	data->motorStatus = RHSPLIB_ARRAY_BYTE(uint8_t, payload, 17);

	data->motor0velocity_cps = RHSPLIB_ARRAY_WORD(int16_t, payload, 18);
	data->motor0velocity_cps = RHSPLIB_ARRAY_WORD(int16_t, payload, 20);
	data->motor0velocity_cps = RHSPLIB_ARRAY_WORD(int16_t, payload, 22);
	data->motor0velocity_cps = RHSPLIB_ARRAY_WORD(int16_t, payload, 24);

	data->analog0_mV = RHSPLIB_ARRAY_WORD(int16_t, payload, 26);
	data->analog1_mV = RHSPLIB_ARRAY_WORD(int16_t, payload, 28);
	data->analog2_mV = RHSPLIB_ARRAY_WORD(int16_t, payload, 30);
	data->analog3_mV = RHSPLIB_ARRAY_WORD(int16_t, payload, 32);

	data->attentionRequired = RHSPLIB_ARRAY_BYTE(uint8_t, payload, 34);
}

int RHSPlib_deviceControl_getBulkInputData(RHSPlib_Module_T *obj,
                                            RHSPlib_BulkInputData_T *response, uint8_t *nackReasonCode)
{
	uint16_t packetID;
    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", BULK_READ_FUNCTION_ID, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    result = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    fillBulkInputData(obj, response);

    return RHSPLIB_RESULT_OK;
}

int RHSPlib_deviceControl_getADC(RHSPlib_Module_T *obj,
                                  uint8_t adcChannelToRead, uint8_t rawMode, int16_t *adcValue, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (adcChannelToRead >= RHSPLIB_MAX_NUMBER_OF_ADC_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (rawMode > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 7, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    uint8_t buffer[2] = {adcChannelToRead, rawMode};
    int retval = RHSPlib_sendReadCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (adcValue)
    {
        *adcValue = RHSPLIB_ARRAY_WORD(int16_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;

}


int RHSPlib_deviceControl_phoneChargeControl(RHSPlib_Module_T *obj,
                                              uint8_t chargeEnable, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (chargeEnable > 1)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int result = RHSPlib_getInterfacePacketID(obj, "DEKA", 44, &packetID, nackReasonCode);
    if (result < 0)
    {
    	return result;
    }

    return RHSPlib_sendWriteCommandInternal(obj, packetID, &chargeEnable, sizeof(chargeEnable), nackReasonCode);
}

int RHSPlib_deviceControl_phoneChargeQuery(RHSPlib_Module_T *obj,
                                            uint8_t *chargeEnabled, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 45, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (chargeEnabled)
    {
        *chargeEnabled = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_deviceControl_injectDataLogHint(RHSPlib_Module_T *obj,
                                             const char *hintText, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(hintText);

    if (!obj || !hintText)
    {
        return RHSPLIB_ERROR;
    }

    size_t length = strlen(hintText);
    if (length > RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH)
    {
        length = RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 46, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[1 + RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH];

    buffer[0] = length;
    memcpy(&buffer[1], hintText, length);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_deviceControl_readVersion(RHSPlib_Module_T *obj, RHSPlib_Version_T *version, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 57, &packetID, nackReasonCode);
    if (retval < 0)
    {
        // ReadVersion not supported, use ReadVersionString logic
#define VERSION_FORMATTED_LENGTH	40 //buffer size for formatted version string including null terminated symbol
        retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 48, &packetID, nackReasonCode);
        if (retval < 0)
        {
            return retval;
        }

        retval = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
        if (retval < 0)
        {
            return retval;
        }

        // version string contains 40 chars including null terminated symbol
        char fw_version_formatted[VERSION_FORMATTED_LENGTH];
        uint8_t length;

        length = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
        if (length > VERSION_FORMATTED_LENGTH - 1)
        {
            length = VERSION_FORMATTED_LENGTH - 1;
        }
        memcpy(fw_version_formatted, RHSPLIB_ARRAY_BYTE_PTR(uint8_t*, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1), length);
        fw_version_formatted[length] = '\0';

        // extract major, minor and eng numbers from string "HW: 20, Maj: 1, Min: 8, Eng: 2"
        char *start = strstr(fw_version_formatted, "Maj");
        RHSPLIB_ASSERT(start);
        if (!start)
        {
        	return RHSPLIB_ERROR;
        }
        const char *maj_name = strtok(start, ",");
        RHSPLIB_ASSERT(maj_name);
        if (!maj_name)
        {
        	return RHSPLIB_ERROR;
        }

        const char *min_name = strtok(NULL, ",");
        RHSPLIB_ASSERT(min_name);
        if (!min_name)
		{
			return RHSPLIB_ERROR;
		}

        const char *eng_name = strtok(NULL, ",");
        RHSPLIB_ASSERT(eng_name);
        if (!eng_name)
		{
			return RHSPLIB_ERROR;
		}

        uint32_t maj = 0, min = 0, eng = 0;
        int retval = sscanf(maj_name, "%*s %u", &maj);
        RHSPLIB_ASSERT(retval == 1);
        if (retval != 1)
        {
        	return RHSPLIB_ERROR;
        }

        retval = sscanf(min_name, "%*s %u", &min);
        RHSPLIB_ASSERT(retval == 1);
        if (retval != 1)
        {
        	return RHSPLIB_ERROR;
        }

        retval = sscanf(eng_name, "%*s %u", &eng);
        RHSPLIB_ASSERT(retval == 1);
        if (retval != 1)
        {
        	return RHSPLIB_ERROR;
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

        return RHSPLIB_RESULT_OK;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (version)
    {
        version->engineeringRevision = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
        version->minorVersion        = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1);
        version->majorVersion        = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 2);
        version->minorHwRevision     = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 3);
        version->majorHwRevision     = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 4);
        version->hwType              = RHSPLIB_ARRAY_DWORD(uint32_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 5);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_deviceControl_readVersionString(RHSPlib_Module_T *obj,
                                             uint8_t *textLength, char *text, uint8_t *nackReasonCode)
{
    // call read version
    RHSPlib_Version_T version;
    int retval = RHSPlib_deviceControl_readVersion(obj, &version, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    // return version in format "<major>.<minor>.<eng>" .We copy string without null terminated symbol
    char fw_version_formatted[VERSION_FORMATTED_LENGTH];
    retval = snprintf(fw_version_formatted, VERSION_FORMATTED_LENGTH, "%u.%u.%u", version.majorVersion, version.minorVersion, version.engineeringRevision);
    RHSPLIB_ASSERT(retval >= 0);
    if (retval < 0)
    {
        return RHSPLIB_ERROR;
    }
    *textLength = (uint8_t)strlen(fw_version_formatted);
    memcpy(text, fw_version_formatted, *textLength);

    return RHSPLIB_RESULT_OK;
}
#undef VERSION_FORMATTED_LENGTH

int RHSPlib_deviceControl_ftdiResetControl(RHSPlib_Module_T *obj,
                                            uint8_t ftdiResetControl, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (ftdiResetControl > 1)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 49, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    return RHSPlib_sendWriteCommandInternal(obj, packetID, &ftdiResetControl, sizeof(ftdiResetControl), nackReasonCode);
}

int RHSPlib_deviceControl_ftdiResetQuery(RHSPlib_Module_T *obj,
                                          uint8_t *ftdiResetControl, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 50, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, NULL, 0, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (ftdiResetControl)
    {
        *ftdiResetControl = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    return RHSPLIB_RESULT_OK;
}

