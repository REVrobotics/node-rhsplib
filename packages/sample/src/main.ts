import { Command } from "commander";
import { distance } from "./commands/distance.js";
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

program
    .command("distance <channel>")
    .option("--continuous", "run continuously")
    .description("Read distance from a REV 2m distance sensor")
    .action(async (channel, options): Promise<void> => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        await distance(channelNumber, isContinuous);
    });

program.parse(process.argv);
