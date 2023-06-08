import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { openUsbControlHubs } from "../adb-setup.js";

export async function runServo(channel: number, pulseWidth: number, framePeriod: number) {
    const hubs = await openUsbControlHubs();

    for (let hub of hubs) {
        await hub.setServoConfiguration(channel, framePeriod);
        await hub.setServoPulseWidth(channel, pulseWidth);
        await hub.setServoEnable(channel, true);
        hub.close();
    }
}
