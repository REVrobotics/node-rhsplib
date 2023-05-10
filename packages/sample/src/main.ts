import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices').parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        console.log(await toString(hub));
    });
}

async function toString(hub: ExpansionHub): Promise<string> {
    let result = `RevHub: ${hub.getDestAddress()}\n`;

    if(hub.isParent()) {
        for(const child of hub.getChildren()) {
            if(child.isExpansionHub()) {
                result += `\tRevHub: ${child.getDestAddress()}\n`;
            }
        }
    }

    return result;
}
