import { Command } from "commander";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import {
    ExpansionHub,
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
    ParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { runServo } from "./command/servo.js";

const program = new Command();

program.version("1.0.0");

program
    .option("-s --serial <serial>", "serial number")
    .option("-p --parent <address>", "parent address")
    .option(
        "-a --address <address>",
        "module address. If this is specified, you must also specify a parent address",
    );

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
        let hubs = await openConnectedExpansionHubs();
        await list(hubs);
    });

program
    .command("led")
    .description("Run LED steps")
    .action(async () => {
        let hub = await getExpansionHubOrThrow();
        await led(hub);
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify" +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        await analog(hub, portNumber, isContinuous);
    });

program
    .command("temperature")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await temperature(hub, isContinuous);
    });

program
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await voltageRail(hub, isContinuous);
    });

program
    .command("battery")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await battery(hub, isContinuous);
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;

        let hub = await getExpansionHubOrThrow();

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);

async function getExpansionHubOrThrow(): Promise<ExpansionHub> {
    let options = program.opts();
    let serialNumber = options.serial;
    let moduleAddress = options.address ? Number(options.address) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;
    if (serialNumber) {
        let parentHub = await openParentExpansionHub(serialNumber, parentAddress);
        if (moduleAddress === undefined || moduleAddress == parentHub.moduleAddress) {
            return parentHub;
        } else {
            let childHub = await parentHub.addChildByAddress(moduleAddress);
            if (childHub.isExpansionHub()) {
                return childHub;
            }
        }
    } else if (parentAddress !== undefined) {
        //module address specified, but no serial number
        //if the user specifies a module address, use that, else use parent address as module address.
        let realModuleAddress =
            moduleAddress !== undefined ? moduleAddress : parentAddress;
        let serialNumbers = await getPossibleExpansionHubSerialNumbers();

        if (serialNumbers.length > 1) {
            //there are multiple hubs connected. We can't distinguish without a serial number
            throw new Error(
                `There are ${serialNumbers.length} parent hubs. Please specify a serialNumber`,
            );
        }

        let hub = await openHubWithAddress(
            serialNumbers[0],
            parentAddress,
            realModuleAddress,
        );

        if (hub.isExpansionHub()) {
            return hub;
        } else {
            program.error(`No expansion hub found with module address ${moduleAddress}`);
        }
    }

    let connectedHubs: ParentExpansionHub[] = await openConnectedExpansionHubs();
    if (connectedHubs.length == 0) {
        throw new Error("No hubs are connected");
    }
    if (connectedHubs.length > 1 || connectedHubs[0].children.length > 0) {
        throw new Error(
            "Multiple hubs connected. You must specify a serialNumber and/or address.",
        );
    }

    return connectedHubs[0];
}
