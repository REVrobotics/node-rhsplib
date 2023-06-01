import { Command } from "commander";
import { analog, battery, temperature, voltageRail } from "./commands/analog.js";
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
    .option("--continuous", "Run continuously")
    .command("analog <port>")
    .description(
        "Read the analog value of the given port. Specify" +
            "--continuous to run continuously.",
    )
    .action(async (port) => {
        let options = program.opts();
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        await analog(portNumber, isContinuous);
    });

program
    .option("--continuous", "Run continuously")
    .command("temperature")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async () => {
        let options = program.opts();
        let isContinuous = options.continuous !== undefined;
        await temperature(isContinuous);
    });

program
    .option("--continuous", "Run continuously")
    .command("voltage")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async () => {
        let options = program.opts();
        let isContinuous = options.continuous !== undefined;
        await voltageRail(isContinuous);
    });

program
    .option("--continuous", "Run continuously")
    .command("battery")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async () => {
        let options = program.opts();
        let isContinuous = options.continuous !== undefined;
        await battery(isContinuous);
    });

program.parse(process.argv);
