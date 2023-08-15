#ifndef RHSP_MODULE_H
#define RHSP_MODULE_H

#include <stdint.h>
#include <stddef.h>
#include "revhub.h"

#define RHSP_MAX_NUMBER_OF_INTERFACES       20   // @TODO auto-grow interface list and lower this number
#define RHSP_MAX_NUMBER_OF_CHILD_MODULES    253  // max number of child devices
#define RHSP_INTERFACE_INVALID_PACKET_ID    0

// Module status. Returned by GetModuleStatus command
typedef struct {
    uint8_t statusWord;
    uint8_t motorAlerts;
} RhspModuleStatus;

// Query interface command data
typedef struct {
    uint16_t firstPacketID;                        // packet ID for first function in queried interface
    uint16_t numberIDValues;                       // number of ID values allocated to the interface
    char* name; // interface name string, zero-terminated, UTF-8 encoded
} RhspModuleInterface;

/**
 * @brief Get packetID for specified interface
 *
 * @param[in]  hub            module instance
 * @param[in]  interfaceName  interface name. Could be taken from protocol spec
 * @param[in]  functionNumber function number. Could be taken from protocol spec
 * @param[out] packetID       packetID if the function succeeded
 * @param[out] nackReasonCode nackReasonCode
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_getInterfacePacketID(RhspRevHub* hub,
                              const char* interfaceName,
                              uint16_t functionNumber,
                              uint16_t* packetID,
                              uint8_t* nackReasonCode);

/**
 * @brief query interface
 *
 * @param[in] hub             module instance
 * @param[in] interfaceName   Interface name string, zero-terminated, UTF-8 encoded.
 * @param[out] interface      contains interface description if the function result is RHSP_NOERROR.
 * @param[out] nackReasonCode nack reason code if the function returns RHSP_ERROR_NACK_RECEIVED
 *
 * @return RHSP_RESULT_OK in case success
 *
 * */
int rhsp_queryInterface(RhspRevHub* hub,
                        const char* interfaceName,
                        RhspModuleInterface* intf,
                        uint8_t* nackReasonCode);

#endif //RHSP_MODULE_H
