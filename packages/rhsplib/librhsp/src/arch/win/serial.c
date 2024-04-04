#include <stdio.h>

#include "rhsp/serial.h"


static BOOL setReadTimeout(HANDLE hPort, int valueMs)
{
    COMMTIMEOUTS timeouts;

    if (GetCommTimeouts(hPort, &timeouts))
    {
        timeouts.ReadTotalTimeoutMultiplier = 0;
        timeouts.ReadTotalTimeoutConstant = 0;

        if (valueMs < 0)
        {
        // infinite timeout
            timeouts.ReadIntervalTimeout = 0;
        }
        else if (valueMs == 0)
        {
        // non-blocking mode
            timeouts.ReadIntervalTimeout = MAXDWORD;
        }
        else
        {
        // read with timeout
            timeouts.ReadIntervalTimeout = valueMs;
        }

        if (SetCommTimeouts(hPort, &timeouts))
        {
            return TRUE;
        }
    }

    return FALSE;
}

static BOOL setWriteTimeout(HANDLE hPort, int valueMs)
{
    COMMTIMEOUTS timeouts;

    if (GetCommTimeouts(hPort, &timeouts))
    {
        timeouts.WriteTotalTimeoutMultiplier = 0;

        if (valueMs < 0)
        {
            // infinite timeout
            timeouts.WriteTotalTimeoutConstant = 0;
        }
        else
        {
            // write with timeout
            timeouts.WriteTotalTimeoutConstant = valueMs;
        }

        if (SetCommTimeouts(hPort, &timeouts))
        {
            return TRUE;
        }
    }

    return FALSE;
}

void rhsp_serialInit(RhspSerial* serial)
{
    if (!serial)
    {
        return;
    }

    memset(serial, 0, sizeof(*serial));

    serial->handle = INVALID_HANDLE_VALUE;
    serial->dcb.DCBlength = sizeof(DCB);
}

int rhsp_serialOpen(RhspSerial* serial,
                    const char* serialPort,
                    uint32_t baudrate,
                    uint32_t databits,
                    RhspSerialParity parity,
                    uint32_t stopbits,
                    RhspSerialFlowControl flowControl)
{
    /* Check input arguments */
    if (!serial)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }
    if (databits != 5 && databits != 6 && databits != 7 && databits != 8)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }
    if (stopbits != 1 && stopbits != 2)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }
    /* currently we support "no flow control" for win platform */
    if (flowControl != RHSP_SERIAL_FLOW_CONTROL_NONE)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }

    if (serial->handle != INVALID_HANDLE_VALUE)
    {
        return RHSP_SERIAL_ERROR;
    }

    char modifiedSerialPortName[20];

    // if the user has already prefixed the workaround, don't add it again
    if(serialPort[0] == '\\') {
        strncpy(modifiedSerialPortName, serialPort, 20);
    } else {
        snprintf(modifiedSerialPortName, 20, "\\\\.\\%s", serialPort);
    }
    
    /* Try to open specified COM-port */
    serial->handle = CreateFile(modifiedSerialPortName,
                                GENERIC_READ | GENERIC_WRITE,
                                0,      //  must be opened with exclusive-access
                                NULL,   //  default security attributes
                                OPEN_EXISTING, //  must use OPEN_EXISTING
                                0,      //  not overlapped I/O
                                NULL); //  hTemplate must be NULL for comm devices

    if (serial->handle == INVALID_HANDLE_VALUE)
    {
        return RHSP_SERIAL_ERROR_OPENING;
    }

    /* Read current configuration for the serial port */
    if (!GetCommState(serial->handle, &serial->dcb))
    {
        rhsp_serialClose(serial);
        serial->handle = INVALID_HANDLE_VALUE;
        return RHSP_SERIAL_ERROR_CONFIGURE;
    }

    /* Setup the serial port */
    serial->dcb.BaudRate = baudrate;
    serial->dcb.ByteSize = databits;

    switch (parity)
    {
    case RHSP_SERIAL_PARITY_NONE:
        serial->dcb.Parity = NOPARITY;
        break;
    case RHSP_SERIAL_PARITY_ODD:
        serial->dcb.Parity = ODDPARITY;
        serial->dcb.fParity = TRUE;
        break;
    case RHSP_SERIAL_PARITY_EVEN:
        serial->dcb.Parity = EVENPARITY;
        serial->dcb.fParity = TRUE;
        break;
    }

    switch (stopbits)
    {
    case 1:
        serial->dcb.StopBits = ONESTOPBIT;
        break;
    case 2:
        serial->dcb.StopBits = TWOSTOPBITS;
        break;
    }

    /* Disable any flow control first */
    serial->dcb.fRtsControl = RTS_CONTROL_DISABLE;
    serial->dcb.fDtrControl = DTR_CONTROL_DISABLE;
    serial->dcb.fOutxCtsFlow = FALSE;
    serial->dcb.fOutxDsrFlow = FALSE;
    serial->dcb.fInX = FALSE;
    serial->dcb.fOutX = FALSE;

    if (flowControl == RHSP_SERIAL_FLOW_CONTROL_HARDWARE)
    {
        serial->dcb.fRtsControl = RTS_CONTROL_HANDSHAKE;
        serial->dcb.fOutxCtsFlow = TRUE;
    }
    if (flowControl == RHSP_SERIAL_FLOW_CONTROL_SOFTWARE)
    {
        serial->dcb.fInX = TRUE;
        serial->dcb.fOutX = TRUE;
    }

    /* Apply new configuration. we use zero timeout for read opertaion and infinite for write.
     * The same approach is in linux implementation
     * */
    if (setReadTimeout(serial->handle, 0) &&
        setWriteTimeout(serial->handle, RHSP_SERIAL_INFINITE_TIMEOUT) &&
        SetCommState(serial->handle, &serial->dcb) &&
        PurgeComm(serial->handle, PURGE_TXCLEAR | PURGE_RXCLEAR))
    {
        return RHSP_SERIAL_NOERROR;
    }
    else
    {
        rhsp_serialClose(serial);
        serial->handle = INVALID_HANDLE_VALUE;
        return RHSP_SERIAL_ERROR_CONFIGURE;
    }
}

int rhsp_serialRead(RhspSerial* serial, uint8_t* buffer, size_t bytesToRead)
{
    if (!serial || !buffer)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }

    DWORD bytesRead;

    if (ReadFile(serial->handle, buffer, bytesToRead, &bytesRead, NULL))
    {
        return bytesRead;
    }

    return RHSP_SERIAL_ERROR_IO;
}

int rhsp_serialWrite(RhspSerial* serial, const uint8_t* buffer, size_t bytesToWrite)
{
    if (!serial || !buffer)
    {
        return RHSP_SERIAL_ERROR_ARGS;
    }

    DWORD bytesWritten;

    if (WriteFile(serial->handle, buffer, bytesToWrite, &bytesWritten, NULL))
    {
        return bytesWritten;
    }

    return RHSP_SERIAL_ERROR_IO;
}

void rhsp_serialClose(RhspSerial* serial)
{
    if (serial && (serial->handle != INVALID_HANDLE_VALUE))
    {
        if (CloseHandle(serial->handle))
        {
            serial->handle = INVALID_HANDLE_VALUE;
        }
    }
}

int rhsp_getLastOsError(void) {
    return (int) GetLastError();
}
