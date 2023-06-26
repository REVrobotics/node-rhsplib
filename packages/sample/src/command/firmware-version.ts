import { ExpansionHub } from "@rev-robotics/expansion-hub";

export async function firmwareVersion(hub: ExpansionHub) {
    let version = await hub.readVersionString();

    console.log(`Version is ${version}`);
}
