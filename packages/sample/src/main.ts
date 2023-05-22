import { Command } from "commander";
import {
  ExpansionHub,
  getConnectedExpansionHubs,
} from "@rev-robotics/expansion-hub";
import { RevHub } from "@rev-robotics/expansion-hub";
import {
  analog,
  battery,
  temperature,
  voltageRail,
} from "./commands/analog.js";

const program = new Command();

program
  .version("1.0.0")
  .option("-l --list", "List connected devices")
  .option("-a --analog <port>", "Read an analog port")
  .option(
    "-c --continuous",
    "Specify that sensor readings should be continuous"
  )
  .option("-b --battery", "Read the current battery voltage")
  .option("-v --volt", "Read the current 5V rail voltage")
  .option("-t --temperature", "Read the current temperature");

program
  .command("analog <port> [continuous]")
  .description(
    "Read the analog value of the given port. Specify 'true' as the " +
      "second argument to run continuously."
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
      "Specify 'true' to run continuously."
  )
  .action(async (continuous) => {
    let isContinuous = Boolean(continuous);
    await temperature(isContinuous);
  });

program
  .command("voltage [continuous]")
  .description(
    "Read the current 5V rail voltage. " + "Specify 'true' to run continuously."
  )
  .action(async (continuous) => {
    let isContinuous = Boolean(continuous);
    await voltageRail(isContinuous);
  });

program
  .command("battery [continuous]")
  .description(
    "Read the current battery Voltage. Specify 'true' to run continuously."
  )
  .action(async (continuous) => {
    let isContinuous = Boolean(continuous);
    await battery(isContinuous);
  });

program.parse(process.argv);

const options = program.opts();

console.log("Starting...");

if (options.list) {
  console.log("Starting to search Serial Ports");
  const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
  hubs.forEach(async (hub) => {
    hub.on("error", (e: any) => {
      console.log(`Got error:`);
      console.log(e);
    });
    console.log(await toString(hub));
  });

  setTimeout(() => {
    hubs.forEach(async (hub) => {
      hub.close();
    });
  }, 2000);
}

if (options.temperature) {
  let continuous = options.continuous !== undefined;
}

if (options.battery) {
  let isContinuous = options.continuous !== undefined;
}

if (options.volt) {
  let isContinuous = options.continuous !== undefined;
}

if (options.analog) {
}

async function toString(hub: RevHub): Promise<string> {
  let result = `RevHub: ${hub.moduleAddress}\n`;

  if (hub.isExpansionHub()) {
    console.log(`Is open? ${hub.isOpen}`);
  }

  if (hub.isParent()) {
    for (const child of hub.children) {
      result += `\tRevHub: ${child.moduleAddress}\n`;
    }
  }

  return result;
}
