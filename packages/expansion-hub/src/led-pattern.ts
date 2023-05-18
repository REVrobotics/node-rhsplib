import {LEDPattern} from "@rev-robotics/rhsplib";

/**
 * Create the value representing an LED step.
 *
 * @param step
 */
function createLedPatternStep(step: LedPatternStep): number {
    return (step.r & 0xFF) << 24 | (step.g & 0xFF) << 16 | (step.b & 0xFF) << 8 | (step.t*10 & 0xFF);
}

/**
 * Represents a step in an LED pattern
 */
export class LedPatternStep {
    r: number;
    g: number;
    b: number;
    t: number;

    /**
     *
     * @param r red component [0, 255]
     * @param g green component [0, 255]
     * @param b blue component [0, 255]
     * @param t time in seconds
     */
    constructor(t: number, r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.t = t;
    }
}

/**
 * Set a pattern for the built-in LED on the expansion hub.
 *
 * @param ledSteps list of led steps created using {@link createLedPatternStep}
 */
export function createLedPattern(ledSteps: LedPatternStep[]): LEDPattern {
    return {
        rgbtPatternStep0: getOrZero(ledSteps, 0),
        rgbtPatternStep1: getOrZero(ledSteps, 1),
        rgbtPatternStep2: getOrZero(ledSteps, 2),
        rgbtPatternStep3: getOrZero(ledSteps, 3),
        rgbtPatternStep4: getOrZero(ledSteps, 4),
        rgbtPatternStep5: getOrZero(ledSteps, 5),
        rgbtPatternStep6: getOrZero(ledSteps, 6),
        rgbtPatternStep7: getOrZero(ledSteps, 7),
        rgbtPatternStep8: getOrZero(ledSteps, 8),
        rgbtPatternStep9: getOrZero(ledSteps, 9),
        rgbtPatternStep10: getOrZero(ledSteps, 10),
        rgbtPatternStep11: getOrZero(ledSteps, 11),
        rgbtPatternStep12: getOrZero(ledSteps, 12),
        rgbtPatternStep13: getOrZero(ledSteps, 13),
        rgbtPatternStep14: getOrZero(ledSteps, 14),
        rgbtPatternStep15: getOrZero(ledSteps, 15)
    };
}

function getOrZero(arr: LedPatternStep[], index: number): number {
    if(index < arr.length) return createLedPatternStep(arr[index]);
    return 0;
}
