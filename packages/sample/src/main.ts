import { Command } from "commander";
import {
    resetEncoder,
    runEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
} from "./command/motor.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";

const program = new Command();

program.version("1.0.0");

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

program.parse(process.argv);
