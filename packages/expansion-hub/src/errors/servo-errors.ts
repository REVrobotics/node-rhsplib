import { NackError, setPrototypeOf } from "./NackError.js";
import { BatteryTooLowError } from "./BatteryTooLowError.js";
import { NackCode } from "@rev-robotics/rev-hub-core";

export class ServoNotFullyConfiguredError extends NackError {
    constructor() {
        super(NackCode.SERVO_NOT_FULLY_CONFIGURED, "Servo is not fully configured");
        setPrototypeOf(this, ServoNotFullyConfiguredError.prototype);
    }
}

export class BatteryTooLowToRunServoError extends BatteryTooLowError {
    constructor() {
        super(
            NackCode.BATTERY_VOLTAGE_TOO_LOW_TO_RUN_SERVO,
            "Battery is too low to run servos",
        );
        setPrototypeOf(this, BatteryTooLowToRunServoError.prototype);
    }
}
