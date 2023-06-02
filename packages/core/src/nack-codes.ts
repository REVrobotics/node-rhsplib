export enum NackCode {
    PARAMETER_OUT_OF_RANGE_START = 0,
    PARAMETER_OUT_OF_RANGE_END = 9,

    DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_START = 10,
    DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_END = 17,
    NO_DIGITAL_CHANNELS_CONFIGURED_FOR_OUTPUT = 18,

    DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_START = 20,
    DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_END = 27,
    NO_DIGITAL_CHANNELS_CONFIGURED_FOR_INPUT = 28,

    SERVO_NOT_FULLY_CONFIGURED = 30,
    BATTERY_VOLTAGE_TOO_LOW_TO_RUN_SERVO = 31,

    I2C_CONTROLLER_BUSY = 40,
    I2C_OPERATION_IN_PROGRESS = 41,
    I2C_NO_RESULTS_PENDING = 42,
    I2C_QUERY_MISMATCH = 43,
    I2C_TIMEOUT_SDA_STUCK = 44,
    I2C_TIMEOUT_SCL_STUCK = 45,
    I2C_TIMEOUT = 46,

    MOTOR_NOT_FULLY_CONFIGURED = 50,
    COMMAND_NOT_VALID_FOR_SELECTED_MOTOR_MODE = 51,
    BATTERY_VOLTAGE_TOO_LOW_TO_RUN_MOTOR = 52,

    COMMAND_IMPLEMENTATION_PENDING = 253,
    COMMAND_ROUTING_ERROR = 254,
    COMMAND_NOT_SUPPORTED = 255,
}
