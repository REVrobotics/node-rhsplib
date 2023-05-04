import {NackError} from "./NackError.js";
import {BatteryTooLowError} from "./BatteryTooLowError";

export class ServoNotFullyConfiguredError extends NackError {
    constructor() {
        super(30);
    }
}

export class BatteryTooLowToRunServoError extends BatteryTooLowError {
    constructor() {
        super(31);
    }
}
