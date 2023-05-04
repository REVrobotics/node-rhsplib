import {ParameterOutOfRangeError} from "./ParameterOutOfRangeError.js";
import {
    GpioNotConfiguredForInputError,
    GpioNotConfiguredForOutputError, NoGpioPinsConfiguredForInputError,
    NoGpioPinsConfiguredForOutputError
} from "./gpio-errors.js";
import {BatteryTooLowToRunServoError, ServoNotFullyConfiguredError} from "./servo-errors";
import {
    I2cMasterBusyError,
    I2cNoResultsPendingError,
    I2cOperationInProgressError,
    I2cQueryMismatchError, I2cTimeoutError, I2cTimeoutSclStuckError, I2cTimeoutSdaStuckError
} from "./i2c-errors.js";
import {BatteryTooLowToRunMotorError, MotorCommandNotValidError, MotorNotFullyConfiguredError} from "./motor-errors.js";
import {CommandImplementationPendingError, CommandRoutingError, PacketTypeIDUnknownError} from "./diagnostic-errors.js";
import {UnknownNackError} from "./UnknownNackError.js";
import {NackError} from "./NackError.js";

export function nackCodeToError(nackCode: number): NackError {
    if(nackCode >= 0 && nackCode <= 10) return new ParameterOutOfRangeError(nackCode);
    if(nackCode < 18) return new GpioNotConfiguredForOutputError(nackCode - 10);
    if(nackCode == 18) return new NoGpioPinsConfiguredForOutputError();
    if(nackCode >= 20 && nackCode < 28) return new GpioNotConfiguredForInputError(nackCode - 20);
    if(nackCode == 28) return new NoGpioPinsConfiguredForInputError();
    if(nackCode == 30) return new ServoNotFullyConfiguredError();
    if(nackCode == 31) return new BatteryTooLowToRunServoError();
    if(nackCode == 40) return new I2cMasterBusyError();
    if(nackCode == 41) return new I2cOperationInProgressError();
    if(nackCode == 42) return new I2cNoResultsPendingError();
    if(nackCode == 43) return new I2cQueryMismatchError();
    if(nackCode == 44) return new I2cTimeoutSdaStuckError();
    if(nackCode == 45) return new I2cTimeoutSclStuckError();
    if(nackCode == 46) return new I2cTimeoutError();
    if(nackCode == 50) return new MotorNotFullyConfiguredError();
    if(nackCode == 51) return new MotorCommandNotValidError();
    if(nackCode == 52) return new BatteryTooLowToRunMotorError();
    if(nackCode == 253) return new CommandImplementationPendingError();
    if(nackCode == 254) return new CommandRoutingError();
    if(nackCode == 255) return new PacketTypeIDUnknownError();
    return new UnknownNackError(nackCode);
}
