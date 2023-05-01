import {Command} from "commander";
import {getConnectedExpansionHubs} from "../../lib/Discovery";
import {RevHub} from "../../lib/RevHub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List conected devices').parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    getConnectedExpansionHubs().then((hubs) => {
        hubs.forEach((hub) => {
            toString(hub).then((str) => {
                console.log(str);
            })
        })
    })
}

async function toString(hub: RevHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
