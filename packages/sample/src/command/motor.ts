import { ExpansionHub, MotorMode } from "@rev-robotics/rev-hub-core";

export async function runMotorConstantPower(
    hub: ExpansionHub,
    channel: number,
    power: number,
) {
    await hub.setMotorChannelMode(channel, MotorMode.OPEN_LOOP, true);
    await hub.setMotorConstantPower(channel, power);
    await hub.setMotorChannelEnable(channel, true);
}

export async function runMotorConstantVelocity(
    hub: ExpansionHub,
    channel: number,
    velocity: number,
) {
    await hub.setMotorChannelMode(channel, MotorMode.REGULATED_VELOCITY, true);
    await hub.setMotorTargetVelocity(channel, velocity);
    await hub.setMotorChannelEnable(channel, true);
}

export async function runMotorToPosition(
    hub: ExpansionHub,
    channel: number,
    velocity: number,
    position: number,
    tolerance: number,
) {
    await hub.setMotorChannelMode(channel, MotorMode.REGULATED_POSITION, true);
    await hub.setMotorTargetVelocity(channel, velocity);
    await hub.setMotorTargetPosition(channel, position, tolerance);
    await hub.setMotorChannelEnable(channel, true);
}

export async function runEncoder(
    hub: ExpansionHub,
    channel: number,
    continuous: boolean,
) {
    while (true) {
        let encoder = await hub.getMotorEncoderPosition(channel);
        console.log(`Encoder count is ${encoder}`);
        if (!continuous) break;
    }
}

export async function resetEncoder(hub: ExpansionHub, channel: number) {
    await hub.resetMotorEncoder(channel);
}
