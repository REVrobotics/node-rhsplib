import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function getBulkInputData(
    hub: ExpansionHub,
    isContinuous: boolean,
): Promise<void> {
    while (true) {
        let data = await hub.getBulkInputData();
        console.log(JSON.stringify(data));
        if (!isContinuous) break;
    }
    hub.close();
}
