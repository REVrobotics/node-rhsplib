import {Command} from "commander";
import {getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-m --motor <power>', 'Set motor power')
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

if(options.motor) {
    let power: number = Number(options.motor);

    const hubs: RevHub[] = await getConnectedExpansionHubs();
    let hub = hubs[0]

    await hub.setMotorChannelMode(1, 0, true);
    console.log(`Power is ${power}, type is ${typeof power}`)
    await hub.setMotorConstantPower(1, power);
    await hub.setMotorChannelEnable(1, true);
}

async function toString(hub: RevHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}