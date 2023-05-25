import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { DigitalState } from "@rev-robotics/expansion-hub/dist/digital-state.js";
import { DigitalChannelDirection } from "@rev-robotics/expansion-hub/dist/DigitalChannelDirection.js";

export async function digitalRead(channel: number): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DigitalChannelDirection.Input);
    let state = await hubs[0].getDigitalInput(channel);

    console.log(`${state}`);

    for (let hub of hubs) {
        hub.close();
    }
}

export async function digitalWrite(channel: number, state: DigitalState): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DigitalChannelDirection.Output);
    await hubs[0].setDigitalOutput(channel, state);

    for (let hub of hubs) {
        hub.close();
    }
}
