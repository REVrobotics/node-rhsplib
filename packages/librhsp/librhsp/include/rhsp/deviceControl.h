/*
 * deviceControl.h
 *
 *  Created on: Dec 1, 2020
 *  Authors: Andrey Mihadyuk, Eugene Shushkevich
 */

#ifndef RHSP_DEVICE_CONTROL_H_
#define RHSP_DEVICE_CONTROL_H_

#include "revhub.h"
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define RHSP_INJECT_DATA_LOG_MAX_HINT_TEXT_LENGTH 100

// bulk read data
typedef struct {
    uint8_t digitalInputs;
    int32_t motor0position_enc;
    int32_t motor1position_enc;
    int32_t motor2position_enc;
    int32_t motor3position_enc;
    uint8_t motorStatus;
    int16_t motor0velocity_cps;  // counts per second
    int16_t motor1velocity_cps;
    int16_t motor2velocity_cps;
    int16_t motor3velocity_cps;
    int16_t analog0_mV;
    int16_t analog1_mV;
    int16_t analog2_mV;
    int16_t analog3_mV;
    uint8_t attentionRequired; // @TODO make sure this field is at right position. This field is undefined in version 1.8.2 and earlier
} RhspBulkInputData;

// bulk write data
typedef struct {
    uint8_t digitalOutputs;
    uint8_t digitalDirections;
    uint8_t motorEnable;
    uint8_t motorMode0_1;
    uint8_t motorMode2_3;
    int32_t motor0Target;
    int32_t motor1Target;
    int32_t motor2Target;
    int32_t motor3Target;
    uint8_t servoEnable;
    uint16_t servo0Command;
    uint16_t servo1Command;
    uint16_t servo2Command;
    uint16_t servo3Command;
    uint16_t servo4Command;
    uint16_t servo5Command;
} RhspBulkOutputData;

// RHSP version in bin format
typedef struct {
    uint8_t engineeringRevision;
    uint8_t minorVersion;
    uint8_t majorVersion;
    uint8_t minorHwRevision;
    uint8_t majorHwRevision;
    uint32_t hwType;
} RhspVersion;

/**
 * @brief get bulk input data
 *
 * @param[in] hub             module instance
 * @param[out] response       bulk input data. Can be NULL.
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getBulkInputData(RhspRevHub* hub,
                          RhspBulkInputData* response,
                          uint8_t* nackReasonCode);

/**
 * @brief set bulk output data
 *
 * @param[in]  hub             module instance
 * @param[in]  bulkOutputData  bulk output data.
 * @param[out] bulkInputData   bulk input data. can be NULL.
 * @param[out] nackReasonCode  nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_setBulkOutputData(RhspRevHub* hub,
                           const RhspBulkOutputData* bulkOutputData,
                           RhspBulkInputData* bulkInputDataResponse,
                           uint8_t* nackReasonCode);
/**
 * @brief get ADC value
 *
 * @param[in]  hub               module instance
 * @param[in]  adcChannelToRead  ADC Channel to read
 * @param[in]  rawMode           Raw mode (engineering units = 0, raw counts = 1)
 * @param[out] adcValue          adc value
 * @param[out] nackReasonCode    nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getADC(RhspRevHub* hub,
                uint8_t adcChannelToRead,
                uint8_t rawMode,
                int16_t* adcValue,
                uint8_t* nackReasonCode);

/**
 * @brief controls presence of charging voltage on USB port of Hardware Interface Board
 *
 * @param[in]  hub                      module instance
 * @param[in]  chargeEnable             charge enable (1 = on)
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_phoneChargeControl(RhspRevHub* hub,
                            uint8_t chargeEnable,
                            uint8_t* nackReasonCode);

/**
 * @brief reports status of charging voltage on USB port of Hardware Interface Board
 *
 * @param[in]  hub                      module instance
 * @param[out] chargeEnabled            charge enabled (1 = on)
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_NOERROR in case success
 *
 * */
int rhsp_phoneChargeQuery(RhspRevHub* hub,
                          uint8_t* chargeEnabled,
                          uint8_t* nackReasonCode);

/**
 * @brief Inserts text into UART2 data log stream
 *
 * @param[in]  hub                      module instance
 * @param[in]  hintText                 hint text.
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @note The hintText length shall be less or equal 100 characters without null terminated symbol,
 *       otherwise it will be cut off
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_injectDataLogHint(RhspRevHub* hub,
                           const char* hintText,
                           uint8_t* nackReasonCode);

/**
 * @brief returns the Hardware and Software versions in a human-readable string
 *
 * @param[in]  hub                      module instance
 * @param[out] textLength               textLength in range 0 - 39
 * @param[out] text                     version string in human readable format
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @note the function writes the version string without null terminating symbol.
 *       User should allocate buffer for 39 bytes to avoid access violation
 *       but if null terminated symbol is required, allocate 40 bytes.
 *
 *       example:
 *       char version[40];
 *       uint8_t length;
 *       int retval = rhsp_readVersionString(&module, &length, version, NULL);
 *       assert(retval >= 0);
 *       version[length] = '\0'; // insert null terminate symbol
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_readVersionString(RhspRevHub* hub,
                           uint8_t* textLength,
                           char* text,
                           uint8_t* nackReasonCode);

/**
 * @brief returns the Hardware and Software versions in bin format
 *
 * @param[in]  hub                      module instance
 * @param[out] version                  version info. can be NULL.
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_readVersion(RhspRevHub* hub, RhspVersion* version, uint8_t* nackReasonCode);

/**
 * @brief controls whether the FTDI chip will be reset on keep alive timeout
 *
 * @param[in]  hub                      module instance
 * @param[in]  ftdiResetControl         reset FTDI upon keep alive timeout. 1 - on, 0 - off
 * @param[out] nackReasonCode           nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_ftdiResetControl(RhspRevHub* hub,
                          uint8_t ftdiResetControl,
                          uint8_t* nackReasonCode);

/**
 * @brief reports status of whether the FTDI chip will be reset on keep alive timeout
 *
 * @param[in]  hub                     module instance
 * @param[out] ftdiResetControl        reset FTDI upon keep alive timeout. 1 - on, 0 - off
 * @param[out] nackReasonCode          nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_ftdiResetQuery(RhspRevHub* hub,
                        uint8_t* ftdiResetControl,
                        uint8_t* nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSP_DEVICE_CONTROL_H_ */
