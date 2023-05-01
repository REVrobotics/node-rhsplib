/*
 * RHSPlib_serial.h
 *
 *  Created on: Dec 3, 2020
 *  Author: Andrey Mihadyuk
 *
 */

#ifndef ARCH_INCLUDES_RHSPLIB_SERIAL_H_
#define ARCH_INCLUDES_RHSPLIB_SERIAL_H_

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#ifdef _WIN32
#include <windows.h>
#include <tchar.h>
#endif

#include "rev/RHSPlib_errors.h"

#define RHSPLIB_SERIAL_INFINITE_TIMEOUT    -1

typedef enum
{
    RHSPLIB_SERIAL_PARITY_NONE = 0,
    RHSPLIB_SERIAL_PARITY_ODD,
    RHSPLIB_SERIAL_PARITY_EVEN
} RHSPlib_Serial_Parity_T;

typedef enum
{
    RHSPLIB_SERIAL_FLOW_CONTROL_NONE = 0, /* no flow control */
    RHSPLIB_SERIAL_FLOW_CONTROL_HARDWARE, /* hardware flow control (RTS/CTS)  */
    RHSPLIB_SERIAL_FLOW_CONTROL_SOFTWARE, /* software flow control (XON/XOFF) */

} RHSPlib_Serial_FlowControl_T;


#ifdef __cplusplus
extern "C" {
#endif


typedef struct
{
#ifdef _WIN32
    HANDLE handle;
    DCB dcb;
#else
    int fd;
    bool useTermiosTimeout;
    int rxTimeoutMs;
#endif
} RHSPlib_Serial_T;

/**
 * @brief serial port init
 *
 * @param[in] serial serial
 *
 * @note this fucntion shall be called once before using serial port
 *
 * */
void RHSPlib_serial_init(RHSPlib_Serial_T *serial);

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
 * @return RHSPLIB_SERIAL_NOERROR in case success
 *
 * */
int RHSPlib_serial_open(RHSPlib_Serial_T *serial, const char *serialPort,
                            uint32_t baudrate, uint32_t databits,
                            RHSPlib_Serial_Parity_T parity, uint32_t stopbits,
                            RHSPlib_Serial_FlowControl_T flowControl);

/**
 * @brief read bytes from serial port
 *
 * @param[in]  serial serial port instance
 * @param[out] buffer        buffer
 * @param[in]  bytesToRead   bytes to read
 *
 * @return number of read bytes in case success, otherwise negative error code
 * */
int RHSPlib_serial_read(RHSPlib_Serial_T *serial, uint8_t *buffer, size_t bytesToRead);

/**
 * @brief write bytes to serial port
 *
 * @param[in] serial serial port instance
 * @param[in] buffer        buffer
 * @param[in] bytesToWrite  bytes to write
  *
 * @return number of written bytes in case success, otherwise negative error code
 * */
int RHSPlib_serial_write(RHSPlib_Serial_T *serial, const uint8_t *buffer, size_t bytesToWrite);

/**
 * @brief close serial port
 *
 * @param[in] serial serial port
 *
 * */
void RHSPlib_serial_close(RHSPlib_Serial_T *serial);

#ifdef __cplusplus
}
#endif


#endif /* ARCH_INCLUDES_RHSPLIB_SERIAL_H_ */
