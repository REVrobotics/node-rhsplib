/*
 * serial.h
 *
 *  Created on: Dec 3, 2020
 *  Author: Andrey Mihadyuk
 *
 */

#ifndef ARCH_INCLUDES_RHSP_SERIAL_H_
#define ARCH_INCLUDES_RHSP_SERIAL_H_

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef _WIN32

#include <windows.h>
#include <tchar.h>

#endif

#include "errors.h"

#define RHSP_SERIAL_INFINITE_TIMEOUT    -1

typedef enum {
    RHSP_SERIAL_PARITY_NONE = 0,
    RHSP_SERIAL_PARITY_ODD,
    RHSP_SERIAL_PARITY_EVEN
} RhspSerialParity;

typedef enum {
    RHSP_SERIAL_FLOW_CONTROL_NONE = 0, /* no flow control */
    RHSP_SERIAL_FLOW_CONTROL_HARDWARE, /* hardware flow control (RTS/CTS)  */
    RHSP_SERIAL_FLOW_CONTROL_SOFTWARE, /* software flow control (XON/XOFF) */
} RhspSerialFlowControl;

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
#ifdef _WIN32
    HANDLE handle;
    DCB dcb;
#else
    int fd;
    bool useTermiosTimeout;
    int rxTimeoutMs;
#endif
} RhspSerial;

/**
 * @brief serial port init
 *
 * @param[in] serial serial
 *
 * @note this fucntion shall be called once before using serial port
 *
 * */
void rhsp_serialInit(RhspSerial* serial);

/**
 * @brief open serial port
 *
 * @param[in] serial         serial port instance
 * @param[in] serialPortName serial port name
 * @param[in] baudrate       baudrate, bits/sec
 * @param[in] databits       databits
 * @param[in] parity         parity
 * @param[in] stopbits       stopbits
 * @param[in] flowControl    flow control
 *
 * @return RHSP_SERIAL_NOERROR in case success
 *
 * */
int rhsp_serialOpen(RhspSerial* serial,
                    const char* serialPort,
                    uint32_t baudrate,
                    uint32_t databits,
                    RhspSerialParity parity,
                    uint32_t stopbits,
                    RhspSerialFlowControl flowControl);

/**
 * @brief read bytes from serial port
 *
 * @param[in]  serial serial port instance
 * @param[out] buffer        buffer
 * @param[in]  bytesToRead   bytes to read
 *
 * @return number of read bytes in case success, otherwise negative error code
 * */
int rhsp_serialRead(RhspSerial* serial, uint8_t* buffer, size_t bytesToRead);

/**
 * @brief write bytes to serial port
 *
 * @param[in] serial serial port instance
 * @param[in] buffer        buffer
 * @param[in] bytesToWrite  bytes to write
  *
 * @return number of written bytes in case success, otherwise negative error code
 * */
int rhsp_serialWrite(RhspSerial* serial, const uint8_t* buffer, size_t bytesToWrite);

/**
 * @brief close serial port
 *
 * @param[in] serial serial port
 *
 * */
void rhsp_serialClose(RhspSerial* serial);

/**
 * @brief Get the last error code from the OS.
 * This is errno on unix, and GetLastError on windows.
 * */
int rhsp_getLastOsError();

#ifdef __cplusplus
}
#endif

#endif /* ARCH_INCLUDES_RHSP_SERIAL_H_ */
