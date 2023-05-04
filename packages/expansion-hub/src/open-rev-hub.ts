import {RevHub} from "./RevHub";
import {Serial, SerialParity, SerialFlowControl, RevHub as NativeRevHub} from "@rev-robotics/rhsplib";
import {SerialPort} from "serialport";
import {RevHubInternal} from "./internal/RevHub";
import {startKeepAlive} from "./start-keep-alive";

/**
 * Maps the serial port path (/dev/tty1 or COM3 for example) to an open
 * Serial object at that path. The {@link Serial} object should be removed from
 * the map upon closing.
 */
const openSerialMap = new Map<string, Serial>();

/**
 * Opens a parent REV hub, given that you know its {@link serialNumber} (should start with DQ).
 * Any children of this hub will be automatically discovered and initialized.
 *
 * @param serialNumber the serial number of the REV hub
 */
export async function openParentRevHub(serialNumber: string): Promise<RevHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let parentHub = new RevHubInternal();

    let discoveredModules = await NativeRevHub.discoverRevHubs(serial);
    let parentAddress = discoveredModules.parentAddress;

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
