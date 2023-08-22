import {createLedPattern, ExpansionHub, LedPatternStep} from "@rev-robotics/rev-hub-core";

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

export async function getLed(hub: ExpansionHub) {
    let rgb = await hub.getModuleLedColor();

    console.log(`r: ${rgb.red}, g: ${rgb.green}, b: ${rgb.blue}`);
}

export async function getLedPattern(hub: ExpansionHub) {
    let pattern = await hub.getModuleLedPattern();
    let steps = [
        pattern.rgbtPatternStep0,
        pattern.rgbtPatternStep1,
        pattern.rgbtPatternStep2,
        pattern.rgbtPatternStep3,
        pattern.rgbtPatternStep4,
        pattern.rgbtPatternStep5,
        pattern.rgbtPatternStep6,
        pattern.rgbtPatternStep7,
        pattern.rgbtPatternStep8,
        pattern.rgbtPatternStep9,
        pattern.rgbtPatternStep10,
        pattern.rgbtPatternStep11,
        pattern.rgbtPatternStep12,
        pattern.rgbtPatternStep13,
        pattern.rgbtPatternStep14,
        pattern.rgbtPatternStep15,
    ];

    for (let step of steps) {
        if (step === 0) break;
        console.log(
            `t: ${(step & 0xff) * 10}, color: ${((step & 0xffffff00) >> 8).toString(16)}`,
        );
    }
}
