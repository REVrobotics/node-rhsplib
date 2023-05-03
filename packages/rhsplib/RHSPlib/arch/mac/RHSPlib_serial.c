/*
 * RHSPlib_serial.c
 *
 *  Created on: Dec 3, 2020
 *  Author: Andrey Mihadyuk
 */
#include <fcntl.h>
#include <sys/select.h>
#include <string.h>
#include <termios.h>
#include <time.h>
#include <unistd.h>

//#include "RHSPlib_compiler.h"
#include "RHSPlib_serial.h"


void RHSPlib_serial_init(RHSPlib_Serial_T *serial)
{
    if (!serial)
    {
        return;
    }
    memset(serial, 0, sizeof(*serial));
    serial->fd = -1;
}

int RHSPlib_serial_open(RHSPlib_Serial_T *serial, const char *serialPortName,
                            uint32_t baudrate, uint32_t databits,
                            RHSPlib_Serial_Parity_T parity, uint32_t stopbits,
                            RHSPlib_Serial_FlowControl_T flowControl)
{
    struct termios termiosSettings;

    if (!serial)
    {
        return RHSPLIB_SERIAL_ERROR;
    }
    /* Check input arguments */
    if (databits != 5 && databits != 6 && databits != 7 && databits != 8)
    {
        return RHSPLIB_SERIAL_ERROR_ARGS;
    }
    if (stopbits != 1 && stopbits != 2)
    {
        return RHSPLIB_SERIAL_ERROR_ARGS;
    }

    memset(serial, 0, sizeof(*serial));

    /* Open serial port */
    if ((serial->fd = open(serialPortName, O_RDWR | O_NOCTTY)) < 0)
    {
        return RHSPLIB_SERIAL_ERROR_OPENING;
    }

    memset(&termiosSettings, 0, sizeof(termiosSettings));

    /* c_iflag */

    /* Ignore break characters */
    termiosSettings.c_iflag = IGNBRK;
    if (parity != RHSPLIB_SERIAL_PARITY_NONE)
    {
        termiosSettings.c_iflag |= INPCK;
    }
    /* Only use ISTRIP when less than 8 bits as it strips the 8th bit */
    if (parity != RHSPLIB_SERIAL_PARITY_NONE && databits != 8)
    {
        termiosSettings.c_iflag |= ISTRIP;
    }
    if (flowControl == RHSPLIB_SERIAL_FLOW_CONTROL_SOFTWARE)
    {
        termiosSettings.c_iflag |= (IXON | IXOFF);
    }

    /* c_oflag */
    termiosSettings.c_oflag = 0;

    /* c_lflag */
    termiosSettings.c_lflag = 0;

    /* c_cflag */
    /* Enable receiver, ignore modem control lines */
    termiosSettings.c_cflag = CREAD | CLOCAL;

    /* Databits */
    if (databits == 5)
    {
        termiosSettings.c_cflag |= CS5;
    }
    else if (databits == 6)
    {
        termiosSettings.c_cflag |= CS6;
    }
    else if (databits == 7)
    {
        termiosSettings.c_cflag |= CS7;
    }
    else if (databits == 8)
    {
        termiosSettings.c_cflag |= CS8;
    }

    /* Parity */
    if (parity == RHSPLIB_SERIAL_PARITY_EVEN)
    {
        termiosSettings.c_cflag |= PARENB;
    }
    else if (parity == RHSPLIB_SERIAL_PARITY_ODD)
    {
        termiosSettings.c_cflag |= (PARENB | PARODD);
    }

    /* Stopbits */
    if (stopbits == 2)
    {
        termiosSettings.c_cflag |= CSTOPB;
    }

    /* RTS/CTS */
    if (flowControl == RHSPLIB_SERIAL_FLOW_CONTROL_HARDWARE)
    {
        termiosSettings.c_cflag |= CRTSCTS;
    }

    /* Baudrate */
    cfsetispeed(&termiosSettings, baudrate);
    cfsetospeed(&termiosSettings, baudrate);

    /* Set termios attributes */
    if (tcsetattr(serial->fd, TCSANOW, &termiosSettings) < 0)
    {
        close(serial->fd);
        serial->fd = -1;
        return RHSPLIB_SERIAL_ERROR_CONFIGURE;
    }

    serial->useTermiosTimeout = false;

    return 0;
}

int RHSPlib_serial_read(RHSPlib_Serial_T *serial, uint8_t *buffer, size_t bytesToRead)
{
    if (!serial || !buffer)
    {
        return RHSPLIB_SERIAL_ERROR;
    }

    ssize_t retval;
    struct timeval tvTimeout;

    if (serial->rxTimeoutMs >= 0)
    {
        tvTimeout.tv_sec  = serial->rxTimeoutMs / 1000;
        tvTimeout.tv_usec = (serial->rxTimeoutMs % 1000) * 1000;
    }

    size_t bytesRead = 0;

    while (bytesRead < bytesToRead)
    {
        fd_set rfds;
        FD_ZERO(&rfds);
        FD_SET(serial->fd, &rfds);
        retval = select(serial->fd+1, &rfds, NULL, NULL, (serial->rxTimeoutMs < 0) ? NULL : &tvTimeout);
        if (retval < 0)
        {
            return RHSPLIB_SERIAL_ERROR_IO;
        }

        /* Timeout */
        if (retval == 0)
        {
            break;
        }

        retval = read(serial->fd, buffer + bytesRead, bytesToRead - bytesRead);
        if (retval < 0)
        {
            return RHSPLIB_SERIAL_ERROR_IO;
        }

        /* If we're using VMIN or VMIN+VTIME semantics for end of read, return now */
        if (serial->useTermiosTimeout)
        {
            return retval;
        }

        /* Empty read */
        if (retval == 0 && bytesToRead != 0)
        {
            return RHSPLIB_SERIAL_ERROR_IO;
        }

        bytesRead += retval;
    }

    return bytesRead;

}

int RHSPlib_serial_write(RHSPlib_Serial_T *serial, const uint8_t *buffer, size_t bytesToWrite)
{
    if (!serial || !buffer)
    {
        return RHSPLIB_SERIAL_ERROR;
    }
    ssize_t retval = write(serial->fd, buffer, bytesToWrite);
    if (retval < 0)
    {
        return RHSPLIB_SERIAL_ERROR_IO;
    }

    return retval;
}

void RHSPlib_serial_close(RHSPlib_Serial_T *serial)
{

    if (!serial || serial->fd < 0)
    {
        return;
    }

    // @TODO add assert whether close returns no error. Normally we shall never get an error here.
    if (close(serial->fd) < 0)
    {
        return;
    }
    serial->fd = -1;
}

