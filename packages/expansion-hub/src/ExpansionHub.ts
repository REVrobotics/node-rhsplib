import {
    BulkInputData,
    DebugGroup,
    DIODirection,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LEDPattern,
    ModuleInterface,
    ModuleStatus,
    PIDCoefficients,
    RGB,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rhsplib";
import { ParentRevHub, RevHub } from "./RevHub.js";

export type ParentExpansionHub = ParentRevHub & ExpansionHub;

export interface ExpansionHub extends RevHub {
    readonly isOpen: boolean;
    responseTimeoutMs: number;

    /**
     * Closes this hub and releases any resources bound to it.
     * If this hub is a parent hub, the serial port will be closed
     * and all children will be closed as well. Do not use this hub after
     * it has been closed.
     */
    close(): void;
    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus>;
    sendKeepAlive(): Promise<void>;
    sendFailSafe(): Promise<void>;
    setNewModuleAddress(newModuleAddress: number): Promise<void>;
    queryInterface(interfaceName: string): Promise<ModuleInterface>;
    setModuleLedColor(red: number, green: number, blue: number): Promise<void>;
    getModuleLedColor(): Promise<RGB>;
    setModuleLedPattern(ledPattern: LEDPattern): Promise<void>;
    getModuleLedPattern(): Promise<LEDPattern>;
    setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void>;
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
    /**
     * Configure the speed for a I2C channel
     * @param i2cChannel
     * @param speedCode
     */
    setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void>;

    /**
     * Get the speed for a I2C channel
     * @param i2cChannel
     */
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;

    /**
     * Write a single byte over I2C
     * @param i2cChannel
     * @param slaveAddress the address of the target device
     * @param byte the byte to send
     */
    writeI2CSingleByte(
        i2cChannel: number,
        slaveAddress: number,
        byte: number,
    ): Promise<void>;

    /**
     * Write several bytes over I2C
     * @param i2cChannel
     * @param slaveAddress the address of the target device
     * @param bytes the data to send
     */
    writeI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        bytes: number[],
    ): Promise<void>;

    /**
     * Get the status of a write operation.
     * @param i2cChannel
     */
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;

    /**
     * Read a single byte from a target device. Use {@link getI2CReadStatus} to
     * get the actual byte.
     * @param i2cChannel
     * @param slaveAddress the address of the target device
     */
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void>;

    /**
     * Read multiple bytes from a target device. Use {@link getI2CReadStatus} to
     * get the actual data.
     * @param i2cChannel
     * @param slaveAddress the address of the target device
     * @param numBytesToRead the size of the payload to read
     */
    readI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
    ): Promise<void>;

    /**
     * Send a write command to a given target requesting data at a given register.
     * @param i2cChannel
     * @param slaveAddress the address of the target device
     * @param numBytesToRead size of data to read
     * @param startAddress a byte to send at the start of the payload, typically a register address.
     */
    writeI2CReadMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void>;

    /**
     * Get the read status, indicating whether a read was successful and how
     * much data was read.
     * @param i2cChannel
     */
    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;

    // Motor
    setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void>;
    getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }>;
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
    setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PIDCoefficients,
    ): Promise<void>;
    getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PIDCoefficients>;

    // Servo
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}
