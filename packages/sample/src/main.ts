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
    .command("analog <port> [continuous]")
    .description(
        "Read the analog value of the given port. Specify 'true' as the " +
            "second argument to run continuously.",
    )
    .action(async (port, continuous) => {
        let isContinuous = Boolean(continuous);
        let portNumber = Number(port);
        await analog(portNumber, isContinuous);
    });

program
    .command("temperature [continuous]")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify 'true' to run continuously.",
    )
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await temperature(isContinuous);
    });

program
    .command("voltage [continuous]")
    .description(
        "Read the current 5V rail voltage. " + "Specify 'true' to run continuously.",
    )
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await voltageRail(isContinuous);
    });

program
    .command("battery [continuous]")
    .description("Read the current battery Voltage. Specify 'true' to run continuously.")
    .action(async (continuous) => {
        let isContinuous = Boolean(continuous);
        await battery(isContinuous);
    });

program.parse(process.argv);
