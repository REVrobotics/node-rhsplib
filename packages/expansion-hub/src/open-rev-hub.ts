import {ExpansionHub, ParentExpansionHub} from "./ExpansionHub";
import {Serial, SerialParity, SerialFlowControl, RevHub as NativeRevHub, RevHub} from "@rev-robotics/rhsplib";
import {SerialPort} from "serialport";
import {ExpansionHubInternal} from "./internal/ExpansionHub";
import {startKeepAlive} from "./start-keep-alive";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link Serial} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, Serial>();

/**
 * Opens a parent Expansion Hub. Does not open any child hubs.
 *
 * Call {@link ExpansionHub#addChildByAddress} to add known children.
 *
 * @param serialNumber The serial number of the Expansion Hub (should start with "DQ")
 * @param moduleAddress The module address of the parent (if this is not provided, it will take upwards of a second to
 * find the address of the parent hub).
 */
export async function openParentExpansionHub(serialNumber: string, moduleAddress?: number):
    Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let parentHub = new ExpansionHubInternal(true, serial, serialNumber);

    if(moduleAddress === undefined) {
        let addresses = await RevHub.discoverRevHubs(serial);
        moduleAddress = addresses.parentAddress;
    }

    await parentHub.open(serial, moduleAddress);
    await parentHub.queryInterface("DEKA");

    if(parentHub.isParent()) {
        return parentHub;
    } else {
        throw new Error(`Hub at ${serialNumber} with moduleAddress ${moduleAddress} is not a parent`);
    }
}

/**
 * Opens a parent REV hub, given that you know its {@link serialNumber}, as well as all children.
 * Determining the addresses of the parent and child hubs will take upwards of a second.
 *
 * @param serialNumber the serial number of the REV hub (should start with DQ)
 */
export async function openExpansionHubAndAllChildren(serialNumber: string): Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let discoveredModules = await NativeRevHub.discoverRevHubs(serial);
    let parentAddress = discoveredModules.parentAddress;
    let parentHub =
        await openParentExpansionHub(serialNumber, parentAddress) as ParentExpansionHub & ExpansionHubInternal;

    for(let address of discoveredModules.childAddresses) {
        let hub = await parentHub.addChildByAddress(address);
        if(hub.isExpansionHub()) {
            startKeepAlive(hub as ExpansionHubInternal, 1000)
        }
    }

    await parentHub.open(serial, parentAddress);
    await parentHub.queryInterface("DEKA");
    startKeepAlive(parentHub, 1000);

    return parentHub;
}

/**
 * Detects the serial port that a hub with a given {@link serialNumber} is on.
 *
 * @throws Error if the {@link serialNumber} is not found
 * @param serialNumber the serial number of the REV hub
 */
async function getSerialPortPathForExHubSerial(
    serialNumber: string,
): Promise<string> {
    const serialPorts = await SerialPort.list();
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
 * @param serial the Serial port to close
 */
export function closeSerial(serial: Serial) {
    for(let [path, port] of openSerialMap.entries()) {
        if(port === serial) {
            openSerialMap.delete(path);
        }
    }
    serial.close();
}

async function openSerial(serialPortPath: string): Promise<Serial> {
    let serial = new Serial();
    await serial.open(serialPortPath,
        460800,
        8,
        SerialParity.None,
        1,
        SerialFlowControl.None);
    return serial;
}
