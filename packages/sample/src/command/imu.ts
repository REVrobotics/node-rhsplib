import { ControlHub } from "@rev-robotics/rev-hub-core";

export async function imu(hub: ControlHub, continuous: boolean) {
    await hub.initializeImu();

    while (true) {
        let imuData = await hub.getImuData();
        console.log(JSON.stringify(imuData));

        if (!continuous) break;
    }
}
