import {
    BulkInputData,
    DebugGroup,
    DioDirection,
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
} from "@rev-robotics/rev-hub-core";
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
    getModuleLedColor(): Promise<Rgb>;
    setModuleLedPattern(ledPattern: LedPattern): Promise<void>;
    getModuleLedPattern(): Promise<LedPattern>;
    setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;

    // Device Control
    getBulkInputData(): Promise<BulkInputData>;

    /**
     * Read the value of an analog channel in mV.
     *
     * @param channel
     */
    getAnalogInput(channel: number): Promise<number>;

    /**
     * Read the total current through the digital IO bus in mA
     */
    getDigitalBusVoltage(): Promise<number>;

    /**
     * Read the total current through the I2C busses in mA
     */
    getI2CCurrent(): Promise<number>;

    /**
     * Read the total current through the servos in mA
     */
    getServoCurrent(): Promise<number>;

    /**
     * Read the total current through the battery in mA
     */
    getBatteryCurrent(): Promise<number>;

    /**
     * Get the current draw of a given motor.
     *
     * @param motorChannel
     */
    getMotorCurrent(motorChannel: number): Promise<number>;

    /**
     * get the battery's voltage (mV)
     */
    getBatteryVoltage(): Promise<number>;

    /**
     * Check the 5V line's voltage (mV)
     */
    get5VBusVoltage(): Promise<number>;

    /**
     * Get the device's current temperature in degrees Celsius
     */
    getTemperature(): Promise<number>;

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
    setDigitalDirection(dioPin: number, direction: DioDirection): Promise<void>;
    getDigitalDirection(dioPin: number): Promise<DioDirection>;
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
     * @param targetAddress the address of the target device
     * @param byte the byte to send
     */
    writeI2CSingleByte(
        i2cChannel: number,
        targetAddress: number,
        byte: number,
    ): Promise<void>;

    /**
     * Write several bytes over I2C
     * @param i2cChannel
     * @param targetAddress the address of the target device
     * @param bytes the data to send
     */
    writeI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
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
     * @param targetAddress the address of the target device
     */
    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<void>;

    /**
     * Read multiple bytes from a target device. Use {@link getI2CReadStatus} to
     * get the actual data.
     * @param i2cChannel
     * @param targetAddress the address of the target device
     * @param numBytesToRead the size of the payload to read
     */
    readI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
    ): Promise<void>;

    /**
     * Send a write command to a given target requesting data at a given register.
     * @param i2cChannel
     * @param targetAddress the address of the target device
     * @param numBytesToRead size of data to read
     * @param startAddress a byte to send at the start of the payload, typically a register address.
     */
    writeI2CReadMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
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
        pid: PidCoefficients,
    ): Promise<void>;
    getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PidCoefficients>;

    // Servo
    /**
     * Set the interval between pulses (framePeriod_us) for a given servo
     * @param servoChannel
     * @param framePeriod_us time between the rising edge of each pulse in microseconds
     */
    setServoConfiguration(servoChannel: number, framePeriod_us: number): Promise<void>;

    /**
     * Get the interval between pulses (frame period) for a given servo
     * @param servoChannel
     */
    getServoConfiguration(servoChannel: number): Promise<number>;

    /**
     * Set the width of the pulses that are being sent. For most servos, this is a range centered on
     * 1500us, but the minimum and maximum can vary by servo model.
     * @param servoChannel
     * @param pulseWidth_us the pulse width in microseconds
     */
    setServoPulseWidth(servoChannel: number, pulseWidth_us: number): Promise<void>;

    /**
     * Get the current pulse width for the given servo
     * @param servoChannel
     */
    getServoPulseWidth(servoChannel: number): Promise<number>;

    /**
     * Set whether the given servo is enabled
     * @param servoChannel
     * @param enable whether the servo should be enabled or disabled
     */
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;

    /**
     * Get whether a given servo is currently enabled.
     * @param servoChannel
     */
    getServoEnable(servoChannel: number): Promise<boolean>;
}
