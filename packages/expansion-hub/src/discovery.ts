import { SerialPort } from "serialport";
import {ExpansionHub} from "./ExpansionHub";
import {openExpansionHubWithChildren} from "./open-rev-hub";

async function getPossibleExpansionHubSerialNumbers(): Promise<string[]> {
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

/**
 * Returns all connected RevHubs. The array contains parent RevHubs,
 * and child hubs are available via {@link ExpansionHub#children}.
 */
export async function getConnectedExpansionHubs(): Promise<ExpansionHub[]> {
    let addresses = await getPossibleExpansionHubSerialNumbers();

    let hubs: ExpansionHub[] = [];

    for(let address of addresses) {
        let hub = await openExpansionHubWithChildren(address);
        hubs.push(hub);
    }

    return hubs;
}
