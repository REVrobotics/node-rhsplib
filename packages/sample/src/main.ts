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

        await digitalWrite(channelNumber, digitalState);
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
