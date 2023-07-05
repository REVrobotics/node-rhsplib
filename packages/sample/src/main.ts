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
import { getLed, getLedPattern, led, ledPattern } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await ledPattern(hub, steps);

        await getLedPattern(hub);
        process.on("SIGINT", () => {
            hub.close();
        });
    });

program
    .command("get-pattern")
    .description("Get LED Pattern steps")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await getLedPattern(hub);
        hub.close();
    });

program
    .command("led <r> <g> <b>")
    .description("Set LED color")
    .action(async (r, g, b) => {
        console.log("Running led color. Values are [0, 255]");
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let rValue = Number(r);
        let gValue = Number(g);
        let bValue = Number(b);
        await led(hub, rValue, gValue, bValue);

        process.on("SIGINT", () => {
            hub.close();
        });
    });

program
    .command("get-led")
    .description("Get LED color. Values are [0,255]")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await getLed(hub);

        hub.close();
    });

program
    .command("query <name>")
    .description("Query interface information")
    .action(async (name) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await queryInterface(hub, name);

        hub.close();
    });

program
    .command("bulkInput")
    .description("Get all input data at once. Specify --continuous to run continuously.")
    .option("--continuous", "run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await getBulkInputData(hub, isContinuous);
        hub.close();
    });

program
    .command("failsafe")
    .description(
        "Start servo 0 for 2 seconds, then send failsafe. Wait 2 more seconds to close. The servo should stop after 2 seconds.",
    )
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        function close() {
            hub.close();
        }

        runOnSigint(() => {
            hub.close();
        });

        await sendFailSafe(hub, close);
    });

program
    .command("version")
    .description("Get firmware version")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await firmwareVersion(hub);
        hub.close();
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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await analog(hub, portNumber, isContinuous);
        hub.close();
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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await voltageRail(hub, isContinuous);
        hub.close();
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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await batteryVoltage(hub, isContinuous);
        hub.close();
    });

batteryCommand
    .command("current")
    .option("--continuous", "Run continuously")
    .description("Read the battery current. Specify --continuous to run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await batteryCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("i2c-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the I2C sub-system current. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await i2cCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("digital-current")
    .option("--continuous", "Run continuously")
    .description("Read the digital bus current. Specify --continuous to run continuously")
    .action(async (options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            hub.close();
        });

        await digitalBusCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("servo-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the total current through all servos. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            hub.close();
        });

        await servoCurrent(hub, isContinuous);
        hub.close();
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
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(async () => {
            await hub.setServoEnable(channelValue, false);
            hub.close();
        });

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);
