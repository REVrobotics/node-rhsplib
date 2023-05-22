import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { toString } from "../HubStringify.js";

export async function list() {
    console.log("Starting to search Serial Ports");
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    for (const hub of hubs) {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(await toString(hub));
    }

    setTimeout(() => {
        hubs.forEach(async (hub) => {
            hub.close();
        });
    }, 2000);
}
