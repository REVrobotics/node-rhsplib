/*
 * RHSPlib_i2c.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include <string.h>
#include "RHSPlib_i2c.h"

// @TODO move this setting to default settings
#define I2C_MAX_PAYLOAD_SIZE              100 //max payload for i2c data transfers

static int writeReadMultipleBytesFallback(RHSPlib_Module_T *obj,
                              	  	      uint8_t i2cChannel, uint8_t slaveAddress, uint8_t bytesToRead,
										  uint8_t startAddress, uint8_t *nackReasonCode);

int RHSPlib_i2c_configureChannel(RHSPlib_Module_T *obj,
                                  uint8_t i2cChannel, uint8_t speedCode, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    else if (speedCode > 1)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 43, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[2] = {i2cChannel, speedCode};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_i2c_configureQuery(RHSPlib_Module_T *obj,
                                uint8_t i2cChannel, uint8_t *speedCode, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 47, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (speedCode)
    {
        *speedCode = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_i2c_writeSingleByte(RHSPlib_Module_T *obj,
                                 uint8_t i2cChannel, uint8_t slaveAddress,
                                 uint8_t byteToWrite, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (slaveAddress > 127)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 37, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }


    uint8_t buffer[3] = {i2cChannel, slaveAddress, byteToWrite};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_i2c_writeMultipleBytes(RHSPlib_Module_T *obj,
                                    uint8_t i2cChannel, uint8_t slaveAddress,
                                    uint8_t bytesToWrite, const uint8_t *payload, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);
    RHSPLIB_ASSERT(payload);
    RHSPLIB_ASSERT(bytesToWrite > 0 && bytesToWrite <= I2C_MAX_PAYLOAD_SIZE);


    if (!obj || !payload)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (slaveAddress > 127)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    else if (bytesToWrite == 0 || bytesToWrite > I2C_MAX_PAYLOAD_SIZE)
    {
    	return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 38, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3 + I2C_MAX_PAYLOAD_SIZE] = {i2cChannel, slaveAddress, bytesToWrite};
    memcpy(&buffer[3], payload, (size_t)bytesToWrite);

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, 3 + bytesToWrite, nackReasonCode);
}

int RHSPlib_i2c_writeStatusQuery(RHSPlib_Module_T *obj,
                                  uint8_t i2cChannel, uint8_t *i2cTransactionStatus,
								  uint8_t *writtenBytes, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 42, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (i2cTransactionStatus)
    {
        *i2cTransactionStatus = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }
    if (writtenBytes)
    {
        *writtenBytes = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1);
    }
    return RHSPLIB_RESULT_OK;
}

int RHSPlib_i2c_readSingleByte(RHSPlib_Module_T *obj,
                                uint8_t i2cChannel, uint8_t slaveAddress, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (slaveAddress > 127)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 39, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[2] = {i2cChannel, slaveAddress};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int RHSPlib_i2c_readMultipleBytes(RHSPlib_Module_T *obj,
                                   uint8_t i2cChannel, uint8_t slaveAddress,
                                   uint8_t bytesToRead, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }

    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (slaveAddress > 127)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    else if (bytesToRead == 0 || bytesToRead > I2C_MAX_PAYLOAD_SIZE)
    {
    	return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 40, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[3] = {i2cChannel, slaveAddress, bytesToRead};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}


static int writeReadMultipleBytesFallback(RHSPlib_Module_T *obj,
                              	  	  	  uint8_t i2cChannel, uint8_t slaveAddress, uint8_t bytesToRead,
										  uint8_t startAddress, uint8_t *nackReasonCode)
{
    int result = RHSPlib_i2c_writeSingleByte(obj, i2cChannel, slaveAddress, startAddress, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (bytesToRead == 1)
    {
        result = RHSPlib_i2c_readSingleByte(obj, i2cChannel, slaveAddress, nackReasonCode);
    }
    else
    {
        result = RHSPlib_i2c_readMultipleBytes(obj, i2cChannel, slaveAddress, bytesToRead, nackReasonCode);
    }
    return result;
}

int RHSPlib_i2c_writeReadMultipleBytes(RHSPlib_Module_T *obj,
                                        uint8_t i2cChannel, uint8_t slaveAddress, uint8_t bytesToRead,
                                        uint8_t startAddress, uint8_t *nackReasonCode)
{
	uint16_t packetID;

    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
	{
		return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
	}
    else if (slaveAddress > 127)
    {
    	return RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE;
    }
    else if (bytesToRead == 0 || bytesToRead > I2C_MAX_PAYLOAD_SIZE)
    {
    	return RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE;
    }

    // if writeReadMultipleBytes is not supported,
    // use fallback is based on writeSingleByte, readSingleByte and readMultipleBytes
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 52, &packetID, nackReasonCode);
    if (retval == RHSPLIB_ERROR_COMMAND_NOT_SUPPORTED)
    {
        return writeReadMultipleBytesFallback(obj, i2cChannel, slaveAddress, bytesToRead, startAddress, nackReasonCode);
    }
    else if (retval < 0)
    {
    	return retval;
    }

    uint8_t buffer[4] = {i2cChannel, slaveAddress, bytesToRead, startAddress};

    return RHSPlib_sendWriteCommandInternal(obj, packetID, buffer, sizeof(buffer), nackReasonCode);
}


int RHSPlib_i2c_readStatusQuery(RHSPlib_Module_T *obj,
                                 uint8_t i2cChannel, uint8_t *i2cTransactionStatusByte,
                                 uint8_t *bytesRead, uint8_t *payload, uint8_t *nackReasonCode)
{
	uint16_t packetID;
    RHSPLIB_ASSERT(obj);

    if (!obj)
    {
        return RHSPLIB_ERROR;
    }
    if (i2cChannel >= RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS)
    {
    	return RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = RHSPlib_getInterfacePacketID(obj, "DEKA", 41, &packetID, nackReasonCode);
    if (retval < 0)
    {
    	return retval;
    }


    retval = RHSPlib_sendReadCommandInternal(obj, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (i2cTransactionStatusByte)
    {
        *i2cTransactionStatusByte = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 0);
    }

    uint8_t bytes_read = RHSPLIB_ARRAY_BYTE(uint8_t, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 1);
    if (bytesRead)
    {
        *bytesRead = bytes_read;
    }
    if (payload)
    {
        memcpy(payload, RHSPLIB_ARRAY_BYTE_PTR(uint8_t*, RHSPLIB_PACKET_PAYLOAD_PTR(obj->rxBuffer), 2), bytes_read);
    }
    return RHSPLIB_RESULT_OK;
}
