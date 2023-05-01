import {RevHub} from "../RevHub.js";
import {getSerialPortPathForExHubSerial} from "../Discovery.js";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const nodeGypBuild = require('node-gyp-build');
const addon = nodeGypBuild(path.join(__dirname, '../..'));

const openSerialMap = new Map<string, Serial>();

declare class NativeRevHub {
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

class RevHubInternal implements RevHub {
    constructor() {
        this.nativeRevHub = new (addon.NativeRevHub as typeof NativeRevHub)();
    }

    nativeRevHub: NativeRevHub;
    children: Map<number, RevHub> = new Map();

    close(): void {
    }

    open(serialPort: Serial, destAddress: number): Promise<void> {
        return this.nativeRevHub.open(serialPort, destAddress);
    }

    getADC(): Promise<number> {
        return this.nativeRevHub.getADC();
    }

    getBulkInputData(): Promise<BulkInputData> {
        return this.nativeRevHub.getBulkInputData();
    }

    getDestAddress(): number {
        return this.nativeRevHub.getDestAddress();
    }

    getDigitalAllInputs(): Promise<number> {
        return this.nativeRevHub.getDigitalAllInputs();
    }

    getDigitalDirection(dioPin: number): Promise<DIODirection> {
        return this.nativeRevHub.getDigitalDirection(dioPin);
    }

    getDigitalSingleInput(dioPin: number): Promise<boolean> {
        return this.nativeRevHub.getDigitalSingleInput(dioPin);
    }

    getFTDIResetControl(): Promise<boolean> {
        return this.nativeRevHub.getFTDIResetControl();
    }

    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        return this.nativeRevHub.getI2CChannelConfiguration(i2cChannel);
    }

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus> {
        return this.nativeRevHub.getI2CReadStatus(i2cChannel);
    }

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus> {
        return this.nativeRevHub.getI2CWriteStatus(i2cChannel);
    }

    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number> {
        return this.nativeRevHub.getInterfacePacketID(interfaceName, functionNumber);
    }

    getModuleLEDColor(): Promise<RGB> {
        return this.nativeRevHub.getModuleLEDColor();
    }

    getModuleLEDPattern(): Promise<LEDPattern> {
        return this.nativeRevHub.getModuleLEDPattern();
    }

    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        return this.nativeRevHub.getModuleStatus(clearStatusAfterResponse);
    }

    getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return this.nativeRevHub.getMotorAtTarget(motorChannel);
    }

    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return this.nativeRevHub.getMotorChannelCurrentAlertLevel(motorChannel);
    }

    getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return this.nativeRevHub.getMotorChannelEnable(motorChannel);
    }

    getMotorChannelMode(motorChannel: number): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return this.nativeRevHub.getMotorChannelMode(motorChannel);
    }

    getMotorConstantPower(motorChannel: number): Promise<number> {
        return this.nativeRevHub.getMotorConstantPower(motorChannel);
    }

    getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<PIDCoefficients> {
        return this.nativeRevHub.getMotorPIDCoefficients(motorChannel, motorMode);
    }

    getMotorTargetPosition(motorChannel: number): Promise<{ targetPosition: number; targetTolerance: number }> {
        return this.nativeRevHub.getMotorTargetPosition(motorChannel);
    }

    getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return this.nativeRevHub.getMotorTargetVelocity(motorChannel);
    }

    getPWMConfiguration(pwmChannel: number): Promise<number> {
        return this.nativeRevHub.getPWMConfiguration(pwmChannel);
    }

    getPWMEnable(pwmChannel: number): Promise<boolean> {
        return this.nativeRevHub.getPWMEnable(pwmChannel);
    }

    getPWMPulseWidth(pwmChannel: number): Promise<number> {
        return this.nativeRevHub.getPWMPulseWidth(pwmChannel);
    }

    getPhoneChargeControl(): Promise<boolean> {
        return this.nativeRevHub.getPhoneChargeControl();
    }

    getResponseTimeoutMs(): number {
        return this.nativeRevHub.getResponseTimeoutMs();
    }

    getServoConfiguration(servoChannel: number): Promise<number> {
        return this.nativeRevHub.getServoConfiguration(servoChannel);
    }

    getServoEnable(servoChannel: number): Promise<boolean> {
        return this.nativeRevHub.getServoEnable(servoChannel);
    }

    getServoPulseWidth(servoChannel: number): Promise<number> {
        return this.nativeRevHub.getServoPulseWidth(servoChannel);
    }

    injectDataLogHint(hintText: string): Promise<void> {
        return this.nativeRevHub.injectDataLogHint(hintText);
    }

    isOpened(): boolean {
        return this.nativeRevHub.isOpened();
    }

    queryInterface(interfaceName: string): Promise<ModuleInterface> {
        return this.nativeRevHub.queryInterface(interfaceName);
    }

    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<void> {
        return this.nativeRevHub.readI2CMultipleBytes(i2cChannel, slaveAddress, numBytesToRead);
    }

    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void> {
        return this.nativeRevHub.readI2CSingleByte(i2cChannel, slaveAddress);
    }

    readVersion(): Promise<Version> {
        return this.nativeRevHub.readVersion();
    }

    readVersionString(): Promise<string> {
        return this.nativeRevHub.readVersionString();
    }

    resetMotorEncoder(motorChannel: number): Promise<void> {
        return this.nativeRevHub.resetMotorEncoder(motorChannel);
    }

    sendFailSafe(): Promise<void> {
        return this.nativeRevHub.sendFailSafe();
    }

    sendKeepAlive(): Promise<void> {
        return this.nativeRevHub.sendKeepAlive();
    }

    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.nativeRevHub.sendReadCommand(packetTypeID, payload);
    }

    sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<void> {
        return this.nativeRevHub.sendReadCommandInternal(packetTypeID, payload);
    }

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.nativeRevHub.sendWriteCommand(packetTypeID, payload);
    }

    sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<void> {
        return this.nativeRevHub.sendWriteCommandInternal(packetTypeID, payload);
    }

    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<void> {
        return this.nativeRevHub.setDebugLogLevel(debugGroup, verbosityLevel);
    }

    setDestAddress(destAddress: number): void {
        this.nativeRevHub.setDestAddress(destAddress);
    }

    setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        return this.nativeRevHub.setDigitalAllOutputs(bitPackedField);
    }

    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void> {
        return this.nativeRevHub.setDigitalDirection(dioPin, direction);
    }

    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void> {
        return this.nativeRevHub.setDigitalSingleOutput(dioPin, value);
    }

    setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        return this.nativeRevHub.setFTDIResetControl(ftdiResetControl);
    }

    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<void> {
        return this.nativeRevHub.setI2CChannelConfiguration(i2cChannel, speedCode);
    }

    setModuleLEDColor(red: number, green: number, blue: number): Promise<void> {
        return this.nativeRevHub.setModuleLEDColor(red, green, blue);
    }

    setModuleLEDPattern(ledPattern: LEDPattern): Promise<void> {
        return this.nativeRevHub.setModuleLEDPattern(ledPattern);
    }

    setMotorChannelCurrentAlertLevel(motorChannel: number, currentLimit_mA: number): Promise<void> {
        return this.nativeRevHub.setMotorChannelCurrentAlertLevel(motorChannel, currentLimit_mA);
    }

    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        return this.nativeRevHub.setMotorChannelEnable(motorChannel, enable);
    }

    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<void> {
        return this.nativeRevHub.setMotorChannelMode(motorChannel, motorMode, floatAtZero);
    }

    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        return this.nativeRevHub.setMotorConstantPower(motorChannel, powerLevel);
    }

    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<void> {
        return this.nativeRevHub.setMotorPIDCoefficients(motorChannel, motorMode, pid);
    }

    setMotorTargetPosition(motorChannel: number, targetPosition_counts: number, targetTolerance_counts: number): Promise<void> {
        return this.nativeRevHub.setMotorTargetPosition(motorChannel, targetPosition_counts, targetTolerance_counts);
    }

    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void> {
        return this.nativeRevHub.setMotorTargetVelocity(motorChannel, velocity_cps);
    }

    setNewModuleAddress(newModuleAddress: number): Promise<void> {
        return this.nativeRevHub.setNewModuleAddress(newModuleAddress);
    }

    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<void> {
        return this.nativeRevHub.setPWMConfiguration(pwmChannel, framePeriod);
    }

    setPWMEnable(pwmChannel: number, enable: boolean): Promise<void> {
        return this.nativeRevHub.setPWMEnable(pwmChannel, enable);
    }

    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<void> {
        return this.nativeRevHub.setPWMPulseWidth(pwmChannel, pulseWidth);
    }

    setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        return this.nativeRevHub.setPhoneChargeControl(chargeEnable);
    }

    setResponseTimeoutMs(responseTimeoutMs: number): void {
        this.nativeRevHub.setResponseTimeoutMs(responseTimeoutMs);
    }

    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void> {
        return this.nativeRevHub.setServoConfiguration(servoChannel, framePeriod);
    }

    setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        return this.nativeRevHub.setServoEnable(servoChannel, enable);
    }

    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        return this.nativeRevHub.setServoPulseWidth(servoChannel, pulseWidth);
    }

    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<void> {
        return this.nativeRevHub.writeI2CMultipleBytes(i2cChannel, slaveAddress, bytes);
    }

    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<void> {
        return this.nativeRevHub.writeI2CReadMultipleBytes(i2cChannel, slaveAddress, numBytesToRead, startAddress);
    }

    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<void> {
        return this.nativeRevHub.writeI2CSingleByte(i2cChannel, slaveAddress, byte);
    }
}

export async function openRevHub(serialNumber: string): Promise<RevHub> {
    let serialPortPath = await getSerialPortPathForExHubSerial(serialNumber);
    console.log(`Found device on Serial port ${serialPortPath}`);

    if(openSerialMap.get(serialPortPath) == undefined) {
        openSerialMap.set(serialPortPath, await openSerial(serialPortPath));
    }

    let serial = openSerialMap.get(serialPortPath)!;
    console.log("Got open Serial");

    let parentHub = new RevHubInternal();

    let discoveredModules = await addon.NativeRevHub.discoverRevHubs(serial);
    let parentAddress = discoveredModules.parentAddress; //ToDo(Landry): Figure out what happens if no discovery found

    await parentHub.open(serial, parentAddress);
    await parentHub.queryInterface("DEKA");

    for(let address of discoveredModules.childAddresses) {
        let childHub = new RevHubInternal();
        await childHub.open(serial, address);
        await childHub.queryInterface("DEKA");

        parentHub.children.set(address, childHub);
    }

    return parentHub;
}
