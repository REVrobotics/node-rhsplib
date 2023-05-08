import {Command} from "commander";
import {
    createLEDPattern,
    createLEDPatternStep,
    ExpansionHub,
    getConnectedExpansionHubs
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
        console.log(await toString(hub));
    });
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

async function toString(hub: ExpansionHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
