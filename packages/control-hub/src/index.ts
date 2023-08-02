import { ControlHubInternal } from "./internal/ControlHub.js";
import { ControlHub } from "@rev-robotics/rev-hub-core";

export { openUsbControlHubsAndChildren } from "./internal/ControlHub.js";

export async function openControlHub(
    ipAddressOrHostname: string,
    port: number,
): Promise<ControlHub> {
    let hub = new ControlHubInternal();
    await hub.open(ipAddressOrHostname, port);
    return hub;
}

// export async function openControlHubAndAllChildren(hostname: string, port: number): Promise<ControlHub> {
//
// }
