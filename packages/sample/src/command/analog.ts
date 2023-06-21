import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function analog(hub: ExpansionHub, channel: number, continuous: boolean) {
    if (continuous) {
        while (true) {
            let value = await hub.getAnalogInput(channel);
            console.log(`ADC: ${value} mV`);
        }
    } else {
        let value = await hub.getAnalogInput(channel);
        console.log(`ADC: ${value} mV`);
    }
}

export async function temperature(hub: ExpansionHub, continuous: boolean) {
    if (continuous) {
        while (true) {
            let value = await hub.getTemperature();
            console.log(`Temperature: ${value} C`);
        }
    } else {
        let value = await hub.getTemperature();
        console.log(`Temperature: ${value} C`);
    }
}

export async function battery(hub: ExpansionHub, continuous: boolean) {
    if (continuous) {
        while (true) {
            let value = await hub.getBatteryVoltage();
            console.log(`Battery: ${value} mV`);
        }
    } else {
        let value = await hub.getBatteryVoltage();
        console.log(`Battery: ${value} mV`);
    }
}

export async function voltageRail(hub: ExpansionHub, continuous: boolean) {
    if (continuous) {
        while (true) {
            let value = await hub.get5VBusVoltage();
            console.log(`5V rail: ${value} mV`);
        }
    } else {
        let value = await hub.get5VBusVoltage();
        console.log(`5V rail: ${value} mV`);
    }
}
