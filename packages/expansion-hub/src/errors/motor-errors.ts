import {NackError} from "./NackError";
import {BatteryTooLowError} from "./BatteryTooLowError";

export class MotorNotFullyConfiguredError extends NackError {
    constructor() {
        super(50);
    }
}

export class MotorCommandNotValidError extends NackError {
    constructor() {
        super(51);
    }
}

export class BatteryTooLowToRunMotorError extends BatteryTooLowError {
    constructor() {
        super(52);
    }
}
