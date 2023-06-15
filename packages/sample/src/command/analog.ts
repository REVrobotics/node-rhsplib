import { openUsbControlHubs } from "../adb-setup.js";
import { ExpansionHub, ParentExpansionHub } from "@rev-robotics/rev-hub-core";
import { openUsbControlHubsAndChildren } from "@rev-robotics/control-hub";

export async function analog(channel: number, continuous: boolean) {
    const hubs = await openUsbControlHubsAndChildren();
    let hub: ExpansionHub = hubs[0].children[1] as ExpansionHub;

    if (continuous) {
        while (true) {
            let value = await hub.getAnalogInput(channel);
            console.log(`ADC: ${value} mV`);
        }
    } else {
        let value = await hub.getAnalogInput(channel);
        console.log(`ADC: ${value} mV`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}

export async function temperature(continuous: boolean) {
    const hubs = await openUsbControlHubs();

    if (continuous) {
        while (true) {
            let value = await hubs[0].getTemperature();
            console.log(`Temperature: ${value} C`);
        }
    } else {
        let value = await hubs[0].getTemperature();
        console.log(`Temperature: ${value} C`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}

export async function battery(continuous: boolean) {
    const hubs = await openUsbControlHubs();

    if (continuous) {
        while (true) {
            let value = await hubs[0].getBatteryVoltage();
            console.log(`Battery: ${value} mV`);
        }
    } else {
        let value = await hubs[0].getBatteryVoltage();
        console.log(`Battery: ${value} mV`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}

export async function voltageRail(continuous: boolean) {
    const hubs = await openUsbControlHubs();

    if (continuous) {
        while (true) {
            let value = await hubs[0].get5VBusVoltage();
            console.log(`5V rail: ${value} mV`);
        }
    } else {
        let value = await hubs[0].get5VBusVoltage();
        console.log(`5V rail: ${value} mV`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}
