import {
    createLedPattern,
    LedPatternStep,
    openConnectedExpansionHubs,
} from "@rev-robotics/expansion-hub";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import { openUsbControlHubs } from "../adb-setup.js";

export async function led() {
    const hubs: ExpansionHub[] = await openConnectedExpansionHubs();
    const controlHubs = await openUsbControlHubs();
    for (let hub of controlHubs) {
        hubs.push(hub);
    }
    const steps = [
        new LedPatternStep(1, 0, 255, 0), //green
        new LedPatternStep(1, 255, 0, 0), //red
        new LedPatternStep(1, 0, 0, 255), //blue
        new LedPatternStep(1, 255, 0, 255), //magenta
        new LedPatternStep(1, 255, 255, 0), //yellow
    ];

    const pattern = createLedPattern(steps);

    for (let hub of hubs) {
        await hub.setModuleLedPattern(pattern);
    }
}
