import {
    createLedPattern,
    LedPatternStep,
    openConnectedExpansionHubs,
} from "@rev-robotics/expansion-hub";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import { openUsbControlHubs } from "../adb-setup.js";
export async function ledPattern(hub: ExpansionHub, args: string[]) {
    function parse(step: string): LedPatternStep {
        function hex2rgb(hex: string) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16),
                  }
                : undefined;
        }
        if (step.length < 6) {
            throw new Error(
                "Please pass steps in the format <time><colorHexString>, where colorHexString is in 6-character hex format.",
            );
        }
        let colorString = step.slice(-6);
        let timeString = step.slice(0, -6);

        let color = hex2rgb(colorString);
        let time = parseFloat(timeString);

        if (color === undefined) {
            throw new Error("The color portion is not a valid hex string.");
        }

        return new LedPatternStep(time, color.r, color.g, color.b);
    }
    const steps = args.map((step) => parse(step));
    steps[args.length] = new LedPatternStep(0, 0, 0, 0);
    const pattern = createLedPattern(steps);

    await hub.setModuleLedPattern(pattern);
}

export async function led(
    hub: ExpansionHub,
    r: number,
    g: number,
    b: number,
): Promise<void> {
    console.log(`Setting color to ${r} ${g}, ${b}`);
    await hub.setModuleLedColor(r, g, b);
}
