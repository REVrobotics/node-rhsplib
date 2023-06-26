import { Command } from "commander";
import {
    resetEncoder,
    readEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
    setMotorPid,
} from "./command/motor.js";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

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
        runOnSigint(() => {
            hub.close();
        });

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await led(hub);
    });

let motorCommand = program.command("motor");

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

motorCommand
    .command("pid <channel> <p> <i> <d>")
    .description("Set PID coefficients for a motor")
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
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
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
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await temperature(hub, isContinuous);
    });

program
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await voltageRail(hub, isContinuous);
        hub.close();
    });

program
    .command("battery")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await battery(hub, isContinuous);
        hub.close();
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        runOnSigint(async () => {
            await hub.setServoEnable(channelValue, false);
            hub.close();
        });

        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);
