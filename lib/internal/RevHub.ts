import {RevHub} from "../RevHub.js";
import {getSerialPortPathForExHubSerial} from "../discovery.js";
import {Serial} from "../Serial.js";
import {openSerial} from "./Serial.js";
import * as path from "path";

import { createRequire } from "node:module";
import {fileURLToPath} from "url";
import {
    BulkInputData, DebugGroup,
    DIODirection, DiscoveredAddresses,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus, LEDPattern, ModuleInterface, ModuleStatus,
    PIDCoefficients, RGB, VerbosityLevel,
    Version
} from "../binding.js";

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const nodeGypBuild = require('node-gyp-build');
const addon = nodeGypBuild(path.join(scriptDirPath, '..', '..', '..'));

const openSerialMap = new Map<string, Serial>();

declare class RevHubInternal {
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
    getModuleLEDColor(): Promise<RGB>;
    setModuleLEDPattern(ledPattern: LEDPattern): Promise<void>;
    getModuleLEDPattern(): Promise<LEDPattern>;
    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<void>;
    static discoverRevHubs(serialPort: Serial): Promise<DiscoveredAddresses>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;

    // Device Control
    getBulkInputData(): Promise<BulkInputData>;
    getADC(): Promise<number>;
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
    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void>;
    getDigitalDirection(dioPin: number): Promise<DIODirection>;
    getDigitalSingleInput(dioPin: number): Promise<boolean>;
    getDigitalAllInputs(): Promise<number>;

    // I2C
    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<void>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;
    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<void>;
    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<void>;
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void>;
    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<void>;
    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<void>;
    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;

    // Motor
    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<void>;
    getMotorChannelMode(motorChannel: number): Promise<{motorMode: number, floatAtZero: boolean}>
    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void>;
    getMotorChannelEnable(motorChannel: number): Promise<boolean>;
    setMotorChannelCurrentAlertLevel(motorChannel: number, currentLimit_mA: number): Promise<void>;
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;
    resetMotorEncoder(motorChannel: number): Promise<void>;
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void>;
    getMotorConstantPower(motorChannel: number): Promise<number>;
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void>;
    getMotorTargetVelocity(motorChannel: number): Promise<number>;
    setMotorTargetPosition(motorChannel: number, targetPosition_counts: number, targetTolerance_counts: number): Promise<void>;
    getMotorTargetPosition(motorChannel: number): Promise<{targetPosition: number, targetTolerance: number}>;
    getMotorAtTarget(motorChannel: number): Promise<boolean>;
    getMotorEncoderPosition(motorChannel: number): Promise<number>;
    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<void>;
    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<PIDCoefficients>;

    // PWM
    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<void>;
    getPWMConfiguration(pwmChannel: number): Promise<number>;
    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<void>;
    getPWMPulseWidth(pwmChannel: number): Promise<number>;
    setPWMEnable(pwmChannel: number, enable: boolean): Promise<void>;
    getPWMEnable(pwmChannel: number): Promise<boolean>;

    // Servo
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}

export async function openRevHub(serialNumber: string): Promise<RevHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;

    let parentHub = new (addon.RevHubInternal as typeof RevHubInternal)();

    let discoveredModules = await addon.RevHubInternal.discoverRevHubs(serial);
    let parentAddress = discoveredModules.parentAddress; //ToDo(Landry): Figure out what happens if no discovery found

    await parentHub.open(serial, parentAddress);
    await parentHub.queryInterface("DEKA");

    return parentHub;
}
