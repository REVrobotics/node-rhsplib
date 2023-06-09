import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { MotorMode } from "@rev-robotics/rev-hub-core";

export async function runMotorConstantPower(channel: number, power: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, MotorMode.OPEN_LOOP, true);
    await hub.setMotorConstantPower(channel, power);
    await hub.setMotorChannelEnable(channel, true);

    process.on("SIGINT", () => {
        hub.close();
        process.exit();
    });
}

export async function runMotorConstantVelocity(channel: number, velocity: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, MotorMode.REGULATED_VELOCITY, true);
    await hub.setMotorTargetVelocity(channel, velocity);
    await hub.setMotorChannelEnable(channel, true);
    process.on("SIGINT", () => {
        hub.setMotorChannelEnable(channel, false);
        process.exit();
    });
}

export async function runMotorToPosition(
    channel: number,
    velocity: number,
    position: number,
    tolerance: number,
) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, MotorMode.REGULATED_POSITION, true);
    await hub.setMotorTargetVelocity(channel, velocity);
    await hub.setMotorTargetPosition(channel, position, tolerance);
    await hub.setMotorChannelEnable(channel, true);
    process.on("SIGINT", () => {
        hub.setMotorChannelEnable(channel, false);
        process.exit();
    });
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
