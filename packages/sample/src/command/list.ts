import { hubHierarchyToString } from "../HubStringify.js";
import {ExpansionHub} from "@rev-robotics/rev-hub-core";
import { openConnectedControlHub, openUsbControlHubs } from "@rev-robotics/control-hub";

export async function list() {
    let usbControlHubs = await openUsbControlHubs();
    for (const hub of usbControlHubs) {
        console.log(`USB Control Hub: ${hub.moduleAddress}\n\n`);
        hub.close();
    }

    const controlHub = await openConnectedControlHub();
    if (controlHub) {
        console.log(`WiFi Control Hub: ${controlHub.moduleAddress}\n\n`);
        controlHub.close();
    }

    console.log("USB Expansion Hub:");
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    for (const hub of hubs) {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(hubHierarchyToString(hub));
    }
    hubs.forEach((hub) => {
        hub.close();
    });
}
