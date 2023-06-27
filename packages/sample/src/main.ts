import { Command } from "commander";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { injectLog, setDebugLogLevel } from "./command/log.js";
import { getBulkInputData } from "./command/bulkinput.js";

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
        runOnSigint(() => {
            hub.close();
        });

        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await led(hub);
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
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify" +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await analog(hub, portNumber, isContinuous);
    });

program
    .command("temperature")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current temperature in Celsius. " +
            "Specify --continuous to run continuously",
    )
    .action(async (options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await temperature(hub, isContinuous);
    });

program
    .command("voltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await voltageRail(hub, isContinuous);
        hub.close();
    });

program
    .command("battery")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        runOnSigint(() => {
            hub.close();
        });

        let isContinuous = options.continuous !== undefined;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];
        await battery(hub, isContinuous);
        hub.close();
    });

program
    .command("log <text>")
    .description("Inject a log hint")
    .action(async (text) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        await injectLog(hub, text);
        hub.close();
    });

program
    .command("loglevel <group> <level>")
    .description(
        "Set log level. Valid values for group are: Main, " +
            "TransmitterToHost, ReceiverFromHost, ADC, PWMAndServo, ModuleLED, " +
            "DigitalIO, I2C, Motor0, Motor1, Motor2, or Motor3. Valid values for level are [0,3]",
    )
    .action(async (group, level) => {
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        runOnSigint(() => {
            hub.close();
        });

        let levelNumber = Number(level);
        await setDebugLogLevel(hub, group, levelNumber);
        hub.close();
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        runOnSigint(async () => {
            await hub.setServoEnable(channelValue, false);
            hub.close();
        });

        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let hubs = await openConnectedExpansionHubs();
        let hub = hubs[0];

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program.parse(process.argv);
