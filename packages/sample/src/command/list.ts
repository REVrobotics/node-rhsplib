import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { controlHubHierarchyToString } from "../HubStringify.js";
import {ExpansionHub} from "@rev-robotics/rev-hub-core";
import { openUsbControlHubs } from "../adb-setup";

export async function list() {
    let usbControlHubs = await openUsbControlHubs();
    for (const hub of usbControlHubs) {
        let hierarchy = controlHubHierarchyToString(hub);
        console.log(hierarchy);
        hub.close();
    }

    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    for (const hub of hubs) {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        //console.log(controlHubHierarchyToString(hub));
    }
    hubs.forEach((hub) => {
        hub.close();
    });
}
