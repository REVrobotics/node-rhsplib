import {Command} from "commander";
import {
    createLedPattern,
    ExpansionHub,
    getConnectedExpansionHubs, LedPatternStep,
    RevHub
} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-c --count <counts>', 'Set encoder count. Must also specify --motor')
    .option('-m --motor <index>', 'Set motor index. Must also include --power or --count')
    .option('-p --power <power>', 'Set motor power. Must also specify --motor')
    .option('--led', 'Start led pattern')
    .parse(process.argv);

const options = program.opts();

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

if(options.count) {
    if(!options.motor) {
        program.error("Please provide a motor index using --motor");
    }
    let index = Number(options.motor);
    let counts = Number(options.count);

    const hubs = await getConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(index, 2, true);
    await hub.setMotorTargetPosition(index, counts, 100);
    await hub.setMotorChannelEnable(index, true);
}

if(options.power) {
    if (!options.motor) {
        program.error("Please provide a motor index using --motor");
    }
    let index: number = Number(options.motor);
    let power: number = Number(options.power);

    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(index, 0, true);
    await hub.setMotorConstantPower(index, power);
    await hub.setMotorChannelEnable(index, true);
}

if(options.led) {
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    const steps = [
        new LedPatternStep(1, 0, 255, 0), //green
        new LedPatternStep(1, 255, 0, 0), //red
        new LedPatternStep(1, 0, 0, 255), //blue
        new LedPatternStep(1, 255, 0, 255), //magenta
        new LedPatternStep(1, 255, 255, 0), //yellow
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
