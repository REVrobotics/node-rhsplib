import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-c --count <counts>', 'Set encoder count. Must also specify --motor')
    .option('-m --motor <index>', 'Set motor index. Must also include --power or --count')
    .option('-p --power <power>', 'Set motor power. Must also specify --motor')
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
    if(!options.motor) {
        program.error("Please provide a motor index using --motor");
    }
    let index: number = Number(options.motor);
    let power: number = Number(options.power);

    console.log(`motor: ${index}, raw: ${options.motor}`);

    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    let hub = hubs[0];

    await hub.setMotorChannelMode(index, 0, true);
    await hub.setMotorConstantPower(index, power);
    await hub.setMotorChannelEnable(index, true);
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
