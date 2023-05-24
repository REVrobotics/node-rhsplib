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
    .description("Read distance from a REV 2m distance sensor")
    .action(async (channel): Promise<void> => {
        let channelNumber = Number(channel);
        await distance(channelNumber);
    });

program.parse(process.argv);
