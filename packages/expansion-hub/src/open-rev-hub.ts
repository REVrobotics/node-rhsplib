import { ExpansionHub, ParentExpansionHub } from "./ExpansionHub.js";
import { NativeRevHub, NativeSerial } from "@rev-robotics/rhsplib";
import { SerialPort as SerialLister } from "serialport";
import { NoExpansionHubWithAddressError } from "./errors/NoExpansionHubWithAddressError.js";
import { ExpansionHubInternal } from "./internal/ExpansionHub.js";
import { startKeepAlive } from "./start-keep-alive.js";
import { TimeoutError } from "./errors/TimeoutError.js";
import {
    InvalidSerialArguments,
    SerialConfigurationError,
    SerialError,
    SerialIoError,
    UnableToOpenSerialError,
} from "./errors/serial-errors.js";
import { GeneralSerialError as GeneralSerialError } from "./errors/GeneralSerialError.js";
import { DiscoveredAddresses, SerialFlowControl } from "@rev-robotics/rev-hub-core";
import { SerialParity } from "@rev-robotics/rev-hub-core";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link SerialPort} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, typeof NativeSerial>();

/**
 * Opens a parent Expansion Hub. Does not open any child hubs.
 *
 * Call {@link ExpansionHub#addChildByAddress} to add known children.
 *
 * @param serialNumber The serial number of the Expansion Hub (should start with "DQ")
 * @param moduleAddress The module address of the parent (if this is not provided, it will take upwards of a second to
 * find the address of the parent hub).
 */
export async function openParentExpansionHub(
    serialNumber: string,
    moduleAddress?: number,
): Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if (openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerialPort(serialPortPath));
    }

    let serialPort = openSerialMap.get(serialPortPath)!;

    let parentHub = new ExpansionHubInternal(true, serialPort, serialNumber);

    if (moduleAddress === undefined) {
        let addresses: DiscoveredAddresses = await NativeRevHub.discoverRevHubs(
            serialPort,
        );
        moduleAddress = addresses.parentAddress;
    }

    try {
        await parentHub.open(moduleAddress);
        await parentHub.queryInterface("DEKA");
    } catch (e: any) {
        if (e instanceof TimeoutError)
            throw new NoExpansionHubWithAddressError(serialNumber, moduleAddress);
    }
    startKeepAlive(parentHub, 1000);

    if (parentHub.isParent()) {
        return parentHub;
    } else {
        throw new Error(
            `Hub at ${serialNumber} with moduleAddress ${moduleAddress} is not a parent`,
        );
    }
}

/**
 * Opens a parent REV hub, given that you know its {@link serialNumber}, as well as all children.
 * Determining the addresses of the parent and child hubs will take upwards of a second.
 *
 * @param serialNumber the serial number of the REV hub (should start with DQ)
 */
export async function openExpansionHubAndAllChildren(
    serialNumber: string,
): Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if (openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerialPort(serialPortPath));
    }

    let serialPort = openSerialMap.get(serialPortPath)!;

    let discoveredModules = await NativeRevHub.discoverRevHubs(serialPort);
    let parentAddress = discoveredModules.parentAddress;
    let parentHub = (await openParentExpansionHub(
        serialNumber,
        parentAddress,
    )) as ParentExpansionHub & ExpansionHubInternal;

    for (let address of discoveredModules.childAddresses) {
        let hub = await parentHub.addChildByAddress(address);
        if (hub.isExpansionHub()) {
            startKeepAlive(hub as ExpansionHubInternal, 1000);
        }
    }

    return parentHub;
}

/**
 * Detects the serial port that a hub with a given {@link serialNumber} is on.
 *
 * @throws Error if the {@link serialNumber} is not found
 * @param serialNumber the serial number of the REV hub
 */
async function getSerialPortPathForExHubSerial(serialNumber: string): Promise<string> {
    const serialPorts = await SerialLister.list();
    for (let i = 0; i < serialPorts.length; i++) {
        const portInfo = serialPorts[i];
        if (portInfo.serialNumber === serialNumber) {
            return portInfo.path;
        }
    }
    throw new Error(`Unable to find serial port for ${serialNumber}`);
}

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
