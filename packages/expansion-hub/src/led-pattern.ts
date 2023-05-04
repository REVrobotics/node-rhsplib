import {LEDPattern} from "@rev-robotics/rhsplib";

export function createLEDPatternStep(t: number, r: number, g: number, b: number): number {
    return (r & 0xFF) << 24 | (g & 0xFF) << 16 | (b & 0xFF) << 8 | (t & 0xFF);
}

export function createLEDPattern(ledSteps: number[]): LEDPattern {
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

function getOrZero(arr: number[], index: number) {
    if(index < arr.length) return arr[index];
    return 0;
}
