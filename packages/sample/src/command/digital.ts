import {
    DigitalChannelDirection,
    DigitalState,
    DioDirection,
    ExpansionHub,
} from "@rev-robotics/rev-hub-core";

export async function digitalRead(
    hub: ExpansionHub,
    channel: number,
    continuous: boolean,
): Promise<void> {
    await hub.setDigitalDirection(channel, DioDirection.Input);

    if (continuous) {
        while (true) {
            let state = await hub.getDigitalInput(channel);
            console.log(`${state}`);
        }
    } else {
        let state = await hub.getDigitalInput(channel);
        console.log(`${state}`);
    }
    hub.close();
}

export async function digitalWrite(
    hub: ExpansionHub,
    channel: number,
    state: DigitalState,
): Promise<void> {
    await hub.setDigitalDirection(channel, DioDirection.Output);
    await hub.setDigitalOutput(channel, state);
    hub.close();
}
