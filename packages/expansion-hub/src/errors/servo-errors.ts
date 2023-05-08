import {NackError, setPrototypeOf} from "./NackError.js";
import {BatteryTooLowError} from "./BatteryTooLowError";

export class ServoNotFullyConfiguredError extends NackError {
    constructor() {
        super(30);
        setPrototypeOf(this, ServoNotFullyConfiguredError.prototype);
    }
}

export class BatteryTooLowToRunServoError extends BatteryTooLowError {
    constructor() {
        super(31);
        setPrototypeOf(this, BatteryTooLowToRunServoError.prototype);
    }
}
