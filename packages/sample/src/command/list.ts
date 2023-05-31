import { ExpansionHub } from "@rev-robotics/expansion-hub";
import { hubHierarchyToString } from "../HubStringify.js";

export async function list(hubs: ExpansionHub[]) {
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
