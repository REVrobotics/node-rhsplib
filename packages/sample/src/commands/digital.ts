import { DioDirection } from "@rev-robotics/rhsplib";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function digitalRead(channel: number): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DioDirection.Input);
    let state = await hubs[0].getDigitalSingleInput(channel);

    console.log(state);

    for (let hub of hubs) {
        hub.close();
    }
}

export async function digitalWrite(channel: number, state: boolean): Promise<void> {
    let hubs = await openConnectedExpansionHubs();

    await hubs[0].setDigitalDirection(channel, DioDirection.Output);
    await hubs[0].setDigitalSingleOutput(channel, state);

    for (let hub of hubs) {
        hub.close();
    }
}
