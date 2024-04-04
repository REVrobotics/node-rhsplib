/*
 * serial.c
 *
 *  Created on: Dec 3, 2020
 *  Author: Andrey Mihadyuk
 */
#include <fcntl.h>
#include <sys/select.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>
#include <errno.h>

#include "rhsp/serial.h"

static int baudrateToBits(uint32_t baudrate);

void rhsp_serialInit(RhspSerial* serial)
{
    if (!serial)
    {
        return;
    }
    memset(serial, 0, sizeof(*serial));
    serial->fd = -1;
}

int rhsp_serialOpen(RhspSerial* serial,
                    const char* serialPortName,
                    uint32_t baudrate,
                    uint32_t databits,
                    RhspSerialParity parity,
                    uint32_t stopbits,
                    RhspSerialFlowControl flowControl)
{
    struct termios termiosSettings;

    if (!serial)
    {
        return RHSP_SERIAL_ERROR;
    }
    /* Check input arguments */
    if (databits != 5 && databits != 6 && databits != 7 && databits != 8)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }
    if (stopbits != 1 && stopbits != 2)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }

    memset(serial, 0, sizeof(*serial));

    /* Open serial port */
    if ((serial->fd = open(serialPortName, O_RDWR | O_NOCTTY)) < 0)
    {
        return RHSP_SERIAL_ERROR_OPENING;
    }

    memset(&termiosSettings, 0, sizeof(termiosSettings));

    /* c_iflag */

    /* Ignore break characters */
    termiosSettings.c_iflag = IGNBRK;
    if (parity != RHSP_SERIAL_PARITY_NONE)
    {
        termiosSettings.c_iflag |= INPCK;
    }
    /* Only use ISTRIP when less than 8 bits as it strips the 8th bit */
    if (parity != RHSP_SERIAL_PARITY_NONE && databits != 8)
    {
        termiosSettings.c_iflag |= ISTRIP;
    }
    if (flowControl == RHSP_SERIAL_FLOW_CONTROL_SOFTWARE)
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
    } else if (databits == 6)
    {
        termiosSettings.c_cflag |= CS6;
    } else if (databits == 7)
    {
        termiosSettings.c_cflag |= CS7;
    } else if (databits == 8)
    {
        termiosSettings.c_cflag |= CS8;
    }

    /* Parity */
    if (parity == RHSP_SERIAL_PARITY_EVEN)
    {
        termiosSettings.c_cflag |= PARENB;
    } else if (parity == RHSP_SERIAL_PARITY_ODD)
    {
        termiosSettings.c_cflag |= (PARENB | PARODD);
    }

    /* Stopbits */
    if (stopbits == 2)
    {
        termiosSettings.c_cflag |= CSTOPB;
    }

    /* RTS/CTS */
    if (flowControl == RHSP_SERIAL_FLOW_CONTROL_HARDWARE)
    {
        termiosSettings.c_cflag |= CRTSCTS;
    }

    /* Baudrate */
    cfsetispeed(&termiosSettings, baudrateToBits(baudrate));
    cfsetospeed(&termiosSettings, baudrateToBits(baudrate));

    /* Set termios attributes */
    if (tcsetattr(serial->fd, TCSANOW, &termiosSettings) < 0)
    {
        close(serial->fd);
        serial->fd = -1;
        return RHSP_SERIAL_ERROR_CONFIGURE;
    }

    serial->useTermiosTimeout = false;

    return 0;
}

int rhsp_serialRead(RhspSerial* serial, uint8_t* buffer, size_t bytesToRead)
{
    if (!serial || !buffer)
    {
        return RHSP_SERIAL_ERROR;
    }

    ssize_t retval;
    struct timeval tvTimeout;

    if (serial->rxTimeoutMs >= 0)
    {
        tvTimeout.tv_sec = serial->rxTimeoutMs / 1000;
        tvTimeout.tv_usec = (serial->rxTimeoutMs % 1000) * 1000;
    }

    size_t bytesRead = 0;

    while (bytesRead < bytesToRead)
    {
        fd_set rfds;
        FD_ZERO(&rfds);
        FD_SET(serial->fd, &rfds);
        retval = select(serial->fd + 1, &rfds, NULL, NULL, (serial->rxTimeoutMs < 0) ? NULL : &tvTimeout);
        if (retval < 0)
        {
            return RHSP_SERIAL_ERROR_IO;
        }

        /* Timeout */
        if (retval == 0)
        {
            break;
        }

        retval = read(serial->fd, buffer + bytesRead, bytesToRead - bytesRead);
        if (retval < 0)
        {
            return RHSP_SERIAL_ERROR_IO;
        }

        /* If we're using VMIN or VMIN+VTIME semantics for end of read, return now */
        if (serial->useTermiosTimeout)
        {
            return retval;
        }

        /* Empty read */
        if (retval == 0 && bytesToRead != 0)
        {
            return RHSP_SERIAL_ERROR_IO;
        }

        bytesRead += retval;
    }

    return bytesRead;

}

int rhsp_serialWrite(RhspSerial* serial, const uint8_t* buffer, size_t bytesToWrite)
{
    if (!serial || !buffer)
    {
        return RHSP_SERIAL_ERROR;
    }
    ssize_t retval = write(serial->fd, buffer, bytesToWrite);
    if (retval < 0)
    {
        return RHSP_SERIAL_ERROR_IO;
    }

    return retval;
}

void rhsp_serialClose(RhspSerial* serial)
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

static int baudrateToBits(uint32_t baudrate)
{
    switch (baudrate)
    {
#ifdef B50
        case 50:
            return B50;
#endif
#ifdef B75
        case 75:
            return B75;
#endif
#ifdef B110
        case 110:
            return B110;
#endif
#ifdef B134
        case 134:
            return B134;
#endif
#ifdef B150
        case 150:
            return B150;
#endif
#ifdef B200
        case 200:
            return B200;
#endif
#ifdef B300
        case 300:
            return B300;
#endif
#ifdef B600
        case 600:
            return B600;
#endif
#ifdef B1200
        case 1200:
            return B1200;
#endif
#ifdef B1800
        case 1800:
            return B1800;
#endif
#ifdef B2400
        case 2400:
            return B2400;
#endif
#ifdef B4800
        case 4800:
            return B4800;
#endif
#ifdef B9600
        case 9600:
            return B9600;
#endif
#ifdef B19200
        case 19200:
            return B19200;
#endif
#ifdef B38400
        case 38400:
            return B38400;
#endif
#ifdef B57600
        case 57600:
            return B57600;
#endif
#ifdef B115200
        case 115200:
            return B115200;
#endif
#ifdef B230400
        case 230400:
            return B230400;
#endif
#ifdef B460800
        case 460800:
            return B460800;
#endif
#ifdef B500000
        case 500000:
            return B500000;
#endif
#ifdef B576000
        case 576000:
            return B576000;
#endif
#ifdef B921600
        case 921600:
            return B921600;
#endif
#ifdef B1000000
        case 1000000:
            return B1000000;
#endif
#ifdef B1152000
        case 1152000:
            return B1152000;
#endif
#ifdef B1500000
        case 1500000:
            return B1500000;
#endif
#ifdef B2000000
        case 2000000:
            return B2000000;
#endif
#ifdef B2500000
        case 2500000:
            return B2500000;
#endif
#ifdef B3000000
        case 3000000:
            return B3000000;
#endif
#ifdef B3500000
        case 3500000:
            return B3500000;
#endif
#ifdef B4000000
        case 4000000:
            return B4000000;
#endif
        default:
            return -1;
    }
}

int rhsp_getLastOsError() {
    return errno;
}
