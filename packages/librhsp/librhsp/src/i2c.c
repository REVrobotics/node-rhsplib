/*
 * i2c.c
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */
#include <string.h>
#include "rhsp/i2c.h"
#include "rhsp/module.h"
#include "internal/packet.h"
#include "internal/arrayutils.h"
#include "rhsp/compiler.h"
#include "internal/command.h"
#include "internal/revhub.h"

#define RHSP_NUMBER_OF_I2C_CHANNELS 4

// @TODO move this setting to default settings
#define I2C_MAX_PAYLOAD_SIZE              100 //max payload for i2c data transfers
#define I2C_TRANSACTION_ARRAY_MAX_SIZE    108 //max i2c transaction array size
#define I2C_MAX_TRANSACTION_ARRAY_COUNT      10  //max transaction arrays

static int writeReadMultipleBytesFallback(RhspRevHub* hub,
                                          uint8_t i2cChannel,
                                          uint8_t slaveAddress,
                                          uint8_t bytesToRead,
                                          uint8_t startAddress,
                                          uint8_t* nackReasonCode);

int rhsp_configureI2cChannel(RhspRevHub* hub,
                             uint8_t i2cChannel,
                             uint8_t speedCode,
                             uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (speedCode > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 43, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {i2cChannel, speedCode};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_configureI2cQuery(RhspRevHub* hub,
                           uint8_t i2cChannel,
                           uint8_t* speedCode,
                           uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 47, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (speedCode)
    {
        RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
        *speedCode = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    return RHSP_RESULT_OK;
}

int rhsp_writeSingleByte(RhspRevHub* hub,
                         uint8_t i2cChannel,
                         uint8_t slaveAddress,
                         uint8_t byteToWrite,
                         uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (slaveAddress > 127)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 37, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[3] = {i2cChannel, slaveAddress, byteToWrite};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_writeMultipleBytes(RhspRevHub* hub,
                            uint8_t i2cChannel,
                            uint8_t slaveAddress,
                            uint8_t bytesToWrite,
                            const uint8_t* payload,
                            uint8_t* nackReasonCode)
{
    uint16_t packetID;
    rhsp_assert(bytesToWrite > 0 && bytesToWrite <= I2C_MAX_PAYLOAD_SIZE);

    if (!hub || !payload)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (slaveAddress > 127)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    } else if (bytesToWrite == 0 || bytesToWrite > I2C_MAX_PAYLOAD_SIZE)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 38, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[3 + I2C_MAX_PAYLOAD_SIZE] = {i2cChannel, slaveAddress, bytesToWrite};
    memcpy(&buffer[3], payload, (size_t) bytesToWrite);

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, 3 + bytesToWrite, nackReasonCode);
}

int rhsp_writeStatusQuery(RhspRevHub* hub,
                          uint8_t i2cChannel,
                          uint8_t* i2cTransactionStatus,
                          uint8_t* writtenBytes,
                          uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 42, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    retval = rhsp_sendReadCommandInternal(hub, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }
    if (i2cTransactionStatus)
    {
        *i2cTransactionStatus = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }
    if (writtenBytes)
    {
        *writtenBytes = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
    }
    return RHSP_RESULT_OK;
}

int rhsp_readSingleByte(RhspRevHub* hub,
                        uint8_t i2cChannel,
                        uint8_t slaveAddress,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (slaveAddress > 127)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 39, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {i2cChannel, slaveAddress};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_readMultipleBytes(RhspRevHub* hub,
                           uint8_t i2cChannel,
                           uint8_t slaveAddress,
                           uint8_t bytesToRead,
                           uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }

    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (slaveAddress > 127)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    } else if (bytesToRead == 0 || bytesToRead > I2C_MAX_PAYLOAD_SIZE)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 40, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[3] = {i2cChannel, slaveAddress, bytesToRead};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

static int writeReadMultipleBytesFallback(RhspRevHub* hub,
                                          uint8_t i2cChannel,
                                          uint8_t slaveAddress,
                                          uint8_t bytesToRead,
                                          uint8_t startAddress,
                                          uint8_t* nackReasonCode)
{
    int result = rhsp_writeSingleByte(hub, i2cChannel, slaveAddress, startAddress, nackReasonCode);
    if (result < 0)
    {
        return result;
    }

    if (bytesToRead == 1)
    {
        result = rhsp_readSingleByte(hub, i2cChannel, slaveAddress, nackReasonCode);
    } else
    {
        result = rhsp_readMultipleBytes(hub, i2cChannel, slaveAddress, bytesToRead, nackReasonCode);
    }
    return result;
}

int rhsp_writeReadMultipleBytes(RhspRevHub* hub,
                                uint8_t i2cChannel,
                                uint8_t slaveAddress,
                                uint8_t bytesToRead,
                                uint8_t startAddress,
                                uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (slaveAddress > 127)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    } else if (bytesToRead == 0 || bytesToRead > I2C_MAX_PAYLOAD_SIZE)
    {
        return RHSP_ERROR_ARG_3_OUT_OF_RANGE;
    }

    // if writeReadMultipleBytes is not supported,
    // use fallback is based on writeSingleByte, readSingleByte and readMultipleBytes
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 52, &packetID, nackReasonCode);
    if (retval == RHSP_ERROR_COMMAND_NOT_SUPPORTED)
    {
        return writeReadMultipleBytesFallback(hub, i2cChannel, slaveAddress, bytesToRead, startAddress, nackReasonCode);
    } else if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[4] = {i2cChannel, slaveAddress, bytesToRead, startAddress};

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_readStatusQuery(RhspRevHub* hub,
                         uint8_t i2cChannel,
                         uint8_t* i2cTransactionStatusByte,
                         uint8_t* bytesRead,
                         uint8_t* payload,
                         uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    }
    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 41, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    retval = rhsp_sendReadCommandInternal(hub, packetID, &i2cChannel, sizeof(i2cChannel), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;
    if (i2cTransactionStatusByte)
    {
        *i2cTransactionStatusByte = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    uint8_t bytes_read = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
    if (bytesRead)
    {
        *bytesRead = bytes_read;
    }
    if (payload)
    {
        memcpy(payload, RHSP_ARRAY_BYTE_PTR(uint8_t*, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 2), bytes_read);
    }
    return RHSP_RESULT_OK;
}

int rhsp_i2cTransaction(RhspRevHub* hub,
                        uint8_t i2cChannel,
                        uint8_t transactionArrayCount,
                        const RhspI2cTransactionArray* transactionArray,
                        uint8_t* nackReasonCode)
{
    uint16_t packetID;
    if (!hub || !transactionArray)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (transactionArrayCount == 0 || transactionArrayCount > I2C_MAX_TRANSACTION_ARRAY_COUNT)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 54, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    size_t totalArraySize = 0;
    for (size_t i = 0; i < transactionArrayCount; i++)
    {
        totalArraySize += transactionArray[i].length;
    }

    if (totalArraySize > I2C_TRANSACTION_ARRAY_MAX_SIZE)
    {
        return RHSP_ERROR;
    }

    uint8_t buffer[2 + I2C_TRANSACTION_ARRAY_MAX_SIZE] = {i2cChannel, transactionArrayCount};
    size_t offset = 2;
    for (size_t i = 0; i < transactionArrayCount; i++)
    {
        buffer[offset++] = transactionArray[i].address;
        buffer[offset++] = transactionArray[i].flags;
        buffer[offset++] = transactionArray[i].length;
        memcpy(&buffer[offset], transactionArray[i].buffer, transactionArray[i].length);
        offset += transactionArray[i].length;
    }

    return rhsp_sendWriteCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
}

int rhsp_i2cTransactionQuery(RhspRevHub* hub,
                             uint8_t i2cChannel,
                             uint8_t doShortResponse,
                             uint8_t* i2cTransactionStatusByte,
                             uint8_t* numberOfTransactions,
                             RhspI2cTransactionArray* transactionArray,
                             uint8_t* nackReasonCode)
{
    uint16_t packetID;
    RhspRevHubInternal* internalHub = (RhspRevHubInternal*) hub;

    if (!hub)
    {
        return RHSP_ERROR;
    }
    if (i2cChannel >= RHSP_NUMBER_OF_I2C_CHANNELS)
    {
        return RHSP_ERROR_ARG_1_OUT_OF_RANGE;
    } else if (doShortResponse > 1)
    {
        return RHSP_ERROR_ARG_2_OUT_OF_RANGE;
    }

    int retval = rhsp_getInterfacePacketID(hub, "DEKA", 55, &packetID, nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    uint8_t buffer[2] = {i2cChannel, doShortResponse};
    retval = rhsp_sendReadCommandInternal(hub, packetID, buffer, sizeof(buffer), nackReasonCode);
    if (retval < 0)
    {
        return retval;
    }

    if (i2cTransactionStatusByte)
    {
        *i2cTransactionStatusByte = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 0);
    }

    uint8_t number_of_transactions = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), 1);
    if (numberOfTransactions)
    {
        *numberOfTransactions = number_of_transactions;
    }

    if (transactionArray)
    {
        size_t offset = 2; // we set pointer to "I2C Transaction Array" at offset 2 according to spec
        for (size_t i = 0; i < number_of_transactions; i++)
        {
            transactionArray[i].address = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer),
                                                          offset++);
            transactionArray[i].flags = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer),
                                                        offset++);
            transactionArray[i].length = RHSP_ARRAY_BYTE(uint8_t, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer),
                                                         offset++);
            // normally device must not exceed the buffer size but if the module contains some bugs it could happen
            // @TODO consider to add a new ERROR for such cases
            if (transactionArray[i].length > RHSP_I2C_TRANSACTION_ARRAY_MAX_BUFFER_SIZE)
            {
                return RHSP_ERROR;
            }
            memcpy(transactionArray[i].buffer,
                   RHSP_ARRAY_BYTE_PTR(uint8_t*, RHSP_PACKET_PAYLOAD_PTR(internalHub->rxBuffer), offset),
                   transactionArray[i].length);
            offset += transactionArray[i].length;
        }
    }

    return RHSP_RESULT_OK;
}

