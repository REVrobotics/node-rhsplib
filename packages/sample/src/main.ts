import { Command } from "commander";
import {
    resetEncoder,
    runEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
} from "./command/motor.js";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import { runServo } from "./command/servo.js";

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
        await led();
    });

let motorCommand = program.command("motor");

motorCommand
    .command("encoder <channel>")
    .option("-r --reset", "reset the encoder count")
    .option("--continuous", "run continuously")
    .description("Get the current encoder position of a motor")
    .action(async (channel, options) => {
        let channelNumber = Number(channel);
        if (options.reset) {
            await resetEncoder(channelNumber);
        } else {
            let isContinuous = options.continuous !== undefined;
            await runEncoder(channelNumber, isContinuous);
        }
    });

motorCommand.command("power <channel> <power>").action(async (channel, power) => {
    console.log(`${channel} ${power}`);
    let channelNumber = Number(channel);
    let powerNumber = Number(power);
    await runMotorConstantPower(channelNumber, powerNumber);
});

motorCommand.command("velocity <channel> <speed>").action(async (channel, speed) => {
    console.log(`${channel} ${speed}`);
    let channelNumber = Number(channel);
    let speedNumber = Number(speed);
    await runMotorConstantVelocity(channelNumber, speedNumber);
});

motorCommand
    .command("position <channel> <position> <tolerance>")
    .action(async (channel, position, tolerance) => {
        console.log(`${channel} ${position} ${tolerance}`);
        let channelNumber = Number(channel);
        let positionNumber = Number(position);
        let toleranceNumber = Number(tolerance);
        await runMotorToPosition(channelNumber, positionNumber, toleranceNumber);
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
