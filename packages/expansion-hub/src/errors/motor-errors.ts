import { NackError, setPrototypeOf } from "./NackError.js";
import { BatteryTooLowError } from "./BatteryTooLowError.js";
import { NackCode } from "./nack-codes.js";

export class MotorNotFullyConfiguredError extends NackError {
    constructor() {
        super(NackCode.MOTOR_NOT_FULLY_CONFIGURED, "Motor is not fully configured");
        setPrototypeOf(this, MotorNotFullyConfiguredError.prototype);
    }
}

export class MotorCommandNotValidError extends NackError {
    constructor() {
        super(
            NackCode.COMMAND_NOT_VALID_FOR_SELECTED_MOTOR_MODE,
            "Motor command is not valid",
        );
        setPrototypeOf(this, MotorCommandNotValidError.prototype);
    }
}

export class BatteryTooLowToRunMotorError extends BatteryTooLowError {
    constructor() {
        super(
            NackCode.BATTERY_VOLTAGE_TOO_LOW_TO_RUN_MOTOR,
            "Battery is too low to run motors",
        );
        setPrototypeOf(this, BatteryTooLowToRunMotorError.prototype);
    }
}
