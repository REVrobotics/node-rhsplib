import { Command } from "commander";
import {
    createLedPattern,
    ExpansionHub,
    openConnectedExpansionHubs,
    LedPatternStep,
    RevHub,
} from "@rev-robotics/expansion-hub";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";

const program = new Command();

program.version("1.0.0");

program
    .command("error")
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

program.parse(process.argv);
