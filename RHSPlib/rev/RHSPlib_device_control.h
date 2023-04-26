/*
 * RHSPlib_device_control.h
 *
 *  Created on: Dec 1, 2020
 *  Authors: Andrey Mihadyuk, Eugene Shushkevich
 */

#ifndef RHSPLIB_DEVICE_CONTROL_H_
#define RHSPLIB_DEVICE_CONTROL_H_

#include "RHSPlib.h"

#ifdef __cplusplus
extern "C" {
#endif

// bulk read data
typedef struct
{
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
    uint8_t	attentionRequired; // @TODO make sure this field is at right position. This field is undefined in version 1.8.2 and earlier
} RHSPlib_BulkInputData_T;


// RHSPlib version in bin format
typedef struct
{
    uint8_t engineeringRevision;
    uint8_t minorVersion;
    uint8_t majorVersion;
    uint8_t minorHwRevision;
    uint8_t majorHwRevision;
    uint32_t hwType;
} RHSPlib_Version_T;

/**
 * @brief get bulk input data
 *
 * @param[in] obj             module instance
 * @param[out] response       bulk input data. Can be NULL.
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_deviceControl_getBulkInputData(RHSPlib_Module_T *obj,
                                            RHSPlib_BulkInputData_T *response, uint8_t *nackReasonCode);

/**
 * @brief get ADC value
 *
 * @param[in]  obj               module instance
 * @param[in]  adcChannelToRead  ADC Channel to read
 * @param[in]  rawMode           Raw mode (engineering units = 0, raw counts = 1)
 * @param[out] adcValue          adc value
 * @param[out] nackReasonCode    nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_deviceControl_getADC(RHSPlib_Module_T *obj,
                                  uint8_t adcChannelToRead, uint8_t rawMode, int16_t *adcValue, uint8_t *nackReasonCode);


/**
 * @brief controls presence of charging voltage on USB port of Hardware Interface Board
 *
 * @param[in]  obj                      module instance
 * @param[in]  chargeEnable             charge enable (1 = on)
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_deviceControl_phoneChargeControl(RHSPlib_Module_T *obj,
                                              uint8_t chargeEnable, uint8_t *nackReasonCode);

/**
 * @brief reports status of charging voltage on USB port of Hardware Interface Board
 *
 * @param[in]  obj                      module instance
 * @param[out] chargeEnabled            charge enabled (1 = on)
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_NOERROR in case success
 *
 * */
int RHSPlib_deviceControl_phoneChargeQuery(RHSPlib_Module_T *obj,
                                            uint8_t *chargeEnabled, uint8_t *nackReasonCode);

/**
 * @brief Inserts text into UART2 data log stream
 *
 * @param[in]  obj                      module instance
 * @param[in]  hintText                 hint text.
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @note The hintText length shall be less or equal 100 characters without null terminated symbol,
 *       otherwise it will be cut off
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_deviceControl_injectDataLogHint(RHSPlib_Module_T *obj,
                                             const char *hintText, uint8_t *nackReasonCode);

/**
 * @brief returns the Hardware and Software versions in a human-readable string
 *
 * @param[in]  obj                      module instance
 * @param[out] textLength               textLength in range 0 - 39
 * @param[out] text                     version string in human readable format
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @note the function writes the version string without null terminating symbol.
 *       User should allocate buffer for 39 bytes to avoid access violation
 *       but if null terminated symbol is required, allocate 40 bytes.
 *
 *       example:
 *       char version[40];
 *       uint8_t length;
 *       int retval = RHSPlib_deviceControl_readVersionString(&module, &length, version, NULL);
 *       assert(retval >= 0);
 *       version[length] = '\0'; // insert null terminate symbol
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_deviceControl_readVersionString(RHSPlib_Module_T *obj,
                                             uint8_t *textLength, char *text, uint8_t *nackReasonCode);

/**
 * @brief returns the Hardware and Software versions in bin format
 *
 * @param[in]  obj                      module instance
 * @param[out] version                  version info. can be NULL.
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_deviceControl_readVersion(RHSPlib_Module_T *obj, RHSPlib_Version_T *version, uint8_t *nackReasonCode);

/**
 * @brief controls whether the FTDI chip will be reset on keep alive timeout
 *
 * @param[in]  obj                      module instance
 * @param[in]  ftdiResetControl         reset FTDI upon keep alive timeout. 1 - on, 0 - off
 * @param[out] nackReasonCode           nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_deviceControl_ftdiResetControl(RHSPlib_Module_T *obj,
                                            uint8_t ftdiResetControl, uint8_t *nackReasonCode);

/**
 * @brief reports status of whether the FTDI chip will be reset on keep alive timeout
 *
 * @param[in]  obj                     module instance
 * @param[out] ftdiResetControl        reset FTDI upon keep alive timeout. 1 - on, 0 - off
 * @param[out] nackReasonCode          nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_deviceControl_ftdiResetQuery(RHSPlib_Module_T *obj,
                                          uint8_t *ftdiResetControl, uint8_t *nackReasonCode);

#ifdef __cplusplus
}
#endif

#endif /* RHSPLIB_DEVICE_CONTROL_H_ */
