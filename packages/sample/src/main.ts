import { Command } from "commander";
import { digitalRead, digitalWrite } from "./commands/digital.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import { DigitalState } from "@rev-robotics/expansion-hub";

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

let digitalCommand = program.command("digital");

digitalCommand
    .command("write <channel> <state>")
    .description("write digital pin")
    .action(async (channel, state) => {
        let channelNumber = Number(channel);
        let stateValue = state == "high" ? DigitalState.High : DigitalState.Low;

        await digitalWrite(channelNumber, stateValue);
    });

digitalCommand
    .command("read <channel>")
    .description("read digital pin")
    .action(async (channel) => {
        let channelNumber = Number(channel);
        await digitalRead(channelNumber);
    });

program.parse(process.argv);

console.log("Starting...");
