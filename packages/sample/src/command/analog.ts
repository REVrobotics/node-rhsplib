import { ExpansionHub, openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function analog(hub: ExpansionHub, channel: number, continuous: boolean) {
    while (true) {
        let value = await hub.getAnalogInput(channel);
        console.log(`ADC: ${value} mV`);
        if (!continuous) break;
    }
}

export async function temperature(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getTemperature();
        console.log(`Temperature: ${value} C`);
        if (!continuous) break;
    }
}

export async function battery(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getTemperature();
        console.log(`Temperature: ${value} C`);
        if (!continuous) break;
    }
}

export async function voltageRail(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.get5VBusVoltage();
        console.log(`5V rail: ${value} mV`);
        if (!continuous) break;
    }
}
