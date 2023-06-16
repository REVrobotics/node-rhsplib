import { NativeSerial, SerialError, SerialFlowControl } from "@rev-robotics/rhsplib";
import {
    GeneralSerialError,
    InvalidSerialArguments,
    SerialConfigurationError,
    SerialIoError,
    SerialParity,
    UnableToOpenSerialError,
} from "@rev-robotics/rev-hub-core";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link NativeSerial} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, typeof NativeSerial>();

/**
 * Closes the given Serial port and removes it from the open serial ports
 * list. This should be the preferred way to close a Serial port.
 *
 * @param serialPort the Serial port to close
 */
export function closeSerialPort(serialPort: typeof NativeSerial) {
    for (let [path, port] of openSerialMap.entries()) {
        if (port === serialPort) {
            openSerialMap.delete(path);
        }
    }
    serialPort.close();
}

export async function getSerial(serialPortPath: string): Promise<typeof NativeSerial> {
    if (openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerialPort(serialPortPath));
    }

    return openSerialMap.get(serialPortPath);
}

async function openSerialPort(serialPortPath: string): Promise<typeof NativeSerial> {
    let serial = new NativeSerial();
    try {
        await serial.open(
            serialPortPath,
            460800,
            8,
            SerialParity.None,
            1,
            SerialFlowControl.None,
        );
    } catch (e: any) {
        let code = e.errorCode;
        if (code == SerialError.INVALID_ARGS) {
            throw new InvalidSerialArguments(serialPortPath);
        } else if (code == SerialError.UNABLE_TO_OPEN) {
            throw new UnableToOpenSerialError(serialPortPath);
        } else if (code == SerialError.CONFIGURATION_ERROR) {
            throw new SerialConfigurationError(serialPortPath);
        } else if (code == SerialError.IO_ERROR) {
            throw new SerialIoError(serialPortPath);
        } else if (code == SerialError.GENERAL_ERROR) {
            throw new GeneralSerialError(serialPortPath);
        }
    }
    return serial;
}
