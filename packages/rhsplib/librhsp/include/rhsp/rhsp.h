/***
 *  rhsp.h
 *
 *  Created on: Nov 25, 2020
 *  Author: Andrey Mihadyuk
 *
 */

#ifndef RHSP_H_
#define RHSP_H_

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>

#include "compiler.h"
#include "deviceControl.h"
#include "dio.h"
#include "errors.h"
#include "i2c.h"
#include "module.h"
#include "motor.h"
#include "revhub.h"
#include "serial.h"
#include "servo.h"
#include "time.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    RHSP_DEBUG_GROUP_NUMBER_MAIN = 1,
    RHSP_DEBUG_GROUP_NUMBER_TRANSMITTER_TO_HOST = 2,
    RHSP_DEBUG_GROUP_NUMBER_RECEIVER_FROM_HOST = 3,
    RHSP_DEBUG_GROUP_NUMBER_ADC = 4,
    RHSP_DEBUG_GROUP_NUMBER_PWM_AND_SERVO = 5,
    RHSP_DEBUG_GROUP_NUMBER_MODULE_LED = 6,
    RHSP_DEBUG_GROUP_NUMBER_DIGITAL_IO = 7,
    RHSP_DEBUG_GROUP_NUMBER_I2C = 8,
    RHSP_DEBUG_GROUP_NUMBER_MOTOR_0 = 9,
    RHSP_DEBUG_GROUP_NUMBER_MOTOR_1 = 10,
    RHSP_DEBUG_GROUP_NUMBER_MOTOR_2 = 11,
    RHSP_DEBUG_GROUP_NUMBER_MOTOR_3 = 12
} RhspDebugGroupNumber;

typedef enum {
    RHSP_VERBOSITY_LEVEL_OFF = 0,
    RHSP_VERBOSITY_LEVEL_1 = 1,
    RHSP_VERBOSITY_LEVEL_2 = 2,
    RHSP_VERBOSITY_LEVEL_3 = 3
} RhspVerbosityLevel;

// Discovered addresses during discovery phase
typedef struct {
    uint8_t parentAddress;
    uint8_t childAddresses[RHSP_MAX_NUMBER_OF_CHILD_MODULES];
    size_t numberOfChildModules;
} RhspDiscoveredAddresses;

typedef struct {
    uint32_t rgbtPatternStep0;
    uint32_t rgbtPatternStep1;
    uint32_t rgbtPatternStep2;
    uint32_t rgbtPatternStep3;
    uint32_t rgbtPatternStep4;
    uint32_t rgbtPatternStep5;
    uint32_t rgbtPatternStep6;
    uint32_t rgbtPatternStep7;
    uint32_t rgbtPatternStep8;
    uint32_t rgbtPatternStep9;
    uint32_t rgbtPatternStep10;
    uint32_t rgbtPatternStep11;
    uint32_t rgbtPatternStep12;
    uint32_t rgbtPatternStep13;
    uint32_t rgbtPatternStep14;
    uint32_t rgbtPatternStep15;
} RhspLedPattern;

/**
 * @brief set response timeout in ms
 *
 * @param[in] hub 				module instance
 * @param[in] responseTimeoutMs response timeout in ms. Zero value is infinite timeout
 *
 * */
int rhsp_setResponseTimeoutMs(RhspRevHub* hub, uint32_t responseTimeoutMs);

/**
 * @brief get response timeout in ms
 *
 * @param[in] hub 				module instance
 *
 * @return response timeout in ms. If hub is NULL, zero is returned
 * */
uint32_t rhsp_responseTimeoutMs(const RhspRevHub* hub);

/**
 * @brief request module status
 *
 * @param[in]  hub                      module instance
 * @param[in]  clearStatusAfterResponse clear status after response (1 = reset, 0 = sustain)
 * @param[out] status                   module status
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getModuleStatus(RhspRevHub* hub,
                         uint8_t clearStatusAfterResponse,
                         RhspModuleStatus* status,
                         uint8_t* nackReasonCode);

/**
 * @brief send keep alive
 *
 * @param[in] hub module instance
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_sendKeepAlive(RhspRevHub* hub, uint8_t* nackReasonCode);

/**
 * @brief send fail safe
 *
 * @param[in]  hub                 module instance
 * @param[out] isAttentionRequired true - if the device needs getModuleStatus command
 * @param[out] nackReasonCode      contains nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED. Can be null.
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_sendFailSafe(RhspRevHub* hub, uint8_t* nackReasonCode);

/**
 * @brief set new module address
 *
 * @param[in] hub                 module interface
 * @param[in] newModuleAddress    new module address
 * @param[out] isAttentionReuired true - if the device needs getModuleStatus command
 * @param[out] nackReasonCode     nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setNewModuleAddress(RhspRevHub* hub,
                             uint8_t newModuleAddress,
                             uint8_t* nackReasonCode);

/**
 * @brief Set the Expansion Hub’s onboard LED color. Useful for indicating diagnostic or operational modes
 *
 * @param[in] hub            module instance
 * @param[in] red            red power level
 * @param[in] green          green power level
 * @param[in] blue           blue power level
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setModuleLedColor(RhspRevHub* hub, uint8_t red, uint8_t green, uint8_t blue, uint8_t* nackReasonCode);

/**
 * @brief Retrieve the module LED color
 *
 * @param[in] hub            module instance
 * @param[out] red           red power level
 * @param[out] green         green power level
 * @param[out] blue          blue power level
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getModuleLedColor(RhspRevHub* hub,
                           uint8_t* red,
                           uint8_t* green,
                           uint8_t* blue,
                           uint8_t* nackReasonCode);

/**
 * @brief Sets the Expansion Hub’s onboard LED color. Useful for indicating diagnostic or operational modes.
 *
 * @param[in] hub             module instance
 * @param[in] ledPattern      LED pattern
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setModuleLedPattern(RhspRevHub* hub, const RhspLedPattern* ledPattern, uint8_t* nackReasonCode);

/**
 * @brief Obtain the current LED pattern
 *
 * @param[in] hub             module instance
 * @param[out] ledPattern LED pattern
 * @param[out] nackReasonCode nack reason code. can be NULL.
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getModuleLedPattern(RhspRevHub* hub, RhspLedPattern* ledPattern, uint8_t* nackReasonCode);

/**
 * @brief set debug log level
 *
 * @param[in]  hub              module instance
 * @param[in]  debugGroupNumber debugGroupNumber
 * @param[in]  verbosityLevel   verbosityLevel
 * @param[out] nackReasonCode   nackReasonCode
 *
 * @return RHSP_RESULT_OK or RHSP_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int rhsp_setDebugLogLevel(RhspRevHub* hub,
                          RhspDebugGroupNumber debugGroupNumber,
                          RhspVerbosityLevel verbosityLevel,
                          uint8_t* nackReasonCode);

/**
 * @brief discovery
 *
 * @param[in]  serialPort          serial port. Shall be opened before using.
 * @param[out] discoveredAddresses discoveredAdrresses of parent and its children
 *
 * @return RHSP_RESULT_OK in case success
 *
 * @note This function may return RHSP_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED when there are several parents (should never happen)
 *       or RHSP_ERROR_NO_HUBS_DISCOVERED when we have no parent (we need only one parent always)
 *
 * */
int rhsp_discoverRevHubs(RhspSerial* serialPort, RhspDiscoveredAddresses* discoveredAddresses);

#ifdef __cplusplus
}
#endif

#if RHSP_QUERY_INTERFACE_NAME_SIZE > RHSP_MAX_PAYLOAD_SIZE
#error "query interface name length does not fit payload. Please increase RHSP_MAX_PAYLOAD_SIZE or decrease RHSP_QUERY_INTERFACE_NAME_SIZE"
#endif

#ifdef __cplusplus
}
#endif

#endif /* RHSP_H_ */
