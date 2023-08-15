/*
 * i2c.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSP_I2C_H_
#define RHSP_I2C_H_

#include "revhub.h"
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define RHSP_I2C_TRANSACTION_ARRAY_MAX_BUFFER_SIZE 97

// i2c transaction array
typedef struct {
    uint8_t address;
    uint8_t flags;
    uint8_t length;
    uint8_t buffer[RHSP_I2C_TRANSACTION_ARRAY_MAX_BUFFER_SIZE];
} RhspI2cTransactionArray;

/**
 * @brief configure i2c channel
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  speedCode         speed code. 0 - 100 kbits/sec, 1 - 400 kbits/sec
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_configureI2cChannel(RhspRevHub* hub,
                             uint8_t i2cChannel,
                             uint8_t speedCode,
                             uint8_t* nackReasonCode);

/**
 * @brief get i2c channel configuration
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[out] speedCode         speed code. 0 - 100 kbits/sec, 1 - 400 kbits/sec
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_configureI2cQuery(RhspRevHub* hub,
                           uint8_t i2cChannel,
                           uint8_t* speedCode,
                           uint8_t* nackReasonCode);

/**
 * @brief write single byte to i2c channel
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  slaveAddress      slave address in range 1 - 127
 * @param[in]  byteToWrite       byte to write
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_writeSingleByte(RhspRevHub* hub,
                         uint8_t i2cChannel,
                         uint8_t slaveAddress,
                         uint8_t byteToWrite,
                         uint8_t* nackReasonCode);

/**
 * @brief write multiple bytes to i2c channel
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  slaveAddress      slave address in range 1 - 127
 * @param[in]  bytesToWrite      bytes to write in range 1 - 100
 * @oaram[in]  payload           payload bytes
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_writeMultipleBytes(RhspRevHub* hub,
                            uint8_t i2cChannel,
                            uint8_t slaveAddress,
                            uint8_t bytesToWrite,
                            const uint8_t* payload,
                            uint8_t* nackReasonCode);

/**
 * @brief check for completion i2c write operation
 *
 * @param[in]  hub                  module instance
 * @param[in]  i2cChannel           i2cChannel in range 0 -  3
 * @param[out] i2cTransactionStatus i2c transaction status in range 0 - 3
 * @param[out] writtenBytes         number of bytes written in range 0 - 100
 * @param[out] nackReasonCode       nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_NOERROR in case success
 *
 * */
int rhsp_writeStatusQuery(RhspRevHub* hub,
                          uint8_t i2cChannel,
                          uint8_t* i2cTransactionStatus,
                          uint8_t* writtenBytes,
                          uint8_t* nackReasonCode);

/**
 * @brief read single byte from i2c channel
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_readSingleByte(RhspRevHub* hub,
                        uint8_t i2cChannel,
                        uint8_t slaveAddress,
                        uint8_t* nackReasonCode);

/**
 * @brief read multiple bytes from i2c channel
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[in]  bytesToRead       number of bytes to read in range 1 - 100
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_readMultipleBytes(RhspRevHub* hub,
                           uint8_t i2cChannel,
                           uint8_t slaveAddress,
                           uint8_t bytesToRead,
                           uint8_t* nackReasonCode);

/**
 * @brief write a starting address then read multiple bytes from specified address
 *
 * @param[in]  hub               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[in]  bytesToRead       number of bytes to read in range 1 - 100
 * @param[in]  startAddress      start address in range 0 - 255
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_writeReadMultipleBytes(RhspRevHub* hub,
                                uint8_t i2cChannel,
                                uint8_t slaveAddress,
                                uint8_t bytesToRead,
                                uint8_t startAddress,
                                uint8_t* nackReasonCode);
/**
 * @brief check for compeltion of i2c read operation
 *
 * @param[in]  hub                      module instance
 * @param[in]  i2cChannel               i2c channel in range 0 - 3
 * @param[out] i2cTransactionStatusByte i2c transaction status byte
 * @param[out] bytesRead                number of bytes read in range 0 - 100
 * @param[out] payload                  payload bytes
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_readStatusQuery(RhspRevHub* hub,
                         uint8_t i2cChannel,
                         uint8_t* i2cTransactionStatusByte,
                         uint8_t* bytesRead,
                         uint8_t* payload,
                         uint8_t* nackReasonCode);

/**
 * @brief write single combined I2C message, including one or multiple reads or writes
 *
 * @param[in]  hub                      module instance
 * @param[in]  i2cChannel               i2c channel in range 0 - 3
 * @param[in]  transactionArrayCount    transaction array count
 * @param[in]  transactionArray         transaction array
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_i2cTransaction(RhspRevHub* hub,
                        uint8_t i2cChannel,
                        uint8_t transactionArrayCount,
                        const RhspI2cTransactionArray* transactionArray,
                        uint8_t* nackReasonCode);

/**
 * @brief query I2C transaction
 *
 * @param[in]  hub                      module instance
 * @param[in]  i2cChannel               i2c channel in range 0 - 3
 * @param[in]  doShortResponse          The Do Short Response field is used to limit the size of the response to only the status byte.
 *                                      This is useful for write-only transactions
 * @param[out] transactionStatusByte    transaction status byte
 * @param[out] numberOfTransactions     number of transactions
 * @param[out] transactionArray         transaction array
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_i2cTransactionQuery(RhspRevHub* hub,
                             uint8_t i2cChannel,
                             uint8_t doShortResponse,
                             uint8_t* i2cTransactionStatusByte,
                             uint8_t* numberOfTransactions,
                             RhspI2cTransactionArray* transactionArray,
                             uint8_t* nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSP_I2C_H_ */
