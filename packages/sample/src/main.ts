import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

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

if(options.close) {
    for(let i = 0; i < 10; i++) {
        const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
        hubs.forEach(async (hub) => {
            console.log(await toString(hub));
            hub.close();
        });
    }
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if(hub.isParent()) {
        for(const child of hub.getChildren()) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
