import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { MotorMode } from "@rev-robotics/expansion-hub/dist/MotorMode.js";

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

export async function runEncoder(channel: number, continuous: boolean) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    while (true) {
        let encoder = await hub.getMotorEncoderPosition(channel);
        console.log(`Encoder count is ${encoder}`);
        if (!continuous) break;
    }
    hub.close();
}

export async function resetEncoder(channel: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.resetMotorEncoder(channel);
    hub.close();
}
