import {NackError, setPrototypeOf} from "./NackError";
import {BatteryTooLowError} from "./BatteryTooLowError";

export class MotorNotFullyConfiguredError extends NackError {
    constructor() {
        super(50);
        setPrototypeOf(this, MotorNotFullyConfiguredError.prototype);
    }
}

export class MotorCommandNotValidError extends NackError {
    constructor() {
        super(51);
        setPrototypeOf(this, MotorCommandNotValidError.prototype);
    }
}

export class BatteryTooLowToRunMotorError extends BatteryTooLowError {
    constructor() {
        super(52);
        setPrototypeOf(this, BatteryTooLowToRunMotorError.prototype);
    }
}
