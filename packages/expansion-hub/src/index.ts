export { NackError } from "@rev-robotics/rev-hub-core";
export * from "./errors/RhspLibError.js";
export * from "./discovery.js";
export * from "./open-rev-hub.js";
export {
    openParentExpansionHub,
    openExpansionHubAndAllChildren,
} from "./open-rev-hub.js";

export {
    BulkInputData,
    DebugGroup,
    DigitalChannelDirection,
    DiscoveredAddresses,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LedPattern,
    ModuleInterface,
    ModuleStatus,
    PidCoefficients,
    Rgb,
    VerbosityLevel,
    Version,
    BatteryTooLowError,
    CommandImplementationPendingError,
    CommandRoutingError,
    DigitalChannelNotConfiguredForOutputError,
    NoDigitalChannelsConfiguredForOutputError,
    DigitalChannelNotConfiguredForInputError,
    NoDigitalChannelsConfiguredForInputError,
    GeneralSerialError,
    I2cControllerBusyError,
    I2cOperationInProgressError,
    I2cNoResultsPendingError,
    I2cQueryMismatchError,
    I2cTimeoutError,
    I2cTimeoutSclStuckError,
    I2cTimeoutSdaStuckError,
    MotorNotFullyConfiguredError,
    MotorCommandNotValidError,
    BatteryTooLowToRunMotorError,
    NoExpansionHubWithAddressError,
    ParameterOutOfRangeError,
    ServoNotFullyConfiguredError,
    BatteryTooLowToRunServoError,
    TimeoutError,
    UnrecognizedNackError,
} from "@rev-robotics/rev-hub-core";
