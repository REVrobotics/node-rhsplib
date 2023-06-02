export var RhspLibErrorCode;
(function (RhspLibErrorCode) {
    RhspLibErrorCode[RhspLibErrorCode["GENERAL_ERROR"] = -1] = "GENERAL_ERROR";
    RhspLibErrorCode[RhspLibErrorCode["TIMEOUT"] = -2] = "TIMEOUT";
    RhspLibErrorCode[RhspLibErrorCode["MSG_NUMBER_MISMATCH"] = -3] = "MSG_NUMBER_MISMATCH";
    RhspLibErrorCode[RhspLibErrorCode["NACK"] = -4] = "NACK";
    RhspLibErrorCode[RhspLibErrorCode["SERIAL_ERROR"] = -5] = "SERIAL_ERROR";
    RhspLibErrorCode[RhspLibErrorCode["NOT_OPENED"] = -6] = "NOT_OPENED";
    RhspLibErrorCode[RhspLibErrorCode["COMMAND_NOT_SUPPORTED"] = -7] = "COMMAND_NOT_SUPPORTED";
    RhspLibErrorCode[RhspLibErrorCode["UNEXPECTED_RESPONSE"] = -8] = "UNEXPECTED_RESPONSE";
    RhspLibErrorCode[RhspLibErrorCode["ARG_OUT_OF_RANGE_START"] = -50] = "ARG_OUT_OF_RANGE_START";
    RhspLibErrorCode[RhspLibErrorCode["ARG_OUT_OF_RANGE_END"] = -55] = "ARG_OUT_OF_RANGE_END";
})(RhspLibErrorCode || (RhspLibErrorCode = {}));
