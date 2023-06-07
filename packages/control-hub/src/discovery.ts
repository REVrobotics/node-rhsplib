import { ControlHubInternal } from "./internal/ControlHub.js";
import { ControlHub, ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function openConnectedControlHub(): Promise<ControlHub | undefined> {
    try {
        return await createWiFiControlHub();
    } catch (e: any) {
        return undefined;
    }
}

async function createWiFiControlHub(): Promise<ControlHub> {
    let hub = new ControlHubInternal("Placeholder");

    if (!(await hub.isWiFiConnected())) {
        throw new Error("Hub is not connected via WiFi");
    }

    await hub.open();

    return hub;
}
