
import { SerialPort } from "serialport";
import {RevHub} from "./RevHub.js";
import {openRevHub} from "./internal/RevHub.js";

export async function getSerialPortPathForExHubSerial(
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

export async function getPossibleExpansionHubSerialNumbers(): Promise<string[]> {
    const results: string[] = [];
    const serialPorts = await SerialPort.list();
    for (let i = 0; i < serialPorts.length; i++) {
        const portInfo = serialPorts[i];
        let isExpansionHub = portInfo.vendorId === "0403"
            && portInfo.productId === "6015" && portInfo.serialNumber?.startsWith("DQ");
        if (isExpansionHub) {
            results.push(portInfo.serialNumber!);
        }
    }
    return results;
}

export async function getConnectedExpansionHubs(): Promise<RevHub[]> {
    let addresses = await getPossibleExpansionHubSerialNumbers();

    let hubs: RevHub[] = [];

    for(let address of addresses) {
        let hub = await openRevHub(address);
        hubs.push(hub);
    }

    return hubs;
}
