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

export async function batteryVoltage(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getBatteryVoltage();
        console.log(`Battery Voltage: ${value} mV`);
        if (!continuous) break;
    }
}

export async function batteryCurrent(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getBatteryCurrent();
        console.log(`Battery Current: ${value} mA`);
        if (!continuous) break;
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

export async function i2cCurrent(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getI2CCurrent();
        console.log(`I2C Current: ${value} mA`);
        if (!continuous) break;
    }
}

export async function servoCurrent(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getServoCurrent();
        console.log(`Servo Current: ${value} mA`);
        if (!continuous) break;
    }
}

export async function motorCurrent(
    hub: ExpansionHub,
    channel: number,
    continuous: boolean,
) {
    while (true) {
        let value = await hub.getMotorCurrent(channel);
        console.log(`Motor ${channel} Current: ${value} mA`);
        if (!continuous) break;
    }
}

export async function digitalBusCurrent(hub: ExpansionHub, continuous: boolean) {
    while (true) {
        let value = await hub.getBatteryCurrent();
        console.log(`Digital Bus Current: ${value} mA`);
        if (!continuous) break;
    }
}
