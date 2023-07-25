import {openConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {ControlHub, ExpansionHub} from "@rev-robotics/rev-hub-core";
import {input} from '@inquirer/prompts';
import {openControlHub} from "@rev-robotics/control-hub";

let expansionHub: ExpansionHub = (await openConnectedExpansionHubs())[0];
let controlHub: ControlHub = await openControlHub("android-686b9c447250bcad", 8080);

interface LightFixture {
    revHub: ExpansionHub;
    blinkinPort: number;
}

const RED_OXYGEN_GOAL: LightFixture = {
    revHub: expansionHub,
    blinkinPort: 0,
}

const BLUE_OXYGEN_GOAL: LightFixture = {
    revHub: expansionHub,
    blinkinPort: 1,
}

const BLUE_HYDROGEN_GOAL: LightFixture = {
    revHub: controlHub,
    blinkinPort: 0
}

const allLightFixtures = [RED_OXYGEN_GOAL, BLUE_OXYGEN_GOAL, BLUE_HYDROGEN_GOAL];

process.on("SIGINT", () => {
    console.log("Exiting");
    expansionHub.close();
    controlHub.close();
    process.exit();
});

for (const lightFixture of allLightFixtures) {
    await init(lightFixture);
}

// noinspection InfiniteLoopJS
while (true) {
    try {
        console.log(`Control Hub battery: ${await controlHub.getBatteryVoltage() * 1000}V`);

        const commandString = await input({ message: "<pulse width> [goal]:"});
        const commandElements = commandString.split(' ');

        if (commandElements.length == 0) {
            continue;
        }

        const pulseWidth = Number.parseInt(commandElements[0]);
        if (isNaN(pulseWidth)) {
            console.error("Invalid pulse width");
            continue;
        }

        const goal = commandElements.slice(1).join(' ').toLowerCase();

        let lightFixtures: LightFixture[];
        if (goal.length === 0 || goal == "all") {
            lightFixtures = allLightFixtures;
        } else if (goal.startsWith("ox")) {
            if (goal == "ox" || goal == "oxy" || goal == "oxygen") {
                lightFixtures = [RED_OXYGEN_GOAL, BLUE_OXYGEN_GOAL];
            } else if (goal.includes("red")) {
                lightFixtures = [RED_OXYGEN_GOAL];
            } else if (goal.includes("blue")) {
                lightFixtures = [BLUE_OXYGEN_GOAL];
            } else {
                console.error("Invalid oxygen goal");
                continue;
            }
        } else if (goal.startsWith("hy")) {
            lightFixtures = [BLUE_HYDROGEN_GOAL];
        } else {
            console.error("Invalid goal");
            continue;
        }

        let promises: Promise<void>[] = [];
        for (let lightFixture of lightFixtures) {
            promises.push(setPulseWidth(lightFixture, pulseWidth));
            // await setPulseWidth(lightFixture, pulseWidth);
        }
        await Promise.all(promises);
    } catch (e) {
        console.error("Failure:");
        console.error(e);
    }
}

async function init(lightFixture: LightFixture): Promise<void> {
    await lightFixture.revHub.setServoConfiguration(lightFixture.blinkinPort, 20000);
    await lightFixture.revHub.setServoPulseWidth(lightFixture.blinkinPort, 1995);
    await lightFixture.revHub.setServoEnable(lightFixture.blinkinPort, true);
}

function setPulseWidth(lightFixture: LightFixture, pulseWidth_uS: number): Promise<void> {
    return lightFixture.revHub.setServoPulseWidth(lightFixture.blinkinPort, pulseWidth_uS);
}
