import { Command } from "commander";
import {
    resetEncoder,
    readEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
    setMotorPid,
    setMotorAlertLevel,
    getMotorAlertLevel_mA,
    getMotorPid,
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
import { runServo } from "./command/servo.js";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
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
    .command("led")
    .description("Run LED steps")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await led(hub);
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
    .command("version")
    .description("Get firmware version")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await firmwareVersion(hub);
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

        await setMotorPid(hub, channelNumber, pValue, iValue, dValue);
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

        await getMotorPid(hub, channelNumber);
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
