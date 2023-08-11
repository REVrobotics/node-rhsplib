import { ControlHub, ParentRevHub } from "@rev-robotics/rev-hub-core";
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
            let parentHub: ParentRevHub;
            let childAddresses = addresses[serialNumber].childAddresses;

            if (serialNumber === "(embedded)") {
                parentHub = controlHub;
            } else {
                let parentHubInfo = addresses[serialNumber];
                parentHub = await controlHub.addUsbConnectedHub(
                    serialNumber,
                    parentHubInfo.parentHubAddress,
                );
            }

            for (let childAddress of childAddresses) {
                await parentHub.addChildByAddress(childAddress);
            }
        }
        result.push(controlHub);
    }

    return result;
}
