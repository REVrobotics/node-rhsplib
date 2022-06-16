/***
 *  RHSPlib.h
 *
 *  Created on: Nov 25, 2020
 *  Author: Andrey Mihadyuk
 *
 */

#ifndef RHSPLIB_H_
#define RHSPLIB_H_

#include <stdbool.h>

#include "RHSPlib_compiler.h"
#include "RHSPlib_serial.h"


#define RHSPLIB_BROADCAST_ADDRESS              0xFF
#define RHSPLIB_HOST_ADDRESS                   0x00 // host address.
#define RHSPLIB_DEFAULT_DST_ADDRESS            1    // default destination address
#define RHSPLIB_RESPONSE_TIMEOUT_MS            1000 // response timeout, ms. Zero means infinite timeout. Since FW has interval timeout 500 ms, it is reasonable to set longer timeout
#define RHSPLIB_DISCOVERY_RESPONSE_TIMEOUT_MS  1000 // response timeout for discovery, ms. It may differ from commonly used RHSPLIB_RESPONSE_TIMEOUT_MS
                                                     // @TODO adjust timeout for discovery
#define RHSPLIB_PACKET_HEADER_SIZE             10   // packet header size in bytes. it is started from first byte till payload field.
#define RHSPLIB_PACKET_CRC_SIZE                1
#define RHSPLIB_MAX_PAYLOAD_SIZE               512  // TODO: Adjust payload size
#define RHSPLIB_QUERY_INTERFACE_NAME_SIZE      400  // Max length of interface name according to protocol description.
#define RHSPLIB_MAX_NUMBER_OF_INTERFACES       64   // @TODO adjust max number of interfaces
#define RHSPLIB_MAX_NUMBER_OF_CHILD_MODULES    253  // max number of child devices
#define RHSPLIB_INTERFACE_INVALID_PACKET_ID    0
#define RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH 100

#define RHSPLIB_MAX_NUMBER_OF_GPIO				8
#define RHSPLIB_MAX_NUMBER_OF_ADC_CHANNELS		15
#define RHSPLIB_MAX_NUMBER_OF_MOTOR_CHANNELS	4
#define RHSPLIB_MAX_NUMBER_OF_MOTOR_MODES		3
#define RHSPLIB_MAX_NUMBER_OF_PWM_CHANNELS		4 // currently pwm is not supported by expansion hub
#define RHSPLIB_MAX_NUMBER_OF_SERVO_CHANNELS	6
#define RHSPLIB_MAX_NUMBER_OF_I2C_CHANNELS		4

// total buffer size for whole packet in bytes.
#define RHSPLIB_BUFFER_SIZE ((RHSPLIB_PACKET_HEADER_SIZE) + (RHSPLIB_MAX_PAYLOAD_SIZE) + (RHSPLIB_PACKET_CRC_SIZE))

// Result codes are returned in case success
#define RHSPLIB_RESULT_OK                                      0
#define RHSPLIB_RESULT_ATTENTION_REQUIRED                      1 // returned if the device needs getStatus command
#define RHSPLIB_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED     2
#define RHSPLIB_RESULT_DISCOVERY_NO_PARENT_DETECTED            3

// Errors
#define RHSPLIB_ERROR                          -1 // unrecognized or unspecified error
#define RHSPLIB_ERROR_RESPONSE_TIMEOUT         -2
#define RHSPLIB_ERROR_MSG_NUMBER_MISMATCH      -3 // occurs when message number does not match in request and response.
#define RHSPLIB_ERROR_NACK_RECEIVED            -4
#define RHSPLIB_ERROR_SERIALPORT               -5 // common serial port error. @TODO add function that returns serial port specific. error
#define RHSPLIB_ERROR_NOT_OPENED               -6 // error when module is not opened
#define RHSPLIB_ERROR_COMMAND_NOT_SUPPORTED    -7 // command is not supported by module
#define RHSPLIB_ERROR_UNEXPECTED_RESPONSE		-8 // error when we've received unexpected packet

// out of range errors
#define RHSPLIB_ERROR_ARG_0_OUT_OF_RANGE		-50 // zero arg is out of range
#define RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE		-51 // first arg is out of range
#define RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE		-52
#define RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE		-53
#define RHSPLIB_ERROR_ARG_4_OUT_OF_RANGE		-54
#define RHSPLIB_ERROR_ARG_5_OUT_OF_RANGE		-55



// macro to manipulate packet entities such as payload, payload size, etc.
#define RHSPLIB_PACKET_DST_ADDRESS(buffer)     ((buffer)[4])
#define RHSPLIB_PACKET_SRC_ADDRESS(buffer)     ((buffer)[5])
#define RHSPLIB_PACKET_ID(buffer)              ((uint16_t)(buffer)[9] << 8 | (uint16_t)(buffer)[8])
#define RHSPLIB_PACKET_PAYLOAD_PTR(buffer)     (&(buffer)[RHSPLIB_PACKET_HEADER_SIZE])
#define RHSPLIB_PACKET_SIZE(buffer)            ((uint16_t)(buffer)[3] << 8 | (uint16_t)(buffer)[2])
#define RHSPLIB_PACKET_IS_ACK(buffer)          (RHSPLIB_PACKET_ID(buffer) == 0x7F01)
#define RHSPLIB_PACKET_IS_NACK(buffer)         (RHSPLIB_PACKET_ID(buffer) == 0x7F02)

// helper functions to set/get byte, word, dword values from payload
#define RHSPLIB_ARRAY_BYTE(type, buffer, index)       ((type)(buffer)[index])
#define RHSPLIB_ARRAY_BYTE_PTR(type, buffer, index)   (&((type)(buffer))[index])
#define RHSPLIB_ARRAY_WORD(type, buffer, startIndex)  ((type)(buffer)[startIndex] | ((type)(buffer)[(startIndex) + 1] << 8))
#define RHSPLIB_ARRAY_DWORD(type, buffer, startIndex) ((type)(buffer)[startIndex] | \
                                                       ((type)(buffer)[(startIndex) + 1] << 8)  | \
                                                       ((type)(buffer)[(startIndex) + 2] << 16) | \
                                                       ((type)(buffer)[(startIndex) + 3] << 24))

#define RHSPLIB_ARRAY_SET_BYTE(buffer, index, value)  do { (buffer)[index] = (uint8_t)(value); } while(0)
#define RHSPLIB_ARRAY_SET_WORD(buffer, index, value)  do { (buffer)[index]     = (uint8_t)(value); \
                                                            (buffer)[index + 1] = (uint16_t)(value) >> 8; \
                                                          } while(0)
#define RHSPLIB_ARRAY_SET_DWORD(buffer, index, value)  do { (buffer)[index]     = (uint8_t)(value); \
                                                             (buffer)[index + 1] = (uint32_t)(value) >> 8; \
                                                             (buffer)[index + 2] = (uint32_t)(value) >> 16; \
                                                             (buffer)[index + 3] = (uint32_t)(value) >> 24; \
                                                          } while(0)


#ifdef __cplusplus
extern "C" {
#endif

// Module status. Returned by GetModuleStatus command
typedef struct
{
    uint8_t statusWord;
    uint8_t motorAlerts;
} RHSPlib_ModuleStatus_T;

typedef enum
{
    RHSPLIB_DEBUG_GROUP_NUMBER_MAIN = 1,
    RHSPLIB_DEBUG_GROUP_NUMBER_TRANSMITTER_TO_HOST = 2,
    RHSPLIB_DEBUG_GROUP_NUMBER_RECEIVER_FROM_HOST  = 3,
    RHSPLIB_DEBUG_GROUP_NUMBER_ADC           = 4,
    RHSPLIB_DEBUG_GROUP_NUMBER_PWM_AND_SERVO = 5,
    RHSPLIB_DEBUG_GROUP_NUMBER_MODULE_LED    = 6,
    RHSPLIB_DEBUG_GROUP_NUMBER_DIGITAL_IO    = 7,
    RHSPLIB_DEBUG_GROUP_NUMBER_I2C     = 8,
    RHSPLIB_DEBUG_GROUP_NUMBER_MOTOR_0 = 9,
    RHSPLIB_DEBUG_GROUP_NUMBER_MOTOR_1 = 10,
    RHSPLIB_DEBUG_GROUP_NUMBER_MOTOR_2 = 11,
    RHSPLIB_DEBUG_GROUP_NUMBER_MOTOR_3 = 12
} RHSPlib_DebugGroupNumber_T;

typedef enum
{
    RHSPLIB_VERBOSITY_LEVEL_OFF = 0,
    RHSPLIB_VERBOSITY_LEVEL_1   = 1,
    RHSPLIB_VERBOSITY_LEVEL_2   = 2,
    RHSPLIB_VERBOSITY_LEVEL_3   = 3
} RHSPlib_VerbosityLevel_T;

// Packet receiving states
typedef enum
{
    RHSPLIB_RX_STATES_FIRST_BYTE = 0,
    RHSPLIB_RX_STATES_SECOND_BYTE,
    RHSPLIB_RX_STATES_HEADER,
    RHSPLIB_RX_STATES_PAYLOAD,
    RHSPLIB_RX_STATES_CRC,
} RHSPlib_RxStates_T;

// Packet payload data
typedef struct
{
  uint8_t data[RHSPLIB_MAX_PAYLOAD_SIZE];
  uint16_t size;
} RHSPlib_PayloadData_T;

// Query interface command data
typedef struct
{
  char name[RHSPLIB_QUERY_INTERFACE_NAME_SIZE]; // interface name string, zero-terminated, UTF-8 encoded
  uint16_t firstPacketID;                        // packet ID for first function in queried interface
  uint16_t numberIDValues;                       // number of ID values allocated to the interface
} RHSPlib_Module_Interface_T;

// Module interface list queried by command queryInterface
typedef struct
{
    RHSPlib_Module_Interface_T interfaces[RHSPLIB_MAX_NUMBER_OF_INTERFACES];
    size_t numberOfInterfaces;
} RHSPlib_Module_InterfaceList_T;

// Discovered addresses during discovery phase
typedef struct
{
    uint8_t parentAddress;
    uint8_t childAddresses[RHSPLIB_MAX_NUMBER_OF_CHILD_MODULES];
    size_t numberOfChildModules;
} RHSPlib_DiscoveredAddresses_T;

// instance of Module
typedef struct
{
    RHSPlib_Serial_T *serialPort;
    uint8_t srcAddress;
    uint8_t dstAddress;
    uint8_t messageNumber;
    uint8_t rxBuffer[RHSPLIB_BUFFER_SIZE];
    size_t receivedBytes;
    size_t bytesToReceive;
    uint8_t txBuffer[RHSPLIB_BUFFER_SIZE];
    RHSPlib_RxStates_T rxState;
    uint32_t responseTimeoutMs;
    RHSPlib_Module_InterfaceList_T interfaceList;
} RHSPlib_Module_T;


typedef struct
{
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
} RHSPlib_LEDPattern_T;

/**
 * @brief   init the module
 * @details Performs module init. Shall be called once before using.
 *
 * @param [in] obj module instance
 *
 * */
void RHSPlib_init(RHSPlib_Module_T *obj);


/**
 * @brief open the module
 * @details prepares the module for working
 *
 * @param[in] obj            module instance
 * @param[in] serialPort     serial port. Shall be opened before
 * @param[in] destAddress    destination module address
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_open(RHSPlib_Module_T *obj, RHSPlib_Serial_T *serialPort, uint8_t destAddress);

/**
 * @brief check whether the module is opened
 *
 * @param[in] obj module instance
 *
 * @return true if the module is opened, otherwise false
 *
 * */
bool RHSPlib_isOpened(const RHSPlib_Module_T *obj);

/**
 * @brief close the module
 *
 * @param[in] obj module instance
 *
 * */
void RHSPlib_close(RHSPlib_Module_T *obj);

/**
 * @brief   set destination address
 * @details Sets destination address. It will be inserted in packet as dest address.
 *
 * @param[in] obj           module instance
 * @param[in] dstAddress    destination address
 *
 * */
void RHSPlib_setDestAddress(RHSPlib_Module_T *obj, uint8_t dstAddress);

/**
 * @brief return destination address
 *
 * @param[in] obj module instance
 *
 * @return dest address
 * */
uint8_t RHSPlib_destAddress(const RHSPlib_Module_T *obj);

/**
 * @brief set response timeout in ms
 *
 * @param[in] obj 				module instance
 * @param[in] responseTimeoutMs response timeout in ms. Zero value is infinite timeout
 *
 * */
void RHSPlib_setResponseTimeoutMs(RHSPlib_Module_T *obj, uint32_t responseTimeoutMs);

/**
 * @brief get response timeout in ms
 *
 * @param[in] obj 				module instance
 *
 * @return response timeout in ms. If obj is NULL, zero is returned
 * */
uint32_t RHSPlib_responseTimeoutMs(const RHSPlib_Module_T *obj);

/**
 * @brief   send write command
 * @details sends a command that has an ack/nack response
 *
 * @param[in] obj               module instance
 * @param[in] packetTypeID      packet type id
 * @param[in] payload           command payload
 * @param[in] payloadSize       payload size in bytes
 * @param[out] nackReasonCode   it is set if the return value is RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * @note this function is for internal usage
 *
 * */
int RHSPlib_sendWriteCommandInternal(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                                      const uint8_t *payload, uint16_t payloadSize,
                                      uint8_t *nackReasonCode);

/**
 * @brief   send write command
 * @details sends a command that has an ack/nack response
 *
 * @param[in]  obj                 module instance
 * @param[in]  packetTypeID        packet type id
 * @param[in]  payload             command payload
 * @param[in]  payloadSize         payload size in bytes
 * @param[out] responsePayloadData payload data
 * @param[out] nackReasonCode   it is set if the return value is RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 *
 * */
int RHSPlib_sendWriteCommand(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                              const uint8_t *payload, uint16_t payloadSize,
                              RHSPlib_PayloadData_T *responsePayloadData, uint8_t *nackReasonCode);

/**
 * @brief send read command
 * @details sends a command that has an data/nack response
 *
 * @param[in] obj           module instance
 * @param[in] packetTypeID  packet type id
 * @param[in] payload       command payload
 * @param[in] payloadSize   payload size in bytes
 * @param[out] nackReasonCode it is set if the return value is RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * @note this function is for internal usage
 * */
int RHSPlib_sendReadCommandInternal(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                                     const uint8_t *payload, uint16_t payloadSize, uint8_t *nackReasonCode);

/**
 * @brief send read command
 * @details sends a command that has an data/nack response
 *
 * @param[in] obj           		module instance
 * @param[in] packetTypeID  		packet type id
 * @param[in] payload       		command payload
 * @param[in] payloadSize   		payload size in bytes
 * @param[out] responsePayloadData 	payload data
 * @param[out] nackReasonCode 		it is set if the return value is RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_sendReadCommand(RHSPlib_Module_T *obj, uint16_t packetTypeID,
                            const uint8_t *payload, uint16_t payloadSize,
                            RHSPlib_PayloadData_T *responsePayloadData, uint8_t *nackReasonCode);

/**
 * @brief request module status
 *
 * @param[in]  obj                      module instance
 * @param[in]  clearStatusAfterResponse clear status after response (1 = reset, 0 = sustain)
 * @param[out] status                   module status
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_getModuleStatus(RHSPlib_Module_T *obj, uint8_t clearStatusAfterResponse,
                             RHSPlib_ModuleStatus_T *status, uint8_t *nackReasonCode);

/**
 * @brief send keep alive
 *
 * @param[in] obj module instance
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_sendKeepAlive(RHSPlib_Module_T *obj, uint8_t *nackReasonCode);

/**
 * @brief send fail safe
 *
 * @param[in]  obj                 module instance
 * @param[out] isAttentionRequired true - if the device needs getModuleStatus command
 * @param[out] nackReasonCode      contains nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED. Can be null.
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_sendFailSafe(RHSPlib_Module_T *obj, uint8_t *nackReasonCode);

/**
 * @brief set new module address
 *
 * @param[in] obj                 module interface
 * @param[in] newModuleAddress    new module address
 * @param[out] isAttentionReuired true - if the device needs getModuleStatus command
 * @param[out] nackReasonCode     nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_setNewModuleAddress(RHSPlib_Module_T *obj, uint8_t newModuleAddress,
                                 uint8_t *nackReasonCode);

/**
 * @brief query interface
 *
 * @param[in] obj             module instance
 * @param[in] interfaceName   Interface name string, zero-terminated, UTF-8 encoded.
 * @param[out] interface      contains interface description if the function result is RHSPLIB_NOERROR.
 * @param[out] nackReasonCode nack reason code if the function returns RHSPLIB_ERROR_NACK_RECEIVED
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_queryInterface(RHSPlib_Module_T *obj, const char *interfaceName, RHSPlib_Module_Interface_T *interfaceList,
                            uint8_t *nackReasonCode);


/**
 * @brief Set the Expansion Hub’s onboard LED color. Useful for indicating diagnostic or operational modes
 *
 * @param[in] obj            module instance
 * @param[in] red            red power level
 * @param[in] green          green power level
 * @param[in] blue           blue power level
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_setModuleLEDColor(RHSPlib_Module_T *obj, uint8_t red, uint8_t green, uint8_t blue, uint8_t *nackReasonCode);

/**
 * @brief Retrieve the module LED color
 *
 * @param[in] obj            module instance
 * @param[out] red           red power level
 * @param[out] green         green power level
 * @param[out] blue          blue power level
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_getModuleLEDColor(RHSPlib_Module_T *obj, uint8_t *red, uint8_t *green, uint8_t *blue, uint8_t *nackReasonCode);

/**
 * @brief Sets the Expansion Hub’s onboard LED color. Useful for indicating diagnostic or operational modes.
 *
 * @param[in] obj             module instance
 * @param[in] ledPattern      LED pattern
 * @param[out] nackReasonCode nack reason code
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_setModuleLEDPattern(RHSPlib_Module_T *obj, const RHSPlib_LEDPattern_T *ledPattern, uint8_t *nackReasonCode);

/**
 * @brief Obtain the current LED pattern
 *
 * @param[in] obj             module instance
 * @param[out] ledPattern LED pattern
 * @param[out] nackReasonCode nack reason code. can be NULL.
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_getModuleLEDPattern(RHSPlib_Module_T *obj, RHSPlib_LEDPattern_T *ledPattern, uint8_t *nackReasonCode);

/**
 * @brief set debug log level
 *
 * @param[in]  obj              module instance
 * @param[in]  debugGroupNumber debugGroupNumber
 * @param[in]  verbosityLevel   verbosityLevel
 * @param[out] nackReasonCode   nackReasonCode
 *
 * @return RHSPLIB_RESULT_OK or RHSPLIB_RESULT_ATTENTION_REQUIRED in case success
 *
 * */
int RHSPlib_setDebugLogLevel(RHSPlib_Module_T *obj, RHSPlib_DebugGroupNumber_T debugGroupNumber,
                                               RHSPlib_VerbosityLevel_T verbosityLevel, uint8_t *nackReasonCode);

/**
 * @brief discovery
 *
 * @param[in]  serialPort          serial port. Shall be opened before using.
 * @param[out] discoveredAddresses discoveredAdrresses of parent and its children
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * @note This function may return RHSPLIB_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED when there are several parents that is not normal
 *       or RHSPLIB_RESULT_DISCOVERY_NO_PARENT_DETECTED when we have no parent (we need only one parent always)
 *
 * */
int RHSPlib_discovery(RHSPlib_Serial_T *serialPort, RHSPlib_DiscoveredAddresses_T *discoveredAddresses);



/**
 * @brief Get packetID for specified interface
 *
 * @param[in]  obj            module instance
 * @param[in]  interfaceName  interface name. Could be taken from protocol spec
 * @param[in]  functionNumber function number. Could be taken from protocol spec
 * @param[out] packetID       packetID if the function succeeded
 * @param[out] nackReasonCode nackReasonCode
 *
 * @return RHSPLIB_RESULT_OK in case success
 *
 * */
int RHSPlib_getInterfacePacketID(RHSPlib_Module_T *obj,
                                  const char* interfaceName,
                                  uint16_t functionNumber, uint16_t *packetID, uint8_t *nackReasonCode);


#ifdef __cplusplus
}
#endif


#if RHSPLIB_QUERY_INTERFACE_NAME_SIZE > RHSPLIB_MAX_PAYLOAD_SIZE
#error "query interface name length does not fit payload. Please increase RHSPLIB_MAX_PAYLOAD_SIZE or decrease RHSPLIB_QUERY_INTERFACE_NAME_SIZE"
#endif

// + 1 means that the hint text includes text length according to spec
#if (RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH + 1) > RHSPLIB_MAX_PAYLOAD_SIZE
#error "hint text doesn't fit payload size. Please increase RHSPLIB_MAX_PAYLOAD_SIZE or decrease RHSPLIB_INJECT_DATA_LOG_HINT_TEXT_LENGTH"
#endif


#endif /* RHSPLIB_H_ */
