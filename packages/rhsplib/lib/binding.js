"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I2CSpeedCode = exports.DIODirection = exports.VerbosityLevel = exports.DebugGroup = exports.SerialFlowControl = exports.SerialParity = void 0;
var path = require("path");
var addon = require('node-gyp-build')(path.join(__dirname, '..'));
module.exports.Serial = addon.Serial;
module.exports.RevHub = addon.RevHub;
var SerialParity;
(function (SerialParity) {
    SerialParity[SerialParity["None"] = 0] = "None";
    SerialParity[SerialParity["Odd"] = 1] = "Odd";
    SerialParity[SerialParity["Even"] = 2] = "Even";
})(SerialParity = exports.SerialParity || (exports.SerialParity = {}));
var SerialFlowControl;
(function (SerialFlowControl) {
    SerialFlowControl[SerialFlowControl["None"] = 0] = "None";
    SerialFlowControl[SerialFlowControl["Hardware"] = 1] = "Hardware";
    SerialFlowControl[SerialFlowControl["Software"] = 2] = "Software";
})(SerialFlowControl = exports.SerialFlowControl || (exports.SerialFlowControl = {}));
var DebugGroup;
(function (DebugGroup) {
    DebugGroup[DebugGroup["Main"] = 1] = "Main";
    DebugGroup[DebugGroup["TransmitterToHost"] = 2] = "TransmitterToHost";
    DebugGroup[DebugGroup["ReceiverFromHost"] = 3] = "ReceiverFromHost";
    DebugGroup[DebugGroup["ADC"] = 4] = "ADC";
    DebugGroup[DebugGroup["PWMAndServo"] = 5] = "PWMAndServo";
    DebugGroup[DebugGroup["ModuleLED"] = 6] = "ModuleLED";
    DebugGroup[DebugGroup["DigitalIO"] = 7] = "DigitalIO";
    DebugGroup[DebugGroup["I2C"] = 8] = "I2C";
    DebugGroup[DebugGroup["Motor0"] = 9] = "Motor0";
    DebugGroup[DebugGroup["Motor1"] = 10] = "Motor1";
    DebugGroup[DebugGroup["Motor2"] = 11] = "Motor2";
    DebugGroup[DebugGroup["Motor3"] = 12] = "Motor3";
})(DebugGroup = exports.DebugGroup || (exports.DebugGroup = {}));
var VerbosityLevel;
(function (VerbosityLevel) {
    VerbosityLevel[VerbosityLevel["Off"] = 0] = "Off";
    VerbosityLevel[VerbosityLevel["Level1"] = 1] = "Level1";
    VerbosityLevel[VerbosityLevel["Level2"] = 2] = "Level2";
    VerbosityLevel[VerbosityLevel["Level3"] = 3] = "Level3";
})(VerbosityLevel = exports.VerbosityLevel || (exports.VerbosityLevel = {}));
var DIODirection;
(function (DIODirection) {
    DIODirection[DIODirection["Input"] = 0] = "Input";
    DIODirection[DIODirection["Output"] = 1] = "Output";
})(DIODirection = exports.DIODirection || (exports.DIODirection = {}));
var I2CSpeedCode;
(function (I2CSpeedCode) {
    I2CSpeedCode[I2CSpeedCode["SpeedCode100_Kbps"] = 0] = "SpeedCode100_Kbps";
    I2CSpeedCode[I2CSpeedCode["SpeedCode400_Kbps"] = 1] = "SpeedCode400_Kbps";
})(I2CSpeedCode = exports.I2CSpeedCode || (exports.I2CSpeedCode = {}));
