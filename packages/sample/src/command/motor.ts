import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { MotorMode } from "@rev-robotics/expansion-hub/dist/MotorMode.js";

export async function runMotorConstantPower(channel: number, power: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, MotorMode.CONSTANT_POWER, true);
    await hub.setMotorConstantPower(channel, power);
    await hub.setMotorChannelEnable(channel, true);
}

export async function runMotorConstantVelocity(channel: number, velocity: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, MotorMode.CONSTANT_VELOCITY, true);
    await hub.setMotorTargetVelocity(channel, velocity);
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
