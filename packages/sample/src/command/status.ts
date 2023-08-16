import { ControlHub, ModuleStatus } from "@rev-robotics/rev-hub-core";

export async function status(hub: ControlHub) {
    hub.on("statusChanged", (status: ModuleStatus) => {
        console.log(`Status Changed:\n${JSON.stringify(status)}`);
    });

    hub.on("addressChanged", (oldAddress, newAddress) => {
        console.log(`Address Changed: ${oldAddress} -> ${newAddress}`);
    });

    hub.on("sessionEnded", () => {
        console.log("Session ended");
    });
}
