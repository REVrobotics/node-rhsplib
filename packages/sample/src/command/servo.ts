import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function runServo(
    hubs: ExpansionHub[],
    channel: number,
    pulseWidth: number,
    framePeriod: number,
) {
    for (let hub of hubs) {
        await hub.setServoConfiguration(channel, framePeriod);
        await hub.setServoPulseWidth(channel, pulseWidth);
        await hub.setServoEnable(channel, true);
    }
}
