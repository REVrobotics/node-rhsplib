import { DIODirection } from "@rev-robotics/rhsplib";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { DigitalState } from "@rev-robotics/expansion-hub/dist/digital-state.js";

export async function digitalRead(channel: number): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DIODirection.Input);
    let state = await hubs[0].getDigitalSingleInput(channel);

    console.log(`${state}`);

    for (let hub of hubs) {
        hub.close();
    }
}

export async function digitalWrite(channel: number, state: DigitalState): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DIODirection.Input);
    await hubs[0].setDigitalSingleOutput(channel, state);

    for (let hub of hubs) {
        hub.close();
    }
}
