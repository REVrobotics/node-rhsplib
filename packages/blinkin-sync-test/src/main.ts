import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import {ExpansionHub} from "@rev-robotics/rev-hub-core";
import { input } from '@inquirer/prompts';
import {performance} from "node:perf_hooks";

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

const BLUE_HYDROGEN_GOAL: LightFixture = {
    revHub: RevHub.EXPANSION_HUB,
    blinkinPort: 2,
}

const ALL_LIGHT_FIXTURES = [RED_OXYGEN_GOAL, BLUE_OXYGEN_GOAL, BLUE_HYDROGEN_GOAL];

const COUNTDOWN_COLOR_uS = 1955;
const BLACK_COLOR_uS = 1995;

console.log("Opening Expansion Hub")
let expansionHub: ExpansionHub = (await openConnectedExpansionHubs())[0];

// let stdin = process.stdin;
// stdin.on("data", (key) => {
    // if (key. == "\u0003") {
    //     LOG("catching ctrl+c");
    // }
// });

process.on("SIGINT", () => {
    exit();
});

console.log("Initializing light fixtures");
for (const lightFixture of ALL_LIGHT_FIXTURES) {
    await init(lightFixture);
}

// noinspection InfiniteLoopJS
while (true) {
    try {
       let commandsString = (await input({ message: "<pulse width> [goal]:"}))
           .trim()
           .toLowerCase();

        if (commandsString.startsWith("count")) {
            commandsString = await countdown();
        }

        if (commandsString.length == 0) {
            commandsString = BLACK_COLOR_uS.toString();
        } else if (commandsString == "ready") {
            commandsString = BLACK_COLOR_uS.toString();
        } else if (commandsString == "match") {
            commandsString = "81 red | 94 blue";
        } else if (commandsString == "endgame") {
            commandsString = "45 red | 46 blue";
        } else if (commandsString.includes("com") && commandsString.includes("red")) {
            commandsString = "71 red";
        } else if (commandsString.includes("com") && commandsString.includes("blue")) {
            commandsString = "71 blue";
        } else if (commandsString == "exit") {
            exit();
        }

        const commands = commandsString.split('|');

        const lightOps: { fixtures: LightFixture[], pulseWidth_uS: number}[] = [];
        for (const command of commands) {
            console.log(`command: ${command}`)
            const commandElements = command.split(' ').filter(val => val.trim().length > 0 );
            if (commandElements.length == 0) {
                continue;
            }

            let pulseWidth = Number.parseInt(commandElements[0].trim());
            if (isNaN(pulseWidth)) {
                console.error(`Invalid pulse width "${commandElements[0]}"`);
                continue;
            }

            if (pulseWidth < 200) {
                const pattern = pulseWidth;
                pulseWidth = 1005 + ((pattern - 1) * 10);
                console.log(`Converting pattern ${pattern} to pulse width ${pulseWidth}`);
            }

            const goal = commandElements.slice(1).join(' ').trim();
            console.log(`goal: "${goal}"`)

            let lightFixtures: LightFixture[];
            if (goal.length === 0 || goal == "all") {
                lightFixtures = ALL_LIGHT_FIXTURES;
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
                if (goal == "hy" || goal == "hydro" || goal == "hydrogen") {
                    lightFixtures = [BLUE_HYDROGEN_GOAL];
                } else if (goal.includes("blue")) {
                    lightFixtures = [BLUE_HYDROGEN_GOAL];
                } else {
                    console.error("Invalid hydrogen goal");
                    continue;
                }
            } else if (goal.startsWith("blue")) {
                if (goal == "blue") {
                    lightFixtures = [BLUE_OXYGEN_GOAL, BLUE_HYDROGEN_GOAL];
                } else if (goal.includes("ox")) {
                    lightFixtures = [BLUE_OXYGEN_GOAL];
                } else if (goal.includes("hy")) {
                    lightFixtures = [BLUE_HYDROGEN_GOAL];
                } else {
                    console.error("Invalid blue goal");
                    continue;
                }
            } else if (goal.startsWith("red")) {
                if (goal == "red") {
                    lightFixtures = [RED_OXYGEN_GOAL];
                } else if (goal.includes("ox")) {
                    lightFixtures = [RED_OXYGEN_GOAL];
                } else {
                    console.error("Invalid red goal");
                    continue;
                }
            } else {
                console.error("Invalid goal");
                continue;
            }

            lightOps.push({ fixtures: lightFixtures, pulseWidth_uS: pulseWidth });
        }

        let promises: Promise<void>[] = [];
        for (let lightOperation of lightOps) {
            for (let fixture of lightOperation.fixtures) {
                promises.push(setPulseWidth(fixture, lightOperation.pulseWidth_uS));
                // await setPulseWidth(lightFixture, pulseWidth);
            }
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

async function setPulseWidthOnAll(pulseWidth_uS: number): Promise<void> {
    let promises: Promise<void>[] = [];
    for (let fixture of ALL_LIGHT_FIXTURES) {
        promises.push(setPulseWidth(fixture, pulseWidth_uS));
    }
    await Promise.all(promises);
}

async function countdown(): Promise<string> {
    const startTime = performance.now();
    let elapsedTime_mS = 0;

    while (elapsedTime_mS < 3000) {
        let elapsedTimeWithinSecond: number;
        let countdownColor: number;
        if (elapsedTime_mS > 2000) {
            countdownColor = 1955;
            elapsedTimeWithinSecond = elapsedTime_mS - 2000;
        } else if (elapsedTime_mS > 1000) {
            countdownColor = 1865;
            elapsedTimeWithinSecond = elapsedTime_mS - 1000;
        } else {
            countdownColor = 1785;
            elapsedTimeWithinSecond = elapsedTime_mS;
        }

        // if (elapsedTimeWithinSecond < 500) {
            await setPulseWidthOnAll(countdownColor);
        // } else {
        //     await setPulseWidthOnAll(BLACK_COLOR_uS);
        // }

        elapsedTime_mS = performance.now() - startTime;
    }

    return "match";
}

function exit(): void {
    console.log("Exiting");
    expansionHub.close();
    process.exit();
}
