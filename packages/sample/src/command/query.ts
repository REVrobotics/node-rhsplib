import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function queryInterface(hub: ExpansionHub, name: string): Promise<void> {
    let iface = await hub.queryInterface(name);

    console.log(
        `Interface: ${iface.name} has ${iface.numberIDValues} ids, starting at ${iface.firstPacketID}`,
    );

    hub.close();
}
