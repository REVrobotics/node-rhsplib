import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-a --analog <port>', 'Read an analog port')
    .option('-c --continuous', 'Specify that sensor readings should be continuous')
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
