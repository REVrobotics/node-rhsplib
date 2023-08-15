#ifndef RHSP_REVHUB_H
#define RHSP_REVHUB_H

#include "serial.h"
#include "stddef.h"

#ifdef __cplusplus
extern "C" {
#endif

#define RHSP_BUFFER_SIZE 1024
#define RHSP_RESPONSE_TIMEOUT_MS            1000 // response timeout, ms. Zero means infinite timeout. Since FW has interval timeout 500 ms, it is reasonable to set longer timeout
#define RHSP_DISCOVERY_RESPONSE_TIMEOUT_MS  1000 // response timeout for discovery, ms. It may differ from commonly used RHSP_RESPONSE_TIMEOUT_MS
// @TODO adjust timeout for discovery

typedef struct InterfaceList RhspModuleInterfaceList;

// instance of Module
typedef struct RhspRevHub RhspRevHub;

/**
 * Create and open a RevHub
 *
 * @param[in] serialPort     serial port. Shall be opened before
 * @param[in] destAddress    destination module address
 * @return
 */
RhspRevHub* rhsp_allocRevHub(RhspSerial* serialPort, uint8_t destAddress);

/**
 * Free a RevHub. The hub should be explicitly closed first
 * @param hub
 */
void freeRevHub(RhspRevHub* hub);

/**
 * @brief check whether the module is opened
 *
 * @param[in] hub module instance
 *
 * @return true if the module is opened, otherwise false
 *
 * */
bool rhsp_isOpened(const RhspRevHub* hub);

/**
 * @brief close the module
 *
 * @param[in] hub module instance
 *
 * */
void rhsp_close(RhspRevHub* hub);

/**
 * @brief   set destination address
 * @details Sets destination address. It will be inserted in packet as dest address.
 *
 * @param[in] hub           module instance
 * @param[in] dstAddress    destination address
 *
 * */
void rhsp_setDestinationAddress(RhspRevHub* hub, uint8_t dstAddress);

/**
 * @brief return destination address
 *
 * @param[in] hub module instance
 *
 * @return dest address
 * */
uint8_t rhsp_getDestinationAddress(const RhspRevHub* hub);

#ifdef __cplusplus
}
#endif

#endif //RHSP_REVHUB_H
