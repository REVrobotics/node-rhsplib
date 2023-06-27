import {
    createLedPattern,
    ExpansionHub,
    LedPatternStep,
} from "@rev-robotics/rev-hub-core";

export async function led(hub: ExpansionHub) {
    const steps = [
        new LedPatternStep(1, 0, 255, 0), //green
        new LedPatternStep(1, 255, 0, 0), //red
        new LedPatternStep(1, 0, 0, 255), //blue
        new LedPatternStep(1, 255, 0, 255), //magenta
        new LedPatternStep(1, 255, 255, 0), //yellow
    ];

    const pattern = createLedPattern(steps);
    await hub.setModuleLedPattern(pattern);
}
