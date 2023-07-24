import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import {ExpansionHub} from "@rev-robotics/rev-hub-core";
import { input } from '@inquirer/prompts';

enum RevHub { CONTROL_HUB, EXPANSION_HUB}

interface LightFixture {
    revHub: RevHub;
    blinkinPort: number;
}

const RED_OXYGEN_GOAL: LightFixture = {
    revHub: RevHub.EXPANSION_HUB,
    blinkinPort: 0,
}

const BLUE_OXYGEN_GOAL: LightFixture = {
    revHub: RevHub.EXPANSION_HUB,
    blinkinPort: 1,
}

const allLightFixtures = [RED_OXYGEN_GOAL, BLUE_OXYGEN_GOAL];

let expansionHub: ExpansionHub = (await openConnectedExpansionHubs())[0];

process.on("SIGINT", () => {
    console.log("Exiting");
    expansionHub.close();
    process.exit();
});

for (const lightFixture of allLightFixtures) {
    await init(lightFixture);
}

// noinspection InfiniteLoopJS
while (true) {
    try {
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
        } else {
            console.error("Invalid goal");
            continue;
        }

        let promises: Promise<void>[] = [];
        for (let lightFixture of lightFixtures) {
            promises.push(setPulseWidth(lightFixture, pulseWidth));
        }
        await Promise.all(promises);
    } catch (e) {
        console.error("Failure:");
        console.error(e);
    }
}

async function init(lightFixture: LightFixture): Promise<void> {
    if (lightFixture.revHub !== RevHub.EXPANSION_HUB) {
        throw new Error("init() does not yet support Control Hubs");
    }

    await expansionHub.setServoConfiguration(lightFixture.blinkinPort, 20000);
    await expansionHub.setServoPulseWidth(lightFixture.blinkinPort, 1995);
    await expansionHub.setServoEnable(lightFixture.blinkinPort, true);
}

function setPulseWidth(lightFixture: LightFixture, pulseWidth_uS: number): Promise<void> {
    if (lightFixture.revHub !== RevHub.EXPANSION_HUB) {
        throw new Error("setPulseWidth() does not yet support Control Hubs");
    }

    return expansionHub.setServoPulseWidth(lightFixture.blinkinPort, pulseWidth_uS);
}
