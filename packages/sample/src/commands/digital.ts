import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { DigitalState } from "@rev-robotics/expansion-hub/dist/digital-state.js";
import { DigitalChannelDirection } from "@rev-robotics/expansion-hub/dist/DigitalChannelDirection.js";

export async function digitalRead(
    hub: ExpansionHub,
    channel: number,
    continuous: boolean,
): Promise<void> {
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
    await hub.setDigitalDirection(channel, DigitalChannelDirection.Output);
    await hub.setDigitalOutput(channel, state);
}
