import { Command } from "commander";
import {
    createLedPattern,
    ExpansionHub,
    LedPatternStep,
    openConnectedExpansionHubs,
} from "@rev-robotics/expansion-hub";
import { RevHub } from "@rev-robotics/expansion-hub";
import { analog, battery, temperature, voltageRail } from "./commands/analog.js";

const program = new Command();

program
    .version("1.0.0")
    .option("-l --list", "List connected devices")
    .option("--led", "Start led pattern");

program
    .command("analog <port> [continuous]")
    .description(
        "Read the analog value of the given port. Specify 'true' as the " +
            "second argument to run continuously.",
    )
    .action(async (port, continuous) => {
        let isContinuous = Boolean(continuous);
        let portNumber = Number(port);
        await analog(portNumber, isContinuous);
    });

program
    .command("temperature [continuous]")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify 'true' to run continuously.",
    )
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await temperature(isContinuous);
    });

program
    .command("voltage [continuous]")
    .description(
        "Read the current 5V rail voltage. " + "Specify 'true' to run continuously.",
    )
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await voltageRail(isContinuous);
    });

program
    .command("battery [continuous]")
    .description("Read the current battery Voltage. Specify 'true' to run continuously.")
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await battery(isContinuous);
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
}

if (options.temperature) {
    let continuous = options.continuous !== undefined;
}

if (options.battery) {
    let isContinuous = options.continuous !== undefined;
}

if (options.volt) {
    let isContinuous = options.continuous !== undefined;
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
