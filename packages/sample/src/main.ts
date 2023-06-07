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
import { led } from "./command/led.js";
import { runServo } from "./command/servo.js";
import { openUsbControlHubs } from "./adb-setup.js";
import { ExpansionHub, ParentExpansionHub } from "@rev-robotics/rev-hub-core";
import {
    getPossibleExpansionHubSerialNumbers,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version("1.0.0");

program
    .option("--control", "specify that you are connecting via control hub")
    .option("-s --serial <serial>", "serial number")
    .option("-p --parent <address>", "parent address")
    .option(
        "-a --address <address>",
        "module address. If this is specified, you must also specify a parent address",
    );

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
        let hub = await getExpansionHubOrThrow();
        await led(hub);
    });

let motorCommand = program.command("motor");

motorCommand
    .command("encoder <channel>")
    .option("-r --reset", "reset the encoder count")
    .option("--continuous", "run continuously")
    .description("Get the current encoder position of a motor")
    .action(async (channel, options) => {
        let channelNumber = Number(channel);
        if (options.reset) {
            await resetEncoder(channelNumber);
        } else {
            let isContinuous = options.continuous !== undefined;
            await runEncoder(channelNumber, isContinuous);
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
        await runMotorConstantPower(channelNumber, powerNumber);
    });

motorCommand
    .command("velocity <channel> <speed>")
    .description("Tell a motor to run at a given speed")
    .action(async (channel, speed) => {
        console.log(`${channel} ${speed}`);
        let channelNumber = Number(channel);
        let speedNumber = Number(speed);
        await runMotorConstantVelocity(channelNumber, speedNumber);
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
        await runMotorToPosition(
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
    .command("led")
    .description("Run LED steps")
    .action(async () => {
        let hub = await getExpansionHubOrThrow();
        await led(hub);
    });

program
    .command("analog <port>")
    .option("--continuous", "Run continuously")
    .description(
        "Read the analog value of the given port. Specify" +
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
    .command("voltage")
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

program.parse(process.argv);

async function getExpansionHubOrThrow(): Promise<ExpansionHub> {
    let options = program.opts();
    let serialNumber = options.serial;
    let isControlHub = options.control !== undefined;
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
