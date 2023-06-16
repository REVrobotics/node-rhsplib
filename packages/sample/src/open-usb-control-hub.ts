import { ControlHub } from "@rev-robotics/rev-hub-core";
import { ControlHubInternal } from "@rev-robotics/control-hub/dist/internal/ControlHub.js";
import { openUsbControlHubs } from "./adb-setup.js";

export async function openUsbControlHubsAndChildren(): Promise<ControlHub[]> {
    let hubs = await openUsbControlHubs();
    let result: ControlHub[] = [];

    for (let hub of hubs) {
        let controlHub = hub as ControlHubInternal;
        let addresses: Record<
            string,
            {
                serialNumber: string;
                parentHubAddress: number;
                childAddresses: number[];
            }
        > = await controlHub.sendCommand("scanAndDiscover", {}, 20000);

        for (let serialNumber in addresses) {
            if (serialNumber === "(embedded)") continue;

            let parentHubInfo = addresses[serialNumber];
            let parentHub = await controlHub.addHubBySerialNumberAndAddress(
                serialNumber,
                parentHubInfo.parentHubAddress,
            );

            for (let childAddress of parentHubInfo.childAddresses) {
                await parentHub.addChildByAddress(childAddress);
            }
        }
        result.push(controlHub);
    }

    return result;
}
