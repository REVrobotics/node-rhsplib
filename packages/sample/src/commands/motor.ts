import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function runMotorConstantPower(channel: number, power: number) {
    const hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(channel, 0, true);
    await hub.setMotorConstantPower(channel, power);
    await hub.setMotorChannelEnable(channel, true);
}
