import { hubHierarchyToString } from "../HubStringify.js";
import { openConnectedControlHub } from "@rev-robotics/control-hub";
import {ExpansionHub} from "@rev-robotics/rev-hub-core";

export async function list() {
    const controlHub = await openConnectedControlHub();
    if (controlHub) {
        console.log(`Control Hub: ${controlHub.moduleAddress}\n\n`);
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
