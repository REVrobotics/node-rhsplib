import { Adb, DeviceClient } from "@u4/adbkit";
import getPort from "get-port";
import { ControlHub, ParentRevHub } from "@rev-robotics/rev-hub-core";
import { openControlHub } from "@rev-robotics/control-hub";
import { ControlHubInternal } from "@rev-robotics/control-hub/dist/internal/ControlHub.js";

export async function openUsbControlHubsAndChildren(): Promise<ControlHub[]> {
    let adbClient = Adb.createClient();
    let controlHubs: ControlHub[] = [];

    let devices = await adbClient.listDevices();
    for (const device of devices) {
        let deviceClient = device.getClient();
        let isHub = await isControlHub(deviceClient);
        if (isHub) {
            let port = await configureHubTcp(deviceClient);
            let serialNumber = device.id;

            let hub = await openControlHub(serialNumber, 173, port) as ControlHubInternal;
            controlHubs.push(hub);

            let addresses: Record<
              string,
              {
                  serialNumber: string;
                  parentHubAddress: number;
                  childAddresses: number[];
              }
            > = await hub.sendCommand("scanAndDiscover", {}, 20000);

            for (let serialNumber in addresses) {
                let parentHub: ParentRevHub;
                let childAddresses = addresses[serialNumber].childAddresses;

                if (serialNumber === "(embedded)") {
                    parentHub = hub;
                } else {
                    let parentHubInfo = addresses[serialNumber];
                    parentHub = await hub.addUsbConnectedHub(
                      serialNumber,
                      parentHubInfo.parentHubAddress,
                    );
                }

                for (let childAddress of childAddresses) {
                    await parentHub.addChildByAddress(childAddress);
                }
            }
        }
    }

    return controlHubs;
}

async function isControlHub(deviceClient: DeviceClient): Promise<boolean> {
    let serialasusb = await deviceClient.execOut(
        "getprop persist.ftcandroid.serialasusb",
        "utf8",
    );
    return serialasusb.startsWith("true");
}

async function configureHubTcp(deviceClient: DeviceClient): Promise<number> {
    let port = await findAdjacentPorts();
    await deviceClient.forward(`tcp:${port}`, `tcp:8080`);
    await deviceClient.forward(`tcp:${port + 1}`, `tcp:8081`);

    return port;
}

/**
 * Returns the first of two adjacent ports.
 * @param host
 */
export async function findAdjacentPorts(host: string = "127.0.0.1"): Promise<number> {
    try {
        //const getPort = (await import("get-port")).default;
        let port = await getPort({ host: host });
        let adjacent = await getPort({ host: host, port: port + 1 });
        if (adjacent === port + 1) return port;
        else {
            return await findAdjacentPorts(host);
        }
    } catch (e) {
        console.log("Got error checking ports");
        console.log(e);
        throw e;
    }
}
