#ifndef RHSPLIB_ERRORS_H_
#define RHSPLIB_ERRORS_H_

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
#define RHSPLIB_ERROR_UNEXPECTED_RESPONSE      -8 // error when we've received unexpected packet

// out of range errors
#define RHSPLIB_ERROR_ARG_0_OUT_OF_RANGE       -50 // zero arg is out of range
#define RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE       -51 // first arg is out of range
#define RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE       -52
#define RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE       -53
#define RHSPLIB_ERROR_ARG_4_OUT_OF_RANGE       -54
#define RHSPLIB_ERROR_ARG_5_OUT_OF_RANGE       -55

// Serial Error codes
#define RHSPLIB_SERIAL_NOERROR              0
#define RHSPLIB_SERIAL_ERROR                -101
#define RHSPLIB_SERIAL_ERROR_OPENING        -102
#define RHSPLIB_SERIAL_ERROR_ARGS           -103
#define RHSPLIB_SERIAL_ERROR_CONFIGURE      -104
#define RHSPLIB_SERIAL_ERROR_IO             -105

#endif
