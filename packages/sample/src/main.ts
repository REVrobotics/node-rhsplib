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
import { getLed, getLedPattern, led, ledPattern } from "./command/led.js";
import { runServo } from "./command/servo.js";
import {
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { firmwareVersion } from "./command/firmware-version.js";
import { getBulkInputData } from "./command/bulkinput.js";
import { injectLog, setDebugLogLevel } from "./command/log.js";
import { sendFailSafe } from "./command/failsafe.js";
import { queryInterface } from "./command/query.js";
import { setHubAddress } from "./command/set-hub-address.js";
import {
    ControlHub,
    DigitalState,
    ExpansionHub,
    ParentExpansionHub,
} from "@rev-robotics/rev-hub-core";
import { openUsbControlHubsAndChildren } from "./open-usb-control-hub.js";
import { status } from "./command/status.js";
import {
    digitalRead,
    digitalReadAll,
    digitalWrite,
    digitalWriteAll,
} from "./command/digital.js";
import {
    getMotorAlertLevel_mA,
    resetEncoder,
    runEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
    setMotorAlertLevel,
    setMotorPid,
} from "./command/motor.js";
import { distance } from "./command/distance.js";
import { openUsbControlHubs } from "./adb-setup.js";

function runOnSigint(block: () => void) {
    process.on("SIGINT", () => {
        block();
        process.exit();
    });
}

const program = new Command();

program.name("ch");

program.version("1.0.0");

program
    // .option("--control", "specify that you are connecting via control hub")
    // .option("-s --serial <serial>", "serial number")
    // .option("-p --parent <address>", "parent address")
    .option("-a --address <address>", "address of Expansion Hub connected via RS-485");

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
        await list();
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
        await ledPattern(hub, steps);

        await getLedPattern(hub);
        process.on("SIGINT", () => {
            close();
        });
    });

program
    .command("get-pattern")
    .description("Get LED Pattern steps")
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();

        await getLedPattern(hub);
        close();
    });

program
    .command("led <r> <g> <b>")
    .description("Set LED color")
    .action(async (r, g, b) => {
        console.log("Running led color. Values are [0, 255]");
        let [hub, close] = await getExpansionHubOrThrow();
        let rValue = Number(r);
        let gValue = Number(g);
        let bValue = Number(b);
        await led(hub, rValue, gValue, bValue);

        process.on("SIGINT", () => {
            close();
        });
    });

program
    .command("get-led")
    .description("Get LED color. Values are [0,255]")
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();
        await getLed(hub);

        close();
    });

program
    .command("bulkInput")
    .description("Get all input data at once. Specify --continuous to run continuously.")
    .option("--continuous", "run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let [hub, close] = await getExpansionHubOrThrow();
        await getBulkInputData(hub, isContinuous);
        close();
    });

program
    .command("log <text>")
    .description("Inject a log hint")
    .action(async (text) => {
        let [hub, close] = await getExpansionHubOrThrow();
        await injectLog(hub, text);
        close();
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
        let levelNumber = Number(level);
        await setDebugLogLevel(hub, group, levelNumber);
        close();
    });

program
    .command("failsafe")
    .description(
        "Start servo 0 for 2 seconds, then send failsafe. Wait 2 more seconds to close. The servo should stop after 2 seconds.",
    )
    .action(async () => {
        let [hub, close] = await getExpansionHubOrThrow();
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

program
    .command("query <name>")
    .description("Query interface information")
    .action(async (name) => {
        let [hub, close] = await getExpansionHubOrThrow();
        await queryInterface(hub, name);
        close();
    });

program
    .command("set-address <address>")
    .description("Set Module Address")
    .action(async (address) => {
        let addressNumber = Number(address);
        let [hub, close] = await getExpansionHubOrThrow();
        await setHubAddress(hub as ControlHub, addressNumber);
        close();
    });

program.command("status").action(async () => {
    let hubs = await openUsbControlHubsAndChildren();
    let allHubs = hubs.flatMap((hub) => [hub, ...hub.children]);
    for (let hub of allHubs) {
        await status(hub as ControlHub);
    }

    process.on("SIGINT", () => {
        for (let hub of hubs) {
            hub.close();
        }
        process.exit();
    });
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
        let digitalState = stateBoolean ? DigitalState.High : DigitalState.Low;
        let [hub, close] = await getExpansionHubOrThrow();

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
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
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
        if (options.reset) {
            await resetEncoder(hub, channelNumber);
            close();
        } else {
            let isContinuous = options.continuous !== undefined;
            await runEncoder(hub, channelNumber, isContinuous);
            close();
        }
    });

motorCommand
    .command("power <channel> <power>")
    .description(
        "Tell a motor to run at a given pwm duty cycle. Power is in the range [-1.0, 1.0]",
    )
    .action(async (channel, power) => {
        console.log(`${channel} ${power}`);
        let channelNumber = Number(channel);
        let powerNumber = Number(power);
        let [hub, close] = await getExpansionHubOrThrow();
        await runMotorConstantPower(hub, channelNumber, powerNumber);

        process.on("SIGINT", () => {
            close();
            process.exit();
        });
    });

motorCommand
    .command("pid <channel> <p> <i> <d>")
    .description("Set PID coefficients for a motor")
    .action(async (channel, p, i, d) => {
        let channelNumber = Number(channel);
        let pValue = Number(p);
        let iValue = Number(i);
        let dValue = Number(d);
        let [hub, close] = await getExpansionHubOrThrow();

        await setMotorPid(hub, channelNumber, pValue, iValue, dValue);
        close();
    });

motorCommand
    .command("velocity <channel> <speed>")
    .description("Tell a motor to run at a given speed")
    .action(async (channel, speed) => {
        console.log(`${channel} ${speed}`);
        let channelNumber = Number(channel);
        let speedNumber = Number(speed);
        let [hub, close] = await getExpansionHubOrThrow();
        await runMotorConstantVelocity(hub, channelNumber, speedNumber);
        process.on("SIGINT", () => {
            close();
            process.exit();
        });
    });

motorCommand
    .command("position <channel> <velocity> <position> <tolerance>")
    .description("Tell a motor to run to a given position")
    .action(async (channel, velocity, position, tolerance) => {
        console.log(`${channel} ${position} ${tolerance}`);
        let channelNumber = Number(channel);
        let positionNumber = Number(position);
        let toleranceNumber = Number(tolerance);
        let velocityNumber = Number(velocity);
        let [hub, close] = await getExpansionHubOrThrow();
        await runMotorToPosition(
            hub,
            channelNumber,
            velocityNumber,
            positionNumber,
            toleranceNumber,
        );
        process.on("SIGINT", () => {
            hub.setMotorChannelEnable(channelNumber, false);
            close();
            process.exit();
        });
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
        await setMotorAlertLevel(hub, channelNumber, currentValue);
        close();
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify " +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);

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
        close();
    });

program
    .command("5vRailVoltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

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
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            close();
        });

        await batteryVoltage(hub, isContinuous);
        close();
    });

batteryCommand
    .command("current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery current (mA). Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

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
        let [hub, close] = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;

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
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let [hub, close] = await getExpansionHubOrThrow();

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);

        runOnSigint(() => {
            close();
        });
    });

program
    .command("distance <channel>")
    .option("--continuous", "run continuously")
    .description("Read distance from a REV 2m distance sensor")
    .action(async (channel, options): Promise<void> => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        let [hub, close] = await getExpansionHubOrThrow();
        await distance(hub, channelNumber, isContinuous);

        runOnSigint(() => {
            close();
        });
    });

program.parse(process.argv);

async function getExpansionHubOrThrow(): Promise<
    [hub: ExpansionHub, onClose: () => void]
> {
    let options = program.opts();
    let serialNumber = options.serial;
    let isControlHub = true;
    let moduleAddress = options.address ? Number(options.address) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;

    if (isControlHub) {
        let controlHubs = await openUsbControlHubs();
        let controlHub = controlHubs[0];
        let onClose = () => {
            controlHub.close();
        };

        if (serialNumber) {
            if (moduleAddress === undefined) {
                moduleAddress = parentAddress;
            }
            let parent = await controlHub.addHubBySerialNumberAndAddress(
                serialNumber,
                parentAddress!,
            );
            if (parentAddress === moduleAddress) {
                return [parent, onClose];
            }
            if (parent.isParent()) {
                return [
                    (await parent.addChildByAddress(moduleAddress!)) as ExpansionHub,
                    onClose,
                ];
            } else {
                throw new Error();
            }
        } else {
            if (moduleAddress !== undefined) {
                return [
                    (await controlHub.addChildByAddress(moduleAddress!)) as ExpansionHub,
                    onClose,
                ];
            } else {
                return [controlHub, onClose];
            }
        }
    } else {
        if (serialNumber) {
            let parentHub = await openParentExpansionHub(serialNumber, parentAddress);
            let onClose = () => {
                parentHub.close();
            };
            if (moduleAddress === undefined || moduleAddress == parentHub.moduleAddress) {
                return [parentHub, onClose];
            } else {
                let childHub = await parentHub.addChildByAddress(moduleAddress);
                if (childHub.isExpansionHub()) {
                    return [childHub, onClose];
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

            const hub = await openHubWithAddress(
                serialNumbers[0],
                parentAddress,
                realModuleAddress,
            );

            if (hub.isExpansionHub()) {
                return [
                    hub,
                    () => {
                        hub.close();
                    },
                ];
            } else {
                program.error(
                    `No expansion hub found with module address ${moduleAddress}`,
                );
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

        return [
            connectedHubs[0],
            () => {
                connectedHubs[0].close();
            },
        ];
    }
}
