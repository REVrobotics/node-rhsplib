import { ParentRevHub, RevHub } from "./RevHub.js";
import { ModuleStatus } from "./ModuleStatus.js";
import { ModuleInterface } from "./ModuleInterface.js";
import { Rgb } from "./Rgb.js";
import { LedPattern } from "./LedPattern.js";
import { DebugGroup } from "./DebugGroup.js";
import { VerbosityLevel } from "./VerbosityLevel.js";
import { BulkInputData } from "./BulkInputData.js";
import { Version } from "./Version.js";
import { DigitalState } from "./DigitalState.js";
import { I2CSpeedCode } from "./I2CSpeedCode.js";
import { I2CWriteStatus } from "./I2CWriteStatus.js";
import { I2CReadStatus } from "./I2CReadStatus.js";
import { PidCoefficients } from "./PidCoefficients.js";
import { DigitalChannelDirection } from "./DigitalChannelDirection.js";

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
    /**
     * Read several inputs at once
     */
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
    getDigitalBusCurrent(): Promise<number>;

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

    /**
     * Read the current version of the firmware as a human-readable string
     */
    readVersionString(): Promise<string>;
    readVersion(): Promise<Version>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<void>;
    getFTDIResetControl(): Promise<boolean>;

    // DIO
    /**
     * Set the output state of a digital pin.
     * @param digitalChannel
     * @param value whether the pin should be High or Low
     */
    setDigitalOutput(digitalChannel: number, value: DigitalState): Promise<void>;

    /**
     * Set the output state of all digital pins.
     *
     * @param bitPackedField a bit-field indicating the output states
     */
    setAllDigitalOutputs(bitPackedField: number): Promise<void>;

    /**
     * Set a digital pin as input or output.
     * @param digitalChannel
     * @param direction
     */
    setDigitalDirection(
        digitalChannel: number,
        direction: DigitalChannelDirection,
    ): Promise<void>;

    /**
     * Get the Input/Output direction of a digital channel
     * @param digitalChannel
     */
    getDigitalDirection(digitalChannel: number): Promise<DigitalChannelDirection>;

    /**
     * Read the state of a given digital pin.
     * Throws an error if the pin is not configured for input
     *
     * @param digitalChannel
     */
    getDigitalInput(digitalChannel: number): Promise<DigitalState>;

    /**
     * Read all digital inputs as a bit-packed number.
     */
    getAllDigitalInputs(): Promise<number>;

    // I2C
    setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;
    writeI2CSingleByte(
        i2cChannel: number,
        targetAddress: number,
        byte: number,
    ): Promise<void>;
    writeI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        bytes: number[],
    ): Promise<void>;
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;
    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<void>;
    readI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
    ): Promise<void>;
    writeI2CReadMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void>;
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
