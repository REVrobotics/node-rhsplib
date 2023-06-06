import { Command } from "commander";
import { runServo } from "./command/servo.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";

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
