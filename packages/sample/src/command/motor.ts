import {
    ClosedLoopControlAlgorithm,
    ExpansionHub,
    MotorMode,
} from "@rev-robotics/rev-hub-core";

export async function runMotorConstantPower(
    hub: ExpansionHub,
    channel: number,
    power: number,
) {
    await hub.setMotorChannelMode(channel, MotorMode.OPEN_LOOP, true);
    await hub.setMotorConstantPower(channel, power);
    await hub.setMotorChannelEnable(channel, true);

    console.log(`Mode: ${JSON.stringify(await hub.getMotorChannelMode(channel))}`);
    console.log(`Power: ${await hub.getMotorConstantPower(channel)}`);
    console.log(`Enabled: ${await hub.getMotorChannelEnable(channel)}`);
}

export async function runMotorConstantVelocity(
    hub: ExpansionHub,
    channel: number,
    velocity: number,
) {
    await hub.setMotorChannelMode(channel, MotorMode.REGULATED_VELOCITY, true);
    await hub.setMotorTargetVelocity(channel, velocity);
    await hub.setMotorChannelEnable(channel, true);

    console.log(`Mode: ${JSON.stringify(await hub.getMotorChannelMode(channel))}`);
    console.log(`Power: ${await hub.getMotorConstantPower(channel)}`);
    console.log(`Velocity: ${await hub.getMotorTargetVelocity(channel)}`);
    console.log(`Enabled: ${await hub.getMotorChannelEnable(channel)}`);
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

    console.log(`Mode: ${JSON.stringify(await hub.getMotorChannelMode(channel))}`);
    console.log(`Power: ${await hub.getMotorConstantPower(channel)}`);
    console.log(`Velocity: ${await hub.getMotorTargetVelocity(channel)}`);
    console.log(`Position: ${JSON.stringify(await hub.getMotorTargetPosition(channel))}`);
    console.log(`Enabled: ${await hub.getMotorChannelEnable(channel)}`);

    while (!(await hub.getMotorAtTarget(channel))) {}
    console.log("Motor reached target");
}

export async function readEncoder(
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

export async function setMotorAlertLevel(
    hub: ExpansionHub,
    channel: number,
    currentLimit_mA: number,
) {
    await hub.setMotorChannelCurrentAlertLevel(channel, currentLimit_mA);
}

export async function getMotorAlertLevel_mA(
    hub: ExpansionHub,
    channel: number,
): Promise<number> {
    return await hub.getMotorChannelCurrentAlertLevel(channel);
}

export async function setMotorRegulatedVelocityPid(
    hub: ExpansionHub,
    channel: number,
    p: number,
    i: number,
    d: number,
) {
    await hub.setMotorClosedLoopControlCoefficients(
        channel,
        MotorMode.REGULATED_VELOCITY,
        ClosedLoopControlAlgorithm.LegacyPid,
        {
            p: p,
            i: i,
            d: d,
            algorithm: ClosedLoopControlAlgorithm.LegacyPid,
        },
    );

    await getMotorRegulatedVelocityPidf(hub, channel);
}

export async function setMotorRegulatedVelocityPidf(
    hub: ExpansionHub,
    channel: number,
    p: number,
    i: number,
    d: number,
    f: number,
) {
    await hub.setMotorClosedLoopControlCoefficients(
        channel,
        MotorMode.REGULATED_VELOCITY,
        ClosedLoopControlAlgorithm.Pidf,
        {
            p: p,
            i: i,
            d: d,
            f: f,
            algorithm: ClosedLoopControlAlgorithm.Pidf,
        },
    );

    await getMotorRegulatedVelocityPidf(hub, channel);
}

export async function getMotorRegulatedVelocityPidf(hub: ExpansionHub, channel: number) {
    let pidf = await hub.getMotorClosedLoopControlCoefficients(
        channel,
        MotorMode.REGULATED_VELOCITY,
    );

    console.log(pidf.algorithm);

    console.log(JSON.stringify(pidf));
}
