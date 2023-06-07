import { Command } from "commander";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import {
    ExpansionHub,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { runServo } from "./command/servo.js";

const program = new Command();

program.version("1.0.0");

program
    .option("-s --serial <serial>", "serial number")
    .option("-p --parent <address>", "parent address")
    .option("-a --address <address>", "module address");

program
    .command("testErrorHandling")
    .description(
        "Intentionally causes a few errors to happen and " +
            "prints information about the errors.",
    )
    .action(async () => {
        await error();
    });

program
    .command("list")
    .description("List all connected expansion hubs")
    .action(async () => {
        let hubs = await getExpansionHubs();
        await list(hubs);
    });

program
    .command("led")
    .description("Run LED steps")
    .action(async () => {
        let hubs = await getExpansionHubs();
        await led(hubs);
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify" +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        await analog(portNumber, isContinuous);
    });

program
    .command("temperature")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        await temperature(isContinuous);
    });

program
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        await voltageRail(isContinuous);
    });

program
    .command("battery")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        await battery(isContinuous);
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;

        await runServo(channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);

async function getExpansionHubs(): Promise<ExpansionHub[]> {
    let options = program.opts();
    let serialNumber = options.serial;
    let moduleAddress = options.address ? Number(options.address) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;
    if (serialNumber) {
        let parentHub = await openParentExpansionHub(serialNumber, moduleAddress);
        if (!moduleAddress || moduleAddress == parentHub.moduleAddress) {
            return [parentHub];
        } else {
            let childHub = await parentHub.addChildByAddress(moduleAddress);
            if (childHub.isExpansionHub()) {
                return [childHub];
            }
        }
    } else if (moduleAddress) {
        //module address specified, but no serial number
        //if the user specifies a parent address, use that, else use module address as parent address.
        let parentHubAddress = parentAddress ? parentAddress : moduleAddress;
        let hub = await openHubWithAddress(parentHubAddress, moduleAddress);
        if (hub.isExpansionHub()) {
            return [hub];
        } else {
            program.error(`No expansion hub found with module address ${moduleAddress}`);
        }
    }

    return await openConnectedExpansionHubs();
}
