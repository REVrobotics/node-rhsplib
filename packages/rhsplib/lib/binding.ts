import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as path from "path";
import {
    BulkInputData,
    ClosedLoopControlAlgorithm,
    DebugGroup,
    DigitalChannelDirection,
    DiscoveredAddresses,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LedPattern,
    ModuleInterface,
    ModuleStatus,
    MotorMode,
    PidCoefficients,
    PidfCoefficients,
    Rgb,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rev-hub-core";
import { SerialParity } from "./SerialParity.js";
import { SerialFlowControl } from "./SerialFlowControl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let bindingOptions = require("../binding-options.cjs");

const addon = require("pkg-prebuilds")(path.join(__dirname, ".."), bindingOptions);

export * from "./RhspLibErrorCode.js";
export * from "./SerialErrorCode.js";
export * from "./SerialFlowControl.js";
export * from "./SerialParity.js";
// Everything that this file needs to import from @rev-robotics/rev-hub-core must also be exported here.
export {
    BulkInputData,
    ClosedLoopControlAlgorithm,
    DebugGroup,
    DigitalChannelDirection,
    DiscoveredAddresses,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LedPattern,
    ModuleInterface,
    ModuleStatus,
    MotorMode,
    PidCoefficients,
    PidfCoefficients,
    Rgb,
    VerbosityLevel,
    Version,

    // Additional items from @rev-robotics/rev-hub-core that are not directly used in this library's API, but that are
    // useful to the users of this library.
    NackCode,
} from "@rev-robotics/rev-hub-core";

export let NativeSerial = addon.Serial;
export let NativeRevHub = addon.RevHub;

export declare class Serial {
    constructor();
    open(
        serialPortName: string,
        baudrate: number,
        databits: number,
        parity: SerialParity,
        stopbits: number,
        flowControl: SerialFlowControl,
    ): Promise<void>;
    close(): void;
    read(numBytesToRead: number): Promise<number[]>;
    write(bytes: number[]): Promise<void>;
}

export declare class RevHub {
    constructor();
    open(serialPort: Serial, destAddress: number): Promise<void>;
    isOpened(): boolean;
    close(): void;
    setDestAddress(destAddress: number): void;
    getDestAddress(): number;
    setResponseTimeoutMs(responseTimeoutMs: number): void;
    getResponseTimeoutMs(): number;
    sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<void>;
    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<void>;
    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus>;
    sendKeepAlive(): Promise<void>;
    sendFailSafe(): Promise<void>;
    setNewModuleAddress(newModuleAddress: number): Promise<void>;
    queryInterface(interfaceName: string): Promise<ModuleInterface>;
    setModuleLEDColor(red: number, green: number, blue: number): Promise<void>;
    getModuleLEDColor(): Promise<Rgb>;
    setModuleLEDPattern(ledPattern: LedPattern): Promise<void>;
    getModuleLEDPattern(): Promise<LedPattern>;
    setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void>;
    static discoverRevHubs(serialPort: Serial): Promise<DiscoveredAddresses>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;

    // Device Control
    getBulkInputData(): Promise<BulkInputData>;
    getADC(channel: number, rawMode: number): Promise<number>;
    setPhoneChargeControl(chargeEnable: boolean): Promise<void>;
    getPhoneChargeControl(): Promise<boolean>;
    injectDataLogHint(hintText: string): Promise<void>;
    readVersionString(): Promise<string>;
    readVersion(): Promise<Version>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<void>;
    getFTDIResetControl(): Promise<boolean>;

    // DIO
    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void>;
    setDigitalAllOutputs(bitPackedField: number): Promise<void>;
    setDigitalDirection(
        dioPin: number,
        direction: DigitalChannelDirection,
    ): Promise<void>;
    getDigitalDirection(dioPin: number): Promise<DigitalChannelDirection>;
    getDigitalSingleInput(dioPin: number): Promise<boolean>;
    getDigitalAllInputs(): Promise<number>;

    // I2C
    setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;
    writeI2CSingleByte(
        i2cChannel: number,
        slaveAddress: number,
        byte: number,
    ): Promise<void>;
    writeI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        bytes: number[],
    ): Promise<void>;
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void>;
    readI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
    ): Promise<void>;
    writeI2CReadMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void>;
    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;

    // Motor
    setMotorChannelMode(
        motorChannel: number,
        motorMode: MotorMode,
        floatAtZero: boolean,
    ): Promise<void>;
    getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: MotorMode; floatAtZero: boolean }>;
    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void>;
    getMotorChannelEnable(motorChannel: number): Promise<boolean>;
    setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void>;
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;
    resetMotorEncoder(motorChannel: number): Promise<void>;
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void>;
    getMotorConstantPower(motorChannel: number): Promise<number>;
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void>;
    getMotorTargetVelocity(motorChannel: number): Promise<number>;
    setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void>;
    getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }>;
    getMotorAtTarget(motorChannel: number): Promise<boolean>;
    getMotorEncoderPosition(motorChannel: number): Promise<number>;
    setMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
        algorithm: ClosedLoopControlAlgorithm.Pid,
        pid: PidCoefficients,
    ): Promise<void>;
    setMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
        algorithm: ClosedLoopControlAlgorithm.Pidf,
        pidf: PidfCoefficients,
    ): Promise<void>;
    setMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
        algorithm: ClosedLoopControlAlgorithm,
        pid: PidCoefficients | PidfCoefficients,
    ): Promise<void>;
    getMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
    ): Promise<PidfCoefficients | PidCoefficients>;

    // Servo
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}
