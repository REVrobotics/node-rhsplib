import {Command} from "commander";
import {
    createLedPattern,
    createLedPatternStep,
    ExpansionHub,
    getConnectedExpansionHubs,
    RevHub
} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('--led', 'Start led pattern')
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

if(options.led) {
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    const steps = [
        createLedPatternStep(1, 0, 255, 0), //green
        createLedPatternStep(1, 255, 0, 0), //red
        createLedPatternStep(1, 0, 0, 255), //blue
        createLedPatternStep(1, 255, 0, 255), //magenta
        createLedPatternStep(1, 255, 255, 0), //yellow
    ]
    await hubs[0].sendKeepAlive();
    const pattern = createLedPattern(steps);
    await hubs[0].setModuleLedPattern(pattern);

    setInterval(async () => {
        await hubs[0].sendKeepAlive();
    }, 1000);
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
