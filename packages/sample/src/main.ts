import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";
import { DIODirection } from "@rev-robotics/rhsplib";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-b --button', 'Run button press demo')
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

if (options.button) {
    let hubs = await getConnectedExpansionHubs();
    console.log("Press a button:");

    for (let i = 0; i < 8; i++) {
        await hubs[0].setDigitalDirection(i, DIODirection.Input);
    }

    let lastStates = 0;

    while (true) {
        for (let i = 0; i < 8; i++) {
            let state = await hubs[0].getDigitalSingleInput(i);
            let lastState = ((lastStates >> i) & 0x1) != 0;
            if (!state && lastState) {
                console.log(`Pressed button for input ${i}`);
            }

            let newBit = state ? 1 : 0;
            lastStates = (lastStates & ~(1 << i)) | (newBit << i);
        }
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
