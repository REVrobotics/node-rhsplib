import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function firmwareVersion(hub: ExpansionHub) {
    let version = await hub.readVersionString();

    console.log(`Version is ${version}`);
}
