#ifndef RHSP_ERRORS_H_
#define RHSP_ERRORS_H_

// Result codes are returned in case success
#define RHSP_RESULT_OK                                      0
#define RHSP_RESULT_ATTENTION_REQUIRED                      1 // returned if the device needs getStatus command
#define RHSP_RESULT_DISCOVERY_MULTIPLE_PARENTS_DETECTED     2

// Errors
#define RHSP_ERROR                          -1 // unrecognized or unspecified error
#define RHSP_ERROR_RESPONSE_TIMEOUT         -2
#define RHSP_ERROR_MSG_NUMBER_MISMATCH      -3 // occurs when message number does not match in request and response.
#define RHSP_ERROR_NACK_RECEIVED            -4
#define RHSP_ERROR_SERIALPORT               -5 // common serial port error. @TODO add function that returns serial port specific. error
#define RHSP_ERROR_NOT_OPENED               -6 // error when module is not opened
#define RHSP_ERROR_COMMAND_NOT_SUPPORTED    -7 // command is not supported by module
#define RHSP_ERROR_UNEXPECTED_RESPONSE      -8 // error when we've received unexpected packet
#define RHSP_ERROR_NO_HUBS_DISCOVERED       -9 // discovery failed to find any modules

// out of range errors
#define RHSP_ERROR_ARG_0_OUT_OF_RANGE       -50 // zero arg is out of range
#define RHSP_ERROR_ARG_1_OUT_OF_RANGE       -51 // first arg is out of range
#define RHSP_ERROR_ARG_2_OUT_OF_RANGE       -52
#define RHSP_ERROR_ARG_3_OUT_OF_RANGE       -53
#define RHSP_ERROR_ARG_4_OUT_OF_RANGE       -54
#define RHSP_ERROR_ARG_5_OUT_OF_RANGE       -55

// Serial Error codes
#define RHSP_SERIAL_NOERROR              0
#define RHSP_SERIAL_ERROR                -101
#define RHSP_SERIAL_ERROR_OPENING        -102
#define RHSP_SERIAL_ERROR_ARGS           -103
#define RHSP_SERIAL_ERROR_CONFIGURE      -104
#define RHSP_SERIAL_ERROR_IO             -105

#endif
