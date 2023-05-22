import { Command } from "commander";
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

program.parse(process.argv);
