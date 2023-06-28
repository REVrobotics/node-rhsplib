import { Command } from "commander";
import {
    resetEncoder,
    readEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
    setMotorRegulatedVelocityPid,
    setMotorAlertLevel,
    getMotorAlertLevel_mA,
    getMotorRegulatedVelocityPid,
} from "./command/motor.js";
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
import { injectLog, setDebugLogLevel } from "./command/log.js";
import { firmwareVersion } from "./command/firmware-version.js";
import { getBulkInputData } from "./command/bulkinput.js";
import { DigitalState } from "@rev-robotics/rev-hub-core";
import {
    digitalRead,
    digitalReadAll,
    digitalWrite,
    digitalWriteAll,
} from "./commands/digital.js";

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

let digitalCommand = program.command("digital");

digitalCommand
    .command("write <channel> <state>")
    .description("write digital pin. Valid values for <state> are high, low, 0, and 1.")
    .action(async (channel, state) => {
        let channelNumber = Number(channel);
        let stateBoolean = false;
        if (state === "high" || state === "1") {
            stateBoolean = true;
        } else if (state === "low" || state === "0") {
            stateBoolean = false;
        } else {
            program.error("Please provide only one of {high, low, 1, 0}");
        }
        let digitalState = stateBoolean ? DigitalState.HIGH : DigitalState.LOW;

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalWrite(hub, channelNumber, digitalState);
        hub.close();
    });

digitalCommand
    .command("read <channel>")
    .option("--continuous", "run continuously")
    .description("read digital pin")
    .action(async (channel, options) => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalRead(hub, channelNumber, isContinuous);
        hub.close();
    });

digitalCommand
    .command("readall")
    .option("--continuous", "run continuously")
    .description("read all digital pins")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalReadAll(hub, isContinuous);
        hub.close();
    });

digitalCommand
    .command("writeall <bitfield> <bitmask>")
    .option("--continuous", "run continuously")
    .description(
        "Write all digital pins. Input value as a binary bitfield and a binary bitmask, where 1=output",
    )
    .action(async (bitfield, bitmask) => {
        let bitfieldValue = parseInt(bitfield, 2);
        let bitmaskValue = parseInt(bitmask, 2);

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalWriteAll(hub, bitfieldValue, bitmaskValue);
        hub.close();
    });

let motorCommand = program.command("motor");

motorCommand
    .command("current <channel>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current through a motor. Specify --continuous to run continuously",
    )
    .action(async (channel, options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        runOnSigint(() => {
            hub.close();
        });

        await motorCurrent(hub, channelNumber, isContinuous);
        hub.close();
    });

motorCommand
    .command("encoder <channel>")
    .option("-r --reset", "reset the encoder count")
    .option("--continuous", "run continuously")
    .description("Get the current encoder position of a motor")
    .action(async (channel, options) => {
        let channelNumber = Number(channel);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        if (options.reset) {
            await resetEncoder(hub, channelNumber);
        } else {
            let isContinuous = options.continuous !== undefined;
            await readEncoder(hub, channelNumber, isContinuous);
        }
        hub.close();
    });

let pidCommand = motorCommand.command("pid").description("Get or set PID coefficients");

pidCommand
    .command("set <channel> <p> <i> <d>")
    .description("Set PID coefficients for regulated velocity mode for a motor")
    .action(async (channel, p, i, d) => {
        let channelNumber = Number(channel);
        let pValue = Number(p);
        let iValue = Number(i);
        let dValue = Number(d);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await setMotorRegulatedVelocityPid(hub, channelNumber, pValue, iValue, dValue);
        hub.close();
    });

pidCommand
    .command("get <channel>")
    .description("Get PID coefficients for regulated velocity mode for a motor")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await getMotorRegulatedVelocityPid(hub, channelNumber);
        hub.close();
    });

let alertCommand = motorCommand
    .command("alert")
    .description("Get or set motor alert current (mA)");

alertCommand
    .command("get <channel>")
    .description("Get motor alert current (mA)")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        let current = await getMotorAlertLevel_mA(hub, channelNumber);

        console.log(`Motor alert for channel ${channelNumber} is ${current} mA`);
        hub.close();
    });

alertCommand
    .command("set <channel> <current>")
    .description("Set motor alert current (mA)")
    .action(async (channel, current) => {
        let channelNumber = Number(channel);
        let currentValue = Number(current);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await setMotorAlertLevel(hub, channelNumber, currentValue);
        hub.close();
    });

motorCommand
    .command("power <channel> <power>")
    .description(
        "Tell a motor to run at a given pwm duty cycle. Power is in the range [-1.0, 1.0]",
    )
    .action(async (channel, power) => {
        let channelNumber = Number(channel);
        let powerNumber = Number(power);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            hub.close();
        });

        await runMotorConstantPower(hub, channelNumber, powerNumber);
    });

motorCommand
    .command("velocity <channel> <speed>")
    .description("Tell a motor to run at a given speed")
    .action(async (channel, speed) => {
        let channelNumber = Number(channel);
        let speedNumber = Number(speed);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            hub.close();
        });

        await runMotorConstantVelocity(hub, channelNumber, speedNumber);
    });

motorCommand
    .command("position <channel> <velocity> <position> <tolerance>")
    .description("Tell a motor to run to a given position")
    .action(async (channel, velocity, position, tolerance) => {
        let channelNumber = Number(channel);
        let positionNumber = Number(position);
        let toleranceNumber = Number(tolerance);
        let velocityNumber = Number(velocity);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            hub.close();
        });

        await runMotorToPosition(
            hub,
            channelNumber,
            velocityNumber,
            positionNumber,
            toleranceNumber,
        );
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
    .command("log <text>")
    .description("Inject a log hint")
    .action(async (text) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await injectLog(hub, text);
        hub.close();
    });

program
    .command("loglevel <group> <level>")
    .description(
        "Set log level. Valid values for group are: Main, " +
            "TransmitterToHost, ReceiverFromHost, ADC, PWMAndServo, ModuleLED, " +
            "DigitalIO, I2C, Motor0, Motor1, Motor2, or Motor3. Valid values for level are [0,3]",
    )
    .action(async (group, level) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        let levelNumber = Number(level);
        await setDebugLogLevel(hub, group, levelNumber);
        hub.close();
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
    if (moduleAddress !== undefined && (moduleAddress < 1 || moduleAddress > 255)) {
        throw new Error(`${moduleAddress} is not a valid module address`);
    } else if (
        parentAddress !== undefined &&
        (parentAddress < 1 || parentAddress > 255)
    ) {
        throw new Error(`${parentAddress} is not a valid parent address`);
    }

    if (moduleAddress !== undefined && parentAddress === undefined) {
        throw new Error("A module address cannot be specified without a parent address.");
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

    // The user did not specify a specific Hub to open. Open all of them.

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
                childHub.close();
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
    } else {
        let realModuleAddress =
            moduleAddress !== undefined ? moduleAddress : parentAddress;
        hub = await parent.addChildByAddress(realModuleAddress);
    }

    if (hub.isExpansionHub()) {
        let closeHub = () => {
            parent.close();
        };
        return [hub, closeHub];
    } else {
        throw new Error(`No expansion hub found with module address ${moduleAddress}`);
    }
}
