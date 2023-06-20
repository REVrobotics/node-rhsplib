import { Command } from "commander";
import { analog, battery, temperature, voltageRail } from "./command/analog.js";
import { error } from "./command/error.js";
import {
    resetEncoder,
    runEncoder,
    runMotorConstantPower,
    runMotorConstantVelocity,
    runMotorToPosition,
} from "./command/motor.js";
import { list } from "./command/list.js";
import { led, ledPattern } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openUsbControlHubs } from "./adb-setup.js";
import {
    ControlHub,
    DigitalState,
    ExpansionHub,
    ParentExpansionHub,
} from "@rev-robotics/rev-hub-core";
import {
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";
import { digitalRead, digitalWrite } from "./command/digital.js";
import { distance } from "./command/distance.js";
import { getBulkInputData } from "./command/bulkinput.js";
import { status } from "./command/status.js";
import { openUsbControlHubsAndChildren } from "./open-usb-control-hub.js";

const program = new Command();

program.name("ch");

program.version("1.0.0");

program
    // .option("--control", "specify that you are connecting via control hub")
    // .option("-s --serial <serial>", "serial number")
    // .option("-p --parent <address>", "parent address")
    .option("-a --address <address>", "address of Expansion Hub connected via RS-485");

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
    .command("pattern <steps...>")
    .description(
        "Run LED pattern. Provide steps as a space-separated list in the " +
            "format <time><colorHexString>, where time is in seconds, and " +
            "colorHexString is a hex color code. Example: 100FF00 for 1 second " +
            "green, 0.5FF0000 for half-second red.",
    )
    .action(async (steps) => {
        let hub = await getExpansionHubOrThrow();
        await ledPattern(hub, steps);

        process.on("SIGINT", () => {
            hub.close();
        });
    });

program
    .command("led <r> <g> <b>")
    .description("Set LED color")
    .action(async (r, g, b) => {
        console.log("Running led color. Values are [0, 255]");
        let hubs = await openUsbControlHubs();
        let rValue = Number(r);
        let gValue = Number(g);
        let bValue = Number(b);
        await led(hubs[0], rValue, gValue, bValue);
    });

program
    .command("bulkInput")
    .description("Get all input data at once. Specify --continuous to run continuously.")
    .option("--continuous", "run continuously")
    .action(async (options) => {
        let isContinuous = options.continuous !== undefined;
        let hub = await getExpansionHubOrThrow();
        await getBulkInputData(hub, isContinuous);
    });

program.command("status").action(async () => {
    let hubs = await openUsbControlHubsAndChildren();
    let allHubs = hubs.flatMap((hub) => [hub, ...hub.children]);
    for (let hub of allHubs) {
        await status(hub as ControlHub);
    }

    process.on("SIGINT", () => {
        for (let hub of hubs) {
            hub.close();
        }
        process.exit();
    });
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
        let digitalState = stateBoolean ? DigitalState.High : DigitalState.Low;
        let hubs = await openUsbControlHubs();

        await digitalWrite(hubs[0], channelNumber, digitalState);
    });

digitalCommand
    .command("read <channel>")
    .option("--continuous", "run continuously")
    .description("read digital pin")
    .action(async (channel, options) => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        let hubs = await openUsbControlHubs();

        await digitalRead(hubs[0], channelNumber, isContinuous);
    });

let motorCommand = program.command("motor");

motorCommand
    .command("encoder <channel>")
    .option("-r --reset", "reset the encoder count")
    .option("--continuous", "run continuously")
    .description("Get the current encoder position of a motor")
    .action(async (channel, options) => {
        let channelNumber = Number(channel);
        let hub = await getExpansionHubOrThrow();
        if (options.reset) {
            await resetEncoder(hub, channelNumber);
        } else {
            let isContinuous = options.continuous !== undefined;
            await runEncoder(hub, channelNumber, isContinuous);
        }
    });

motorCommand
    .command("power <channel> <power>")
    .description(
        "Tell a motor to run at a given pwm duty cycle. Power is in the range [-1.0, 1.0]",
    )
    .action(async (channel, power) => {
        console.log(`${channel} ${power}`);
        let channelNumber = Number(channel);
        let powerNumber = Number(power);
        let hub = await getExpansionHubOrThrow();
        await runMotorConstantPower(hub, channelNumber, powerNumber);
    });

motorCommand
    .command("velocity <channel> <speed>")
    .description("Tell a motor to run at a given speed")
    .action(async (channel, speed) => {
        console.log(`${channel} ${speed}`);
        let channelNumber = Number(channel);
        let speedNumber = Number(speed);
        let hub = await getExpansionHubOrThrow();
        await runMotorConstantVelocity(hub, channelNumber, speedNumber);
    });

motorCommand
    .command("position <channel> <velocity> <position> <tolerance>")
    .description("Tell a motor to run to a given position")
    .action(async (channel, velocity, position, tolerance) => {
        console.log(`${channel} ${position} ${tolerance}`);
        let channelNumber = Number(channel);
        let positionNumber = Number(position);
        let toleranceNumber = Number(tolerance);
        let velocityNumber = Number(velocity);
        let hub = await getExpansionHubOrThrow();
        await runMotorToPosition(
            hub,
            channelNumber,
            velocityNumber,
            positionNumber,
            toleranceNumber,
        );
    });

program
    .command("list")
    .description("List all connected expansion hubs")
    .action(async () => {
        await list();
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify " +
            "--continuous to run continuously.",
    )
    .action(async (port, options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        let portNumber = Number(port);
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
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await temperature(hub, isContinuous);
    });

program
    .command("5vRailVoltage")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current 5V rail voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await voltageRail(hub, isContinuous);
    });

program
    .command("battery")
    .option("--continuous", "Run continuously")
    .description(
        "Read the current battery Voltage. Specify --continuous to run continuously",
    )
    .action(async (options) => {
        let hub = await getExpansionHubOrThrow();
        let isContinuous = options.continuous !== undefined;
        await battery(hub, isContinuous);
    });

program
    .command("servo <channel> <pulseWidth> [frameWidth]")
    .description("Run a servo with pulse width and optional frame width")
    .action(async (channel, pulseWidth, frameWidth) => {
        let channelValue = Number(channel);
        let pulseWidthValue = Number(pulseWidth);
        let frameWidthValue = frameWidth ? Number(frameWidth) : 4000;
        let hub = await getExpansionHubOrThrow();

        await runServo(hub, channelValue, pulseWidthValue, frameWidthValue);
    });

program
    .command("distance <channel>")
    .option("--continuous", "run continuously")
    .description("Read distance from a REV 2m distance sensor")
    .action(async (channel, options): Promise<void> => {
        let isContinuous = options.continuous !== undefined;
        let channelNumber = Number(channel);
        let hub = await getExpansionHubOrThrow();
        await distance(hub, channelNumber, isContinuous);
    });

program.parse(process.argv);

async function getExpansionHubOrThrow(): Promise<ExpansionHub> {
    let options = program.opts();
    let serialNumber = options.serial;
    let isControlHub = true;
    let moduleAddress = options.address ? Number(options.address) : undefined;
    let parentAddress = options.parent ? Number(options.parent) : undefined;

    if (isControlHub) {
        let controlHubs = await openUsbControlHubs();
        let controlHub = controlHubs[0];

        if (serialNumber) {
            if (moduleAddress === undefined) {
                moduleAddress = parentAddress;
            }
            let parent = await controlHub.addHubBySerialNumberAndAddress(
                serialNumber,
                parentAddress!,
            );
            if (parentAddress === moduleAddress) {
                return parent;
            }
            if (parent.isParent()) {
                return (await parent.addChildByAddress(moduleAddress!)) as ExpansionHub;
            } else {
                throw new Error();
            }
        } else {
            if (moduleAddress !== undefined) {
                return await controlHub.addHubBySerialNumberAndAddress(
                    "(embedded)",
                    moduleAddress!,
                );
            } else {
                return controlHub;
            }
        }
    } else {
        if (serialNumber) {
            let parentHub = await openParentExpansionHub(serialNumber, parentAddress);
            if (moduleAddress === undefined || moduleAddress == parentHub.moduleAddress) {
                return parentHub;
            } else {
                let childHub = await parentHub.addChildByAddress(moduleAddress);
                if (childHub.isExpansionHub()) {
                    return childHub;
                }
            }
        } else if (parentAddress !== undefined) {
            //module address specified, but no serial number
            //if the user specifies a module address, use that, else use parent address as module address.
            let realModuleAddress =
                moduleAddress !== undefined ? moduleAddress : parentAddress;
            let serialNumbers = await getPossibleExpansionHubSerialNumbers();

            if (serialNumbers.length > 1) {
                //there are multiple hubs connected. We can't distinguish without a serial number
                throw new Error(
                    `There are ${serialNumbers.length} parent hubs. Please specify a serialNumber`,
                );
            }

            let hub = await openHubWithAddress(
                serialNumbers[0],
                parentAddress,
                realModuleAddress,
            );

            if (hub.isExpansionHub()) {
                return hub;
            } else {
                program.error(
                    `No expansion hub found with module address ${moduleAddress}`,
                );
            }
        }

        let connectedHubs: ParentExpansionHub[] = await openConnectedExpansionHubs();
        if (connectedHubs.length == 0) {
            throw new Error("No hubs are connected");
        }
        if (connectedHubs.length > 1 || connectedHubs[0].children.length > 0) {
            throw new Error(
                "Multiple hubs connected. You must specify a serialNumber and/or address.",
            );
        }

        return connectedHubs[0];
    }
}
