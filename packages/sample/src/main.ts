import {Command} from "commander";
import {
    createLEDPattern,
    createLEDPatternStep,
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
        createLEDPatternStep(1, 0, 255, 0), //green
        createLEDPatternStep(1, 255, 0, 0), //red
        createLEDPatternStep(1, 0, 0, 255), //blue
        createLEDPatternStep(1, 255, 0, 255), //magenta
        createLEDPatternStep(1, 255, 255, 0), //yellow
    ]
    await hubs[0].sendKeepAlive();
    const pattern = createLEDPattern(steps);
    await hubs[0].setModuleLEDPattern(pattern);

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
