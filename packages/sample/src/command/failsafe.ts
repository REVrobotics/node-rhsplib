import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function sendFailSafe(hub: ExpansionHub): Promise<void> {
    await hub.sendFailSafe();
}
