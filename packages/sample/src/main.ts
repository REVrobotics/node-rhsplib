import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-c --close', 'Test closing a hub')
    .parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
        hub.close();
    });
}

if(options.close) {
    for(let i = 0; i < 10; i++) {
        const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
        hubs.forEach(async (hub) => {
            console.log(await toString(hub));
            hub.close();
        });
    }
}

async function toString(hub: ExpansionHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
