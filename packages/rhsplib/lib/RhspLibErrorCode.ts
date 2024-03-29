// These MUST match the values specified in librhsp's include/rhsp/errors.h file
export enum RhspLibErrorCode {
    GENERAL_ERROR = -1,
    TIMEOUT = -2,
    MSG_NUMBER_MISMATCH = -3,
    NACK = -4,
    SERIAL_ERROR = -5,
    NOT_OPENED = -6,
    COMMAND_NOT_SUPPORTED = -7,
    UNEXPECTED_RESPONSE = -8,
    NO_HUBS_DISCOVERED = -9,

    ARG_OUT_OF_RANGE_START = -50,
    ARG_OUT_OF_RANGE_END = -55,
}
