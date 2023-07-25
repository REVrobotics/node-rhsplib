import { ControlHubInternal } from "./internal/ControlHub.js";
import { ControlHub } from "@rev-robotics/rev-hub-core";

export async function openControlHub(
    hostname: string,
    port: number,
): Promise<ControlHub> {
    let hub = new ControlHubInternal("unknown");
    await hub.open(hostname, port + 1);
    return hub;
}
