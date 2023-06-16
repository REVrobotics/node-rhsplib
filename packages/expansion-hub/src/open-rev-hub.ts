import {
    ExpansionHub,
    GeneralSerialError,
    InvalidSerialArguments,
    NoExpansionHubWithAddressError,
    ParentExpansionHub,
    RevHub,
    SerialConfigurationError,
    SerialIoError,
    SerialParity,
    TimeoutError,
    UnableToOpenSerialError,
} from "@rev-robotics/rev-hub-core";
import {
    DiscoveredAddresses,
    NativeRevHub,
    NativeSerial,
    SerialError,
    SerialFlowControl,
} from "@rev-robotics/rhsplib";
import { SerialPort as SerialLister } from "serialport";
import { ExpansionHubInternal } from "./internal/ExpansionHub.js";
import { startKeepAlive } from "./start-keep-alive.js";
import { performance } from "perf_hooks";
import { getSerial } from "./serial.js";

/**
 *
 * @param parentSerialNumber the parent's serial number
 * @param parentAddress the parent to open
 * @param moduleAddress the exact hub to open
 */
export async function openHubWithAddress(
    parentSerialNumber: string,
    parentAddress: number,
    moduleAddress: number = parentAddress,
): Promise<RevHub> {
    let parentHub = await openParentExpansionHub(parentSerialNumber, parentAddress);

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

    let serialPort = await getSerial(serialPortPath);

    let parentHub = new ExpansionHubInternal(true, serialPort, serialNumber);

    if (moduleAddress === undefined) {
        let addresses: DiscoveredAddresses = await NativeRevHub.discoverRevHubs(
            serialPort,
        );
        moduleAddress = addresses.parentAddress;
    }

    try {
        await parentHub.open(moduleAddress);
        // If discovery has not occurred on the hub, then we will
        // need to send keep-alive signals until the hub responds.
        // If we don't do this, the hub will be stuck waiting to
        // find out if it's a parent or child and won't respond.
        let startTime = performance.now();
        while (true) {
            try {
                if (performance.now() - startTime >= 500) break;
                await parentHub.sendKeepAlive();
                break;
            } catch (e) {}
        }
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

    let serialPort = await getSerial(serialPortPath);

    let discoveredModules = await NativeRevHub.discoverRevHubs(serialPort);
    let parentAddress = discoveredModules.parentAddress;
    let parentHub = await openParentExpansionHub(serialNumber, parentAddress);

    for (let address of discoveredModules.childAddresses) {
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
