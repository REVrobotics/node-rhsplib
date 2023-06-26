import { Command } from "commander";
import {
    analog,
    batteryCurrent,
    batteryVoltage,
    digitalBusCurrent,
    i2cCurrent,
    motorCurrent,
    servoCurrent,
    temperature,
    voltageRail,
} from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

function runOnSigint(block: () => void) {
    process.on("SIGINT", () => {
        block();
        process.exit();
    });
}

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
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await led(hub);
    });

let motorCommand = program.command("motor");

motorCommand
    .command("current <channel>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current through a motor. Specify --continuous to run continuously",
    )
    .action(async (channel, options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        runOnSigint(() => {
            hub.close();
        });

        await motorCurrent(hub, channelNumber, isContinuous);
        hub.close();
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify" +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await analog(hub, portNumber, isContinuous);
        hub.close();
    });

program
    .command("temperature")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await temperature(hub, isContinuous);
    });

program
    .command("5vRailVoltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await voltageRail(hub, isContinuous);
        hub.close();
    });

let batteryCommand = program
    .command("battery")
    .description("Get information about the battery");

batteryCommand
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await batteryVoltage(hub, isContinuous);
        hub.close();
    });

batteryCommand
    .command("current")
    .option("--continuous", "Run continuously")
    .description("Read the battery current. Specify --continuous to run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await batteryCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("i2c-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the I2C sub-system current. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await i2cCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("digital-current")
    .option("--continuous", "Run continuously")
    .description("Read the digital bus current. Specify --continuous to run continuously")
    .action(async (options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            hub.close();
        });

        await digitalBusCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("servo-current")
    .option("--continuous", "Run continuously")
    .description(
        "Read the total current through all servos. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        let isContinuous = options.continuous !== undefined;

        runOnSigint(() => {
            hub.close();
        });

        await servoCurrent(hub, isContinuous);
        hub.close();
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(async () => {
            await hub.setServoEnable(channelValue, false);
            hub.close();
        });

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);
