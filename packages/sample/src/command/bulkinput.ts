import { ExpansionHub } from "@rev-robotics/expansion-hub";

export async function getBulkInputData(
    hub: ExpansionHub,
    isContinuous: boolean,
): Promise<void> {
    while (true) {
        let data = await hub.getBulkInputData();
        console.log(JSON.stringify(data));
        if (!isContinuous) break;
    }
}
