import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function runServo(
    hub: ExpansionHub,
    channel: number,
    pulseWidth: number,
    framePeriod: number,
) {
    await hub.setServoConfiguration(channel, framePeriod);
    await hub.setServoPulseWidth(channel, pulseWidth);
    await hub.setServoEnable(channel, true);
}
