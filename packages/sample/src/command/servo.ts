import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function runServo(
    hub: ExpansionHub,
    channel: number,
    pulseWidth: number,
    framePeriod: number,
) {
    await hub.setServoConfiguration(channel, framePeriod);
    await hub.setServoPulseWidth(channel, pulseWidth);
    await hub.setServoEnable(channel, true);

    console.log(`Frame Width: ${await hub.getServoConfiguration(channel)}`);
    console.log(`Pulse Width: ${await hub.getServoPulseWidth(channel)}`);
    console.log(`Enable: ${await hub.getServoEnable(channel)}`);
}
