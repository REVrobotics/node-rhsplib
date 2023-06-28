import {
    DigitalState,
    DigitalChannelDirection,
    ExpansionHub,
} from "@rev-robotics/rev-hub-core";

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

export async function digitalReadAll(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let inputs = await hub.getAllDigitalInputs();
        console.log(`Digital Pins: ${inputs.toString(2).padStart(8, "0")}`);
        if (!continuous) break;
    }
}

export async function digitalWriteAll(
    hub: ExpansionHub,
    bitfield: number,
    bitmask: number,
) {
    for (let i = 0; i < 8; i++) {
        if (((bitmask >> i) & 1) == 1) {
            await hub.setDigitalDirection(i, DigitalChannelDirection.Output);
        } else {
            await hub.setDigitalDirection(i, DigitalChannelDirection.Input);
        }
    }
    await hub.setAllDigitalOutputs(bitfield);
}
