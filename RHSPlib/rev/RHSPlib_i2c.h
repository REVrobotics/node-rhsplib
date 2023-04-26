/*
 * RHSPlib_i2c.h
 *
 *  Created on: Dec 17, 2020
 *      Author: user
 */

#ifndef RHSPLIB_I2C_H_
#define RHSPLIB_I2C_H_

#include "RHSPlib.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief configure i2c channel
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  speedCode         speed code. 0 - 100 kbits/sec, 1 - 400 kbits/sec
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_configureChannel(RHSPlib_Module_T *obj,
                                  uint8_t i2cChannel, uint8_t speedCode, uint8_t *nackReasonCode);

/**
 * @brief get i2c channel configuration
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[out] speedCode         speed code. 0 - 100 kbits/sec, 1 - 400 kbits/sec
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_i2c_configureQuery(RHSPlib_Module_T *obj,
                                uint8_t i2cChannel, uint8_t *speedCode, uint8_t *nackReasonCode);

/**
 * @brief write single byte to i2c channel
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  slaveAddress      slave address in range 1 - 127
 * @param[in]  byteToWrite       byte to write
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_writeSingleByte(RHSPlib_Module_T *obj,
                                 uint8_t i2cChannel, uint8_t slaveAddress, uint8_t byteToWrite,
                                 uint8_t *nackReasonCode);

/**
 * @brief write multiple bytes to i2c channel
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel in range 0 - 3
 * @param[in]  slaveAddress      slave address in range 1 - 127
 * @param[in]  bytesToWrite      bytes to write in range 1 - 100
 * @oaram[in]  payload           payload bytes
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_writeMultipleBytes(RHSPlib_Module_T *obj,
                                    uint8_t i2cChannel, uint8_t slaveAddress,
                                    uint8_t bytesToWrite, const uint8_t *payload, uint8_t *nackReasonCode);

/**
 * @brief check for completion i2c write operation
 *
 * @param[in]  obj                  module instance
 * @param[in]  i2cChannel           i2cChannel in range 0 -  3
 * @param[out] i2cTransactionStatus i2c transaction status in range 0 - 3
 * @param[out] writtenBytes         number of bytes written in range 0 - 100
 * @param[out] nackReasonCode       nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_NOERROR in case success
 *
 * */
int RHSPlib_i2c_writeStatusQuery(RHSPlib_Module_T *obj,
                                  uint8_t i2cChannel, uint8_t *i2cTransactionStatus,
                                  uint8_t *writtenBytes, uint8_t *nackReasonCode);

/**
 * @brief read single byte from i2c channel
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_readSingleByte(RHSPlib_Module_T *obj,
                                uint8_t i2cChannel, uint8_t slaveAddress, uint8_t *nackReasonCode);

/**
 * @brief read multiple bytes from i2c channel
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[in]  bytesToRead       number of bytes to read in range 1 - 100
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_readMultipleBytes(RHSPlib_Module_T *obj,
                                   uint8_t i2cChannel, uint8_t slaveAddress, uint8_t bytesToRead,
                                   uint8_t *nackReasonCode);

/**
 * @brief write a starting address then read multiple bytes from specified address
 *
 * @param[in]  obj               module instance
 * @param[in]  i2cChannel        i2cChannel
 * @param[in]  slaveAddress      slave address in range 0 - 127
 * @param[in]  bytesToRead       number of bytes to read in range 1 - 100
 * @param[in]  startAddress      start address in range 0 - 255
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_i2c_writeReadMultipleBytes(RHSPlib_Module_T *obj,
                                        uint8_t i2cChannel, uint8_t slaveAddress, uint8_t bytesToRead,
                                        uint8_t startAddress, uint8_t *nackReasonCode);
/**
 * @brief check for compeltion of i2c read operation
 *
 * @param[in]  obj                      module instance
 * @param[in]  i2cChannel               i2c channel in range 0 - 3
 * @param[out] i2cTransactionStatusByte i2c transaction status byte
 * @param[out] bytesRead                number of bytes read in range 0 - 100
 * @param[out] payload                  payload bytes
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_i2c_readStatusQuery(RHSPlib_Module_T *obj,
                                 uint8_t i2cChannel, uint8_t *i2cTransactionStatusByte,
                                 uint8_t *bytesRead, uint8_t *payload, uint8_t *nackReasonCode);

#ifdef __cplusplus
}
#endif


#endif /* RHSPLIB_I2C_H_ */
