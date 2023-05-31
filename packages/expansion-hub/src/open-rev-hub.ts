import { ExpansionHub, ParentExpansionHub } from "./ExpansionHub.js";
import {
    SerialParity,
    SerialFlowControl,
    NativeRevHub,
    NativeSerial,
    DiscoveredAddresses,
} from "@rev-robotics/rhsplib";
import { SerialPort as SerialLister } from "serialport";
import { ExpansionHubInternal } from "./internal/ExpansionHub.js";
import { startKeepAlive } from "./start-keep-alive.js";
import { RevHub } from "./RevHub.js";
import { getPossibleExpansionHubSerialNumbers } from "./discovery.js";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link SerialPort} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, typeof NativeSerial>();

/**
 * Opens the hub with the given module address if there is only one parent hub.
 * @throws if there are multiple parent hubs.
 *
 * @param parentAddress the parent to open
 * @param moduleAddress the exact hub to open
 */
export async function openHubWithAddress(
    parentAddress: number,
    moduleAddress: number = parentAddress,
): Promise<RevHub> {
    let serialNumbers = await getPossibleExpansionHubSerialNumbers();

    if (serialNumbers.length > 1) {
        //there are multiple hubs connected. We can't distinguish without a serial number
        throw new Error(
            `There are ${serialNumbers.length} parent hubs. Please specify a serialNumber`,
        );
    }

    let parentHub = await openParentExpansionHub(serialNumbers[0], parentAddress);

    if (parentAddress == moduleAddress) {
        return parentHub;
    }

    return await parentHub.addChildByAddress(moduleAddress);
}

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

    await parentHub.open(moduleAddress);
    await parentHub.queryInterface("DEKA");
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
    await serial.open(
        serialPortPath,
        460800,
        8,
        SerialParity.None,
        1,
        SerialFlowControl.None,
    );
    return serial;
}
