import { SerialPort } from "serialport";
import { openExpansionHubAndAllChildren } from "./open-rev-hub.js";
import { ExpansionHub, ParentExpansionHub } from "@rev-robotics/rev-hub-core";

export async function getPossibleExpansionHubSerialNumbers(): Promise<string[]> {
    const results: string[] = [];
    const serialPorts = await SerialPort.list();
    for (let i = 0; i < serialPorts.length; i++) {
        const portInfo = serialPorts[i];
        let isExpansionHub =
            portInfo.vendorId === "0403" &&
            portInfo.productId === "6015" &&
            portInfo.serialNumber?.startsWith("DQ");
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
export async function openConnectedExpansionHubs(): Promise<ParentExpansionHub[]> {
    let serialNumbers = await getPossibleExpansionHubSerialNumbers();

    let hubs: ParentExpansionHub[] = [];

    for (let serialNumber of serialNumbers) {
        let hub = await openExpansionHubAndAllChildren(serialNumber);
        hubs.push(hub);
    }

    return hubs;
}
