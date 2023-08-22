#ifndef RHSP_RHSPRXSTATES_H
#define RHSP_RHSPRXSTATES_H

#ifdef __cplusplus
extern "C" {
#endif

// Packet receiving states
typedef enum {
    RHSP_RX_STATES_FIRST_BYTE = 0,
    RHSP_RX_STATES_SECOND_BYTE,
    RHSP_RX_STATES_HEADER,
    RHSP_RX_STATES_PAYLOAD,
    RHSP_RX_STATES_CRC,
} RhspRxStates;

#ifdef __cplusplus
}
#endif

#endif //RHSP_RHSPRXSTATES_H
