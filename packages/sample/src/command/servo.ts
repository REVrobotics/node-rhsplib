import {ExpansionHub} from "@rev-robotics/rev-hub-core";

export async function runServo(hub: ExpansionHub, channel: number, pulseWidth: number, framePeriod: number) {
    await hub.setServoConfiguration(channel, framePeriod);
    await hub.setServoPulseWidth(channel, pulseWidth);
    await hub.setServoEnable(channel, true);
    hub.close();
}
