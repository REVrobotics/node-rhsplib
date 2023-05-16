import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-m --motor <index>', 'Set motor index. Must also include -p')
    .option('-p --power <power>', 'Set motor power')
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

if(options.power) {
    let index: number = (options.motor) ? Number(options.motor) : 1;
    let power: number = Number(options.power);

    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    let hub = hubs[0]

    await hub.setMotorChannelMode(index, 0, true);
    console.log(`Power is ${power}, type is ${typeof power}`)
    await hub.setMotorConstantPower(index, power);
    await hub.setMotorChannelEnable(index, true);
}

async function toString(hub: ExpansionHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
