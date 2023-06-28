import { Command } from "commander";
import {
    analog,
    batteryCurrent,
    batteryVoltage,
    digitalBusCurrent,
    i2cCurrent,
    motorCurrent,
    servoCurrent,
    temperature,
    voltageRail,
} from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import {
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { runServo } from "./command/servo.js";
import { ExpansionHub, ParentExpansionHub, RevHub } from "@rev-robotics/rev-hub-core";
import { firmwareVersion } from "./command/firmware-version.js";
import { getBulkInputData } from "./command/bulkinput.js";

function runOnSigint(block: () => void) {
    process.on("SIGINT", () => {
        block();
        process.exit();
    });
}

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
        let [hub, close] = await getExpansionHubOrThrow();
        runOnSigint(() => {
            close();
        });

        await led(hub);
    });

let motorCommand = program.command("motor");

motorCommand
    .command("current <channel>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current through a motor. Specify --continuous to run continuously",
    )
    .action(async (channel, options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        runOnSigint(() => {
            close();
        });

        await motorCurrent(hub, channelNumber, isContinuous);
        close();
    });

program
    .command("bulkInput")
    .description("Get all input data at once. Specify --continuous to run continuously.")
    .option("--continuous", "run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await getBulkInputData(hub, isContinuous);
        close();
    });

program
    .command("version")
    .description("Get firmware version")
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();

        await firmwareVersion(hub);
        close();
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await analog(hub, portNumber, isContinuous);
        close();
    });

program
    .command("temperature")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            close();
        });

        await temperature(hub, isContinuous);
    });

program
    .command("5vRailVoltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();
        runOnSigint(() => {
            close();
        });

        await voltageRail(hub, isContinuous);
        close();
    });

let batteryCommand = program
    .command("battery")
    .description("Get information about the battery");

batteryCommand
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await batteryVoltage(hub, isContinuous);
        close();
    });

batteryCommand
    .command("current")
    .option("--continuous", "Run continuously")
    .description("Read the battery current. Specify --continuous to run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await batteryCurrent(hub, isContinuous);
        close();
    });

program
    .command("i2c-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the I2C sub-system current. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await i2cCurrent(hub, isContinuous);
        close();
    });

program
    .command("digital-current")
    .option("--continuous", "Run continuously")
    .description("Read the digital bus current. Specify --continuous to run continuously")
    .action(async (options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            close();
        });

        await digitalBusCurrent(hub, isContinuous);
        close();
    });

program
    .command("servo-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the total current through all servos. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            close();
        });

        await servoCurrent(hub, isContinuous);
        close();
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        runOnSigint(async () => {
            await hub.setServoEnable(channelValue, false);
            close();
        });

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);

/**
 * Returns the expansion hub referred to by the options provided to the program.
 * This method also returns a close method. Other hubs may need to be opened, so
 * prefer calling the returned close method over closing the hub directly.
 */
async function getExpansionHubOrThrow(): Promise<[hub: ExpansionHub, close: () => void]> {
    let options = program.opts();
    let serialNumber = options.serial;
    // options.address is a string, so a specified address of "0" will be treated as truthy, and will not be ignored.
    let moduleAddress = options.address ? Number(options.address) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;
    if (moduleAddress === 0) {
        throw new Error("0 is not a valid module address");
    } else if (parentAddress === 0) {
        throw new Error("0 is not a valid parent address");
    }
    if (serialNumber !== undefined) {
        if (parentAddress === undefined) {
            throw new Error(
                "parent address must be specified if serial number is specified.",
            );
        }
        return openExpansionHubWithSerialNumber(
            serialNumber,
            parentAddress,
            moduleAddress,
        );
    } else if (parentAddress !== undefined) {
        return openExpansionHubWithAddress(parentAddress, moduleAddress);
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

    let closeHubs = () => {
        for (let hub of connectedHubs) {
            hub.close();
        }
    };
    return [connectedHubs[0], closeHubs];
}

/**
 * Open an Expansion hub, specifying a serial number and parent address. Module address
 * is optional, and will default to parent address if not provided. Also returns a close method that will
 * close the module and its parent.
 * @param serialNumber
 * @param parentAddress
 * @param moduleAddress
 */
async function openExpansionHubWithSerialNumber(
    serialNumber: string,
    parentAddress: number,
    moduleAddress: number | undefined,
): Promise<[hub: ExpansionHub, close: () => void]> {
    let parentHub = await openParentExpansionHub(serialNumber, parentAddress);
    if (moduleAddress === undefined || moduleAddress == parentHub.moduleAddress) {
        return [
            parentHub,
            () => {
                parentHub.close();
            },
        ];
    } else {
        let childHub = await parentHub.addChildByAddress(moduleAddress);
        if (childHub.isExpansionHub()) {
            let closeChild = () => {
                parentHub.close();
                if (childHub.isExpansionHub()) {
                    childHub.close();
                }
            };
            return [childHub, closeChild];
        } else {
            throw new Error(
                `Hub (${serialNumber}) ${moduleAddress} is not an Expansion hub`,
            );
        }
    }
}

/**
 * Find a connected hub with the given parent and address.
 * If the module address is undefined, we use the parent address
 * as the module address. Also returns a close method that will
 * close the module and its parent.
 *
 * @param parentAddress
 * @param moduleAddress
 */
async function openExpansionHubWithAddress(
    parentAddress: number,
    moduleAddress: number | undefined,
): Promise<[hub: ExpansionHub, close: () => void]> {
    //parent address specified, but no serial number
    //if the user specifies a module address, use that, else use parent address as module address.
    let realModuleAddress = moduleAddress !== undefined ? moduleAddress : parentAddress;
    let serialNumbers = await getPossibleExpansionHubSerialNumbers();

    if (serialNumbers.length > 1) {
        //there are multiple hubs connected. We can't distinguish without a serial number
        throw new Error(
            `There are ${serialNumbers.length} parent hubs. Please specify a serialNumber`,
        );
    }

    let parent = await openParentExpansionHub(serialNumbers[0], parentAddress);
    let hub: RevHub;

    if (parentAddress == moduleAddress) {
        hub = parent;
    }

    hub = await parent.addChildByAddress(realModuleAddress);

    if (hub.isExpansionHub()) {
        let closeHub = () => {
            if (parent.isExpansionHub()) {
                parent.close();
            }
            if (hub.isExpansionHub()) {
                hub.close();
            }
        };
        return [hub, closeHub];
    } else {
        program.error(`No expansion hub found with module address ${moduleAddress}`);
        throw new Error("unreachable"); //TS 5.0.4 isn't recognizing the 'never' type on program.error.
    }
}
