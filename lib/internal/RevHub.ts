import {RevHub} from "../RevHub";
import {
    BulkInputData, DebugGroup,
    DIODirection,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LEDPattern, ModuleInterface,
    ModuleStatus, PIDCoefficients,
    RGB, VerbosityLevel, Version
} from "../binding";
import {Serial} from "./Serial";

declare class RevHubImplementation implements RevHub {
    close(): void;

    getADC(): Promise<number>;

    getBulkInputData(): Promise<BulkInputData>;
    getDestAddress(): number;

    getDigitalAllInputs(): Promise<number>;

    getDigitalDirection(dioPin: number): Promise<DIODirection>;

    getDigitalSingleInput(dioPin: number): Promise<boolean>;

    getFTDIResetControl(): Promise<boolean>;

    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;

    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;

    getModuleLEDColor(): Promise<RGB>;

    getModuleLEDPattern(): Promise<LEDPattern>;

    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus>;

    getMotorAtTarget(motorChannel: number): Promise<boolean>;

    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;

    getMotorChannelEnable(motorChannel: number): Promise<boolean>;

    getMotorChannelMode(motorChannel: number): Promise<{ motorMode: number; floatAtZero: boolean }>;

    getMotorConstantPower(motorChannel: number): Promise<number>;

    getMotorEncoderPosition(motorChannel: number): Promise<number>;

    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<PIDCoefficients>;

    getMotorTargetPosition(motorChannel: number): Promise<{ targetPosition: number; targetTolerance: number }>;

    getMotorTargetVelocity(motorChannel: number): Promise<number>;

    getPWMConfiguration(pwmChannel: number): Promise<number>;

    getPWMEnable(pwmChannel: number): Promise<boolean>;

    getPWMPulseWidth(pwmChannel: number): Promise<number>;

    getPhoneChargeControl(): Promise<boolean>;

    getResponseTimeoutMs(): number;

    getServoConfiguration(servoChannel: number): Promise<number>;

    getServoEnable(servoChannel: number): Promise<boolean>;

    getServoPulseWidth(servoChannel: number): Promise<number>;

    injectDataLogHint(hintText: string): Promise<void>;

    isOpened(): boolean;

    open(serialPort: Serial, destAddress: number): Promise<void>;

    queryInterface(interfaceName: string): Promise<ModuleInterface>;

    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<void>;

    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void>;

    readVersion(): Promise<Version>;

    readVersionString(): Promise<string>;

    resetMotorEncoder(motorChannel: number): Promise<void>;

    sendFailSafe(): Promise<void>;

    sendKeepAlive(): Promise<void>;

    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]>;

    sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<void>;

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]>;

    sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<void>;

    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<void>;

    setDestAddress(destAddress: number): void;

    setDigitalAllOutputs(bitPackedField: number): Promise<void>;

    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void>;

    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void>;

    setFTDIResetControl(ftdiResetControl: boolean): Promise<void>;

    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<void>;

    setModuleLEDColor(red: number, green: number, blue: number): Promise<void>;

    setModuleLEDPattern(ledPattern: LEDPattern): Promise<void>;

    setMotorChannelCurrentAlertLevel(motorChannel: number, currentLimit_mA: number): Promise<void>;

    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void>;

    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<void>;

    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void>;

    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<void>;

    setMotorTargetPosition(motorChannel: number, targetPosition_counts: number, targetTolerance_counts: number): Promise<void>;

    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void>;

    setNewModuleAddress(newModuleAddress: number): Promise<void>;

    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<void>;

    setPWMEnable(pwmChannel: number, enable: boolean): Promise<void>;

    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<void>;

    setPhoneChargeControl(chargeEnable: boolean): Promise<void>;

    setResponseTimeoutMs(responseTimeoutMs: number): void;

    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;

    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;

    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;

    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<void>;

    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<void>;

    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<void>;

}
