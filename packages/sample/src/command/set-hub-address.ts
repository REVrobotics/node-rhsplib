import { ControlHub } from "@rev-robotics/rev-hub-core";

export async function setHubAddress(hub: ControlHub, address: number) {
    hub.on("addressChanged", (oldAddress, newAddress) => {
        console.log(`Address changed from ${oldAddress} -> ${newAddress}`);
    });
    await hub.setNewModuleAddress(address);
}
