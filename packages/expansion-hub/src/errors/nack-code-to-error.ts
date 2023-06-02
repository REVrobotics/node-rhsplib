import { ParameterOutOfRangeError } from "./ParameterOutOfRangeError.js";
import {
    DigitalChannelNotConfiguredForInputError,
    DigitalChannelNotConfiguredForOutputError,
    NoDigitalChannelsConfiguredForInputError,
    NoDigitalChannelsConfiguredForOutputError,
} from "./digital-channel-errors.js";
import {
    BatteryTooLowToRunServoError,
    ServoNotFullyConfiguredError,
} from "./servo-errors.js";
import {
    I2cControllerBusyError,
    I2cNoResultsPendingError,
    I2cOperationInProgressError,
    I2cQueryMismatchError,
    I2cTimeoutError,
    I2cTimeoutSclStuckError,
    I2cTimeoutSdaStuckError,
} from "./i2c-errors.js";
import {
    BatteryTooLowToRunMotorError,
    MotorCommandNotValidError,
    MotorNotFullyConfiguredError,
} from "./motor-errors.js";
import {
    CommandImplementationPendingError,
    CommandRoutingError,
    CommandNotSupportedError,
} from "./diagnostic-errors.js";
import { UnrecognizedNackError } from "./UnrecognizedNackError.js";
import { NackError } from "./NackError.js";
import { NackCode } from "@rev-robotics/rev-hub-core";

export function nackCodeToError(nackCode: number): NackError {
    if (
        nackCode >= NackCode.PARAMETER_OUT_OF_RANGE_START &&
        nackCode <= NackCode.PARAMETER_OUT_OF_RANGE_END
    )
        return new ParameterOutOfRangeError(nackCode);
    if (
        nackCode >= NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_START &&
        nackCode <= NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_END
    )
        return new DigitalChannelNotConfiguredForOutputError(nackCode);
    if (nackCode == NackCode.NO_DIGITAL_CHANNELS_CONFIGURED_FOR_OUTPUT)
        return new NoDigitalChannelsConfiguredForOutputError();
    if (
        nackCode >= NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_START &&
        nackCode <= NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_END
    )
        return new DigitalChannelNotConfiguredForInputError(nackCode);
    if (nackCode == NackCode.NO_DIGITAL_CHANNELS_CONFIGURED_FOR_INPUT)
        return new NoDigitalChannelsConfiguredForInputError();
    if (nackCode == NackCode.SERVO_NOT_FULLY_CONFIGURED)
        return new ServoNotFullyConfiguredError();
    if (nackCode == NackCode.BATTERY_VOLTAG_TOO_LOW_TO_RUN_SERVO)
        return new BatteryTooLowToRunServoError();
    if (nackCode == NackCode.I2C_CONTROLLER_BUSY) return new I2cControllerBusyError();
    if (nackCode == NackCode.I2C_OPERATION_IN_PROGRESS)
        return new I2cOperationInProgressError();
    if (nackCode == NackCode.I2C_NO_RESULTS_PENDING)
        return new I2cNoResultsPendingError();
    if (nackCode == NackCode.I2C_QUERY_MISMATCH) return new I2cQueryMismatchError();
    if (nackCode == NackCode.I2C_TIMEOUT_SDA_STUCK) return new I2cTimeoutSdaStuckError();
    if (nackCode == NackCode.I2C_TIMEOUT_SCL_STUCK) return new I2cTimeoutSclStuckError();
    if (nackCode == NackCode.I2C_TIMEOUT) return new I2cTimeoutError();
    if (nackCode == NackCode.MOTOR_NOT_FULLY_CONFIGURED)
        return new MotorNotFullyConfiguredError();
    if (nackCode == NackCode.COMMAND_NOT_VALID_FOR_SELECTED_MOTOR_MODE)
        return new MotorCommandNotValidError();
    if (nackCode == NackCode.BATTERY_VOLTAGE_TOO_LOW_TO_RUN_MOTOR)
        return new BatteryTooLowToRunMotorError();
    if (nackCode == NackCode.COMMAND_IMPLEMENTATION_PENDING)
        return new CommandImplementationPendingError();
    if (nackCode == NackCode.COMMAND_ROUTING_ERROR) return new CommandRoutingError();
    if (nackCode == NackCode.COMMAND_NOT_SUPPORTED) return new CommandNotSupportedError();
    return new UnrecognizedNackError(nackCode);
}
