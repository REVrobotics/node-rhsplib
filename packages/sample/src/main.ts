import { Command } from "commander";
import {
    createLedPattern,
    ExpansionHub,
    openConnectedExpansionHubs,
    LedPatternStep,
    RevHub,
} from "@rev-robotics/expansion-hub";
import { digitalRead, digitalWrite } from "./commands/digital.js";
import { DigitalState } from "@rev-robotics/expansion-hub/dist/digital-state.js";

const program = new Command();

program
    .version("1.0.0")
    .option("-l --list", "List connected devices")
    .option("--led", "Start led pattern");

let digitalCommand = program.command("digital");

digitalCommand
    .command("write <channel> <state>")
    .description("write digital pin")
    .action(async (channel, state) => {
        let channelNumber = Number(channel);
        let stateValue = state == "high" ? DigitalState.High : DigitalState.Low;

        await digitalWrite(channelNumber, stateValue);
    });

digitalCommand
    .command("read <channel>")
    .description("read digital pin")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        await digitalRead(channelNumber);
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
