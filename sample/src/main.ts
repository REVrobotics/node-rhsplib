import {Command} from "commander";
import {getConnectedExpansionHubs} from "../../lib/Discovery.js";
import {RevHub} from "../../lib/RevHub.js";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List conected devices').parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: RevHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
    })
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.getDestAddress()}\n`;

    for(const [_, child] of hub.children) {
        result += `\tRevHub: ${child.getDestAddress()}\n`;
    }

    return result;
}
