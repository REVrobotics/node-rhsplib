import {Command} from "commander";
import {getConnectedExpansionHubs} from "../../lib/Discovery.js";
import {RevHub} from "../../lib/RevHub.js";
import {startKeepAlive} from "../../lib/keep-alive.js";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List conected devices')
    .option("-k --keep-alive", "start keep-alive timer")
    .parse(process.argv);

const options = program.opts();

console.log("Starting...");

if (options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: RevHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
    })
}

if (options.keepAlive) {
    const hubs: RevHub[] = await getConnectedExpansionHubs();
    console.log("Starting Keep Alive");
}

async function toString(hub: RevHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
