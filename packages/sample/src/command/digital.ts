import { DigitalState, DioDirection, ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function digitalRead(
    hub: ExpansionHub,
    channel: number,
    continuous: boolean,
): Promise<void> {
    await hub.setDigitalDirection(channel, DioDirection.Input);
    console.log(
        `Channel ${channel} direction is ${await hub.getDigitalDirection(channel)}`,
    );
    while (true) {
        let state = await hub.getDigitalInput(channel);
        console.log(`${state}`);
        if (!continuous) break;
    }
}

export async function digitalWrite(
    hub: ExpansionHub,
    channel: number,
    state: DigitalState,
): Promise<void> {
    await hub.setDigitalDirection(channel, DioDirection.Output);
    console.log(
        `Channel ${channel} direction is ${await hub.getDigitalDirection(channel)}`,
    );
    await hub.setDigitalOutput(channel, state);
}
