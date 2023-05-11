import {ExpansionHub, ParentExpansionHub} from "./ExpansionHub";
import {Serial, SerialParity, SerialFlowControl, RevHub as NativeRevHub} from "@rev-robotics/rhsplib";
import {SerialPort} from "serialport";
import {ExpansionHubInternal} from "./internal/ExpansionHub";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link Serial} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, Serial>();

/**
 * Opens a parent Rev Hub with a known address. Does not discover or open any child hubs.
 * Call {@link ExpansionHub#addChildByAddress} to add known children. The serial number
 * should start with 'DQ'.
 *
 * @param serialNumber
 * @param moduleAddress
 */
export async function openParentExpansionHub(serialNumber: string, moduleAddress: number):
    Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let parentHub = new ExpansionHubInternal(true, serialNumber);

    await parentHub.open(serial, moduleAddress);
    await parentHub.queryInterface("DEKA");

    if(parentHub.isParent()) {
        return parentHub;
    } else {
        throw new Error(`Hub at ${serialNumber} with moduleAddress ${moduleAddress} is not a parent`);
    }
}

/**
 * Opens a parent REV hub, given that you know its {@link serialNumber} (should start with DQ).
 *
 * @param serialNumber the serial number of the REV hub
 */
export async function openExpansionHubAndAllChildren(serialNumber: string): Promise<ParentExpansionHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let discoveredModules = await NativeRevHub.discoverRevHubs(serial);
    let parentAddress = discoveredModules.parentAddress;
    let parentHub = await openParentExpansionHub(serialNumber, parentAddress);

    for(let address of discoveredModules.childAddresses) {
        await parentHub.addChildByAddress(address);
    }

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
