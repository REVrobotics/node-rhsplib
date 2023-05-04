import {Command} from "commander";
import {getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices').parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: RevHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
    });
}

async function toString(hub: RevHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}