import { Command } from "commander";
import {
    createLedPattern,
    ExpansionHub,
    openConnectedExpansionHubs,
    LedPatternStep,
    RevHub,
} from "@rev-robotics/expansion-hub";
import { runMotorConstantPower, runMotorConstantVelocity } from "./commands/motor.js";

const program = new Command();

program
    .version("1.0.0")
    .option("-l --list", "List connected devices")
    .option("--led", "Start led pattern");

let motorCommand = program.command("motor");

motorCommand.command("power <channel> <power>").action(async (channel, power) => {
    console.log(`${channel} ${power}`);
    let channelNumber = Number(channel);
    let powerNumber = Number(power);
    await runMotorConstantPower(channelNumber, powerNumber);
});

motorCommand.command("velocity <channel> <speed>").action(async (channel, speed) => {
    console.log(`${channel} ${speed}`);
    let channelNumber = Number(channel);
    let speedNumber = Number(speed);
    await runMotorConstantVelocity(channelNumber, speedNumber);
});

program.parse(process.argv);

const options = program.opts();

console.log("Starting...");

if (options.list) {
    console.log("Starting to search Serial Ports");
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
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
        });
    }, 2000);
}

if (options.led) {
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    const steps = [
        new LedPatternStep(1, 0, 255, 0), //green
        new LedPatternStep(1, 255, 0, 0), //red
        new LedPatternStep(1, 0, 0, 255), //blue
        new LedPatternStep(1, 255, 0, 255), //magenta
        new LedPatternStep(1, 255, 255, 0), //yellow
    ];
    await hubs[0].sendKeepAlive();
    const pattern = createLedPattern(steps);
    await hubs[0].setModuleLedPattern(pattern);

    setInterval(async () => {
        await hubs[0].sendKeepAlive();
    }, 1000);
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if (hub.isExpansionHub()) {
        console.log(`Is open? ${hub.isOpen}`);
    }

    if (hub.isParent()) {
        for (const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
