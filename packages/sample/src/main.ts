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
import { firmwareVersion } from "./command/firmware-version.js";
import { getBulkInputData } from "./command/bulkinput.js";
import { DigitalState } from "@rev-robotics/rev-hub-core";
import {
    digitalRead,
    digitalReadAll,
    digitalWrite,
    digitalWriteAll,
} from "./commands/digital.js";

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
    .command("bulkInput")
    .description("Get all input data at once. Specify --continuous to run continuously.")
    .option("--continuous", "run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await getBulkInputData(hub, isContinuous);
        hub.close();
    });

program
    .command("version")
    .description("Get firmware version")
    .action(async () => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await firmwareVersion(hub);
        hub.close();
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
        let digitalState = stateBoolean ? DigitalState.HIGH : DigitalState.LOW;

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalWrite(hub, channelNumber, digitalState);
        hub.close();
    });

digitalCommand
    .command("read <channel>")
    .option("--continuous", "run continuously")
    .description("read digital pin")
    .action(async (channel, options) => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalRead(hub, channelNumber, isContinuous);
        hub.close();
    });

digitalCommand
    .command("readall")
    .option("--continuous", "run continuously")
    .description("read all digital pins")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalReadAll(hub, isContinuous);
        hub.close();
    });

digitalCommand
    .command("writeall <bitfield> <bitmask>")
    .option("--continuous", "run continuously")
    .description(
        "Write all digital pins. Input value as a binary bitfield and a binary bitmask, where 1=output",
    )
    .action(async (bitfield, bitmask) => {
        let bitfieldValue = parseInt(bitfield, 2);
        let bitmaskValue = parseInt(bitmask, 2);

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await digitalWriteAll(hub, bitfieldValue, bitmaskValue);
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
        "Read the current battery voltage. Specify --continuous to run continuously",
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
