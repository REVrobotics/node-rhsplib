import { ControlHub } from "./internal/ControlHub.js";
import { Adb, DeviceClient } from "@u4/adbkit";
import getPort from "get-port";

export async function openConnectedControlHub(): Promise<ControlHub | undefined> {
    try {
        return await createWiFiControlHub();
    } catch (e: any) {
        return undefined;
    }
}

export async function openUsbControlHubs(): Promise<ControlHub[]> {
    let adbClient = Adb.createClient();

    let devices = await adbClient.listDevices();
    let controlHubs = devices.filter(async (device) => {
        let deviceClient = device.getClient();
        let isHub = await isControlHub(deviceClient);
        console.log(`Is hub? ${isHub}`);
        if (isHub) {
            console.log("configuring tcp");
            await configureHubTcp(deviceClient);
        }
        return isHub;
    });

    console.log(`Found ${controlHubs.length} Control hubs`);

    let result: ControlHub[] = [];

    for (const device of controlHubs) {
        let hub = new ControlHub();
        console.log("Opening hub");
        await hub.open();
        result.push(hub);
    }
    return result;
}

async function configureHubTcp(deviceClient: DeviceClient) {
    let port = await findAdjacentPorts();
    console.log(`Found port ${port}`);
    await deviceClient.forward(`tcp:${port}`, `tcp:8080`);
    await deviceClient.forward(`tcp:${port + 1}`, `tcp:8081`);
}

async function isControlHub(deviceClient: DeviceClient): Promise<boolean> {
    let serialasusb = await deviceClient.execOut(
        "getprop persist.ftcandroid.serialasusb",
        "utf8",
    );
    return serialasusb.startsWith("true");
}

async function createWiFiControlHub(): Promise<ControlHub> {
    let hub = new ControlHub();

    if (!(await hub.isWiFiConnected())) {
        throw new Error("Hub is not connected via WiFi");
    }

    await hub.open();

    return hub;
}

/**
 * Returns the first of two adjacent ports.
 * @param host
 */
export async function findAdjacentPorts(host: string = "127.0.0.1"): Promise<number> {
    console.log("Finding ports");
    try {
        //const getPort = (await import("get-port")).default;
        let port = await getPort({ host: host });
        let adjacent = await getPort({ host: host, port: port + 1 });
        console.log("Tried to get ports");
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
