import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-a --analog <port>', 'Read an analog port')
    .option('-c --continuous', 'Specify that sensor readings should be continuous')
    .option('-b --battery', 'Read the current battery voltage')
    .option('-v --volt', 'Read the current 5V rail voltage')
    .option('-t --temperature', 'Read the current temperature')
    .parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(await toString(hub));
    });

    setTimeout(() => {
        hubs.forEach(async (hub) => {
            hub.close();
        })
    }, 2000);
}

if(options.temperature) {
    let isContinuous = options.continuous !== undefined;
    const hubs = await getConnectedExpansionHubs();

    if(isContinuous) {
        while(true) {
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

if(options.battery) {
    let isContinuous = options.continuous !== undefined;
    const hubs = await getConnectedExpansionHubs();

    if(isContinuous) {
        while(true) {
            let value = await hubs[0].getBatteryVoltage();
            console.log(`Battery: ${value}`);
        }
    } else {
        let value = await hubs[0].getBatteryVoltage();
        console.log(`Battery: ${value}`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}

if(options.volt) {
    let isContinuous = options.continuous !== undefined;
    const hubs = await getConnectedExpansionHubs();

    if(isContinuous) {
        while(true) {
            let value = await hubs[0].get5VMonitorVoltage();
            console.log(`5V rail: ${value} mV`);
        }
    } else {
        let value = await hubs[0].get5VMonitorVoltage();
        console.log(`5V rail: ${value} mV`);
        hubs.forEach((hub) => {
            hub.close();
        });
    }
}

if(options.analog) {
    let isContinuous = options.continuous !== undefined;
    let port = Number(options.analog);
    const hubs = await getConnectedExpansionHubs();

    if(isContinuous) {
        while(true) {
            let value = await hubs[0].getADC(port, false);
            console.log(`ADC: ${value}`);
        }
    } else {
        let value = await hubs[0].getADC(port, false);
        console.log(`ADC: ${value}`);
        hubs.forEach((hub) => {
           hub.close();
        });
    }
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if(hub.isExpansionHub()) {
        console.log(`Is open? ${hub.isOpen}`)
    }

    if(hub.isParent()) {
        for(const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
