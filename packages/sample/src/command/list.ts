import { hubHierarchyToString } from "../HubStringify.js";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function list(hubs: ExpansionHub[]) {
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
