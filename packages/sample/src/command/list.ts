import { hubHierarchyToString } from "../HubStringify.js";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function list() {
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    for (const hub of hubs) {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(hubHierarchyToString(hub));
    }

    setTimeout(() => {
        hubs.forEach(async (hub) => {
            hub.close();
        });
    }, 2000);
}
