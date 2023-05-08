import {Command} from "commander";
import {getConnectedExpansionHubs, openParentRevHub} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-e --error', 'error out')
    .parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: RevHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
    });
}

if(options.error) {
    try {
        await openParentRevHub("a serial number that isn't correct")
        console.log("Expected error, but got none")
    } catch(e) {
        console.log("Correctly got error.")
        console.log(`Error is:\n\t${e}`)
    }
}

async function toString(hub: RevHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}