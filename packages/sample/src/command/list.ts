import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { controlHubHierarchyToString } from "../HubStringify.js";
import {ControlHub, ExpansionHub} from "@rev-robotics/rev-hub-core";
import {openUsbControlHubsAndChildren} from "../adb-setup.js";

export async function list() {
    let usbControlHubs = await openUsbControlHubsAndChildren();
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
