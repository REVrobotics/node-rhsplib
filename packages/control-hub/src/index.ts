import { ControlHubInternal } from "./internal/ControlHub.js";
import { ControlHub } from "@rev-robotics/rev-hub-core";

export async function openControlHub(
    serialNumber: string,
    moduleAddress: number,
    port: number,
): Promise<ControlHub> {
    let hub = new ControlHubInternal(serialNumber);
    await hub.open("127.0.0.1", port + 1);
    return hub;
}
