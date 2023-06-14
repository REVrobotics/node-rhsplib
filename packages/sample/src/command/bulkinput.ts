import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function getBulkInputData(hub: ExpansionHub): Promise<void> {
    let data = await hub.getBulkInputData();

    console.log(JSON.stringify(data));
}
