import { NackError, setPrototypeOf } from "./NackError.js";
import { BatteryTooLowError } from "./BatteryTooLowError.js";

export class MotorNotFullyConfiguredError extends NackError {
    constructor() {
        super(50);
        setPrototypeOf(this, MotorNotFullyConfiguredError.prototype);
    }
}

export class MotorCommandNotValidError extends NackError {
    constructor() {
        super(51, "Motor command is not valid");
        setPrototypeOf(this, MotorCommandNotValidError.prototype);
    }
}

export class BatteryTooLowToRunMotorError extends BatteryTooLowError {
    constructor() {
        super(52, "Battery is too low to run motors");
        setPrototypeOf(this, BatteryTooLowToRunMotorError.prototype);
    }
}
