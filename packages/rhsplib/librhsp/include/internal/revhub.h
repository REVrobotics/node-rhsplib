#ifndef RHSP_INTERNAL_REVHUB_H
#define RHSP_INTERNAL_REVHUB_H

#ifdef __cplusplus
extern "C" {
#endif

#include "RhspRxStates.h"

typedef struct {
    RhspSerial* serialPort;
    uint8_t address;
    uint8_t messageNumber;
    uint8_t rxBuffer[RHSP_BUFFER_SIZE];
    size_t receivedBytes;
    size_t bytesToReceive;
    uint8_t txBuffer[RHSP_BUFFER_SIZE];
    RhspRxStates rxState;
    uint32_t responseTimeoutMs;
    RhspModuleInterfaceList* interfaceList;
} RhspRevHubInternal;

#ifdef __cplusplus
}
#endif

#endif //RHSP_INTERNAL_REVHUB_H
