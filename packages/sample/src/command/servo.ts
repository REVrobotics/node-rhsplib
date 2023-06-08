import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { openUsbControlHubs } from "../adb-setup.js";

export async function runServo(channel: number, pulseWidth: number, framePeriod: number) {
    const hubs = await openUsbControlHubs();

    await hubs[0].setServoConfiguration(channel, framePeriod);
    await hubs[0].setServoPulseWidth(channel, pulseWidth);
    await hubs[0].setServoEnable(channel, true);
}
