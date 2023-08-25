#!/usr/bin/env node

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
    setMotorRegulatedVelocityPidf,
    getMotorRegulatedVelocityPidf,
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
import {
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { getLed, getLedPattern, led, ledPattern } from "./command/led.js";
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
} from "./command/digital.js";
import { distance } from "./command/distance.js";
import { sendFailSafe } from "./command/failsafe.js";
import { queryInterface } from "./command/query.js";

function runOnSigint(block: () => void) {
    process.on("SIGINT", () => {
        block();
        process.exit();
    });
}

const program = new Command();

program.version("1.0.0");

// TODO: Use commander preAction hook
// TODO: Use @commander-js/extra-typings

program
    .option(
        "-s --serial <serial>",
        "serial number of the parent Control Hub or Expansion Hub",
    )
    .option(
        "-p --parent <address>",
        "address of the parent Expansion Hub (ignored when the parent is a Control Hub)",
    )
    .option(
        "-c --child <address>",
        "communicate with the specified child Expansion Hub instead of its parent; requires parent address to be specified when the parent is an Expansion Hub",
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
    .command("pattern <steps...>")
    .description(
        "Run LED pattern. Provide steps as a space-separated list in the " +
            "format <time><colorHexString>, where time is in seconds, and " +
            "colorHexString is a hex color code. Example: 100FF00 for 1 second " +
            "green, 0.5FF0000 for half-second red.",
    )
    .action(async (steps) => {
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });
        await ledPattern(hub, steps);

        await getLedPattern(hub);
    });

program
    .command("get-pattern")
    .description("Get LED Pattern steps")
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();
        runOnSigint(() => {
            close();
        });

        await getLedPattern(hub);
        close();
    });

program
    .command("led <r> <g> <b>")
    .description("Set LED color")
    .action(async (r, g, b) => {
        let [hub, close] = await getExpansionHubOrThrow();
        runOnSigint(() => {
            close();
        });

        let rValue = Number(r);
        let gValue = Number(g);
        let bValue = Number(b);
        await led(hub, rValue, gValue, bValue);
    });

program
    .command("get-led")
    .description("Get LED color. Values are [0,255]")
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });
        await getLed(hub);

        hub.close();
    });

program
    .command("query <name>")
    .description("Query interface information")
    .action(async (name) => {
        let [hub, close] = await getExpansionHubOrThrow();
        await queryInterface(hub, name);

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
    .command("failsafe")
    .description(
        "Start servo 0 for 2 seconds, then send failsafe. Wait 2 more seconds to close. The servo should stop after 2 seconds.",
    )
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await sendFailSafe(hub, close);
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

        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await digitalWrite(hub, channelNumber, digitalState);
        close();
    });

digitalCommand
    .command("read <channel>")
    .option("--continuous", "run continuously")
    .description("read digital pin")
    .action(async (channel, options) => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await digitalRead(hub, channelNumber, isContinuous);
        close();
    });

digitalCommand
    .command("readall")
    .option("--continuous", "run continuously")
    .description("read all digital pins")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;

        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await digitalReadAll(hub, isContinuous);
        close();
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

        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await digitalWriteAll(hub, bitfieldValue, bitmaskValue);
        close();
    });

let motorCommand = program.command("motor");

motorCommand
    .command("current <channel>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current through a motor. Specify --continuous to run continuously",
    )
    .action(async (channel, options) => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await motorCurrent(hub, channelNumber, isContinuous);
        close();
    });

motorCommand
    .command("encoder <channel>")
    .option("-r --reset", "reset the encoder count")
    .option("--continuous", "run continuously")
    .description("Get the current encoder position of a motor")
    .action(async (channel, options) => {
        let channelNumber = Number(channel);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        if (options.reset) {
            await resetEncoder(hub, channelNumber);
        } else {
            let isContinuous = options.continuous !== undefined;
            await readEncoder(hub, channelNumber, isContinuous);
        }
        close();
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await setMotorRegulatedVelocityPid(hub, channelNumber, pValue, iValue, dValue);
        close();
    });

pidCommand
    .command("get <channel>")
    .description("Get PID coefficients for regulated velocity mode for a motor")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await getMotorRegulatedVelocityPidf(hub, channelNumber);
        hub.close();
    });

let pidfCommand = motorCommand
    .command("pidf")
    .description("Get or set PIDF coefficients");

pidfCommand
    .command("set <channel> <p> <i> <d> <f>")
    .description("Set PIDF coefficients for regulated velocity mode for a motor")
    .action(async (channel, p, i, d, f) => {
        let channelNumber = Number(channel);
        let pValue = Number(p);
        let iValue = Number(i);
        let dValue = Number(d);
        let fValue = Number(f);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await setMotorRegulatedVelocityPidf(
            hub,
            channelNumber,
            pValue,
            iValue,
            dValue,
            fValue,
        );
        hub.close();
    });

pidfCommand
    .command("get <channel>")
    .description("Get PIDF coefficients for regulated velocity mode for a motor")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await getMotorRegulatedVelocityPidf(hub, channelNumber);
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        let current = await getMotorAlertLevel_mA(hub, channelNumber);

        console.log(`Motor alert for channel ${channelNumber} is ${current} mA`);
        close();
    });

alertCommand
    .command("set <channel> <current>")
    .description("Set motor alert current (mA)")
    .action(async (channel, current) => {
        let channelNumber = Number(channel);
        let currentValue = Number(current);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
        });

        await setMotorAlertLevel(hub, channelNumber, currentValue);
        close();
    });

motorCommand
    .command("power <channel> <power>")
    .description(
        "Tell a motor to run at a given pwm duty cycle. Power is in the range [-1.0, 1.0]",
    )
    .action(async (channel, power) => {
        let channelNumber = Number(channel);
        let powerNumber = Number(power);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            close();
        });

        await runMotorConstantPower(hub, channelNumber, powerNumber);
    });

motorCommand
    .command("velocity <channel> <speed>")
    .description("Tell a motor to run at a given speed")
    .action(async (channel, speed) => {
        let channelNumber = Number(channel);
        let speedNumber = Number(speed);
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            close();
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            hub.setMotorChannelEnable(channelNumber, false);
            close();
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
    .command("distance <channel>")
    .option("--continuous", "run continuously")
    .description("Read distance from a REV 2m distance sensor")
    .action(async (channel, options): Promise<void> => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await distance(hub, channelNumber, isContinuous);
        hub.close();
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
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
        let [hub, close] = await getExpansionHubOrThrow();

        runOnSigint(() => {
            close();
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

try {
    await program.parseAsync(process.argv);
} catch (e) {
    console.error("Encountered unexpected error:");
    console.error(e);
}

/**
 * Returns the expansion hub referred to by the options provided to the program.
 * This method also returns a close method. Other hubs may need to be opened, so
 * prefer calling the returned close method over closing the hub directly.
 */
async function getExpansionHubOrThrow(): Promise<[hub: ExpansionHub, close: () => void]> {
    let options = program.opts();
    let serialNumber = options.serial;
    // options.child and options.parent are strings, so a specified address of "0" will be treated as truthy, and will not be ignored.
    let childAddress = options.child ? Number(options.child) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;
    if (childAddress !== undefined && (childAddress < 1 || childAddress > 255)) {
        throw new Error(`${childAddress} is not a valid child address`);
    } else if (
        parentAddress !== undefined &&
        (parentAddress < 1 || parentAddress > 255)
    ) {
        throw new Error(`${parentAddress} is not a valid parent address`);
    }

    if (childAddress !== undefined && parentAddress === undefined) {
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
            childAddress,
        );
    } else if (parentAddress !== undefined) {
        return openExpansionHubWithAddress(parentAddress, childAddress);
    }

    let connectedHubs: ParentExpansionHub[] = await openConnectedExpansionHubs();
    if (connectedHubs.length == 0) {
        throw new Error("No hubs are connected");
    }
    if (connectedHubs.length > 1) {
        throw new Error("Multiple hubs connected. You must specify a serialNumber.");
    }

    // Open the only Hub that is connected

    let closeHubs = () => {
        for (let hub of connectedHubs) {
            hub.close();
        }
    };
    return [connectedHubs[0], closeHubs];
}

/**
 * Open a REV hub through a parent REV hub with the given serial number and address.
 * If a child address is provided, the specified child will be returned instead of the parent.
 * Also returns a close method that will close the module and its parent.
 * @param serialNumber
 * @param parentAddress
 * @param childAddress
 */
async function openExpansionHubWithSerialNumber(
    serialNumber: string,
    parentAddress: number,
    childAddress: number | undefined,
): Promise<[hub: ExpansionHub, close: () => void]> {
    let parentHub = await openParentExpansionHub(serialNumber, parentAddress);
    if (childAddress === undefined || childAddress == parentHub.moduleAddress) {
        return [
            parentHub,
            () => {
                parentHub.close();
            },
        ];
    } else {
        let childHub = await parentHub.addChildByAddress(childAddress);
        if (childHub.isExpansionHub()) {
            let closeChild = () => {
                parentHub.close();
                childHub.close();
            };
            return [childHub, closeChild];
        } else {
            throw new Error(
                `Hub (${serialNumber}) ${childAddress} is not an Expansion hub`,
            );
        }
    }
}

/**
 * Open a REV hub through a parent REV hub with the given address.
 * If the child address is provided, the specified child will be returned instead of the parent.
 * Also returns a close method that will close the module and its parent.
 *
 * @param parentAddress
 * @param childAddress
 */
async function openExpansionHubWithAddress(
    parentAddress: number,
    childAddress: number | undefined,
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

    if (parentAddress == childAddress || childAddress == undefined) {
        hub = parent;
    } else {
        hub = await parent.addChildByAddress(childAddress);
    }

    if (hub.isExpansionHub()) {
        let closeHub = () => {
            parent.close();
        };
        return [hub, closeHub];
    } else {
        throw new Error(`No expansion hub found with module address ${childAddress}`);
    }
}
