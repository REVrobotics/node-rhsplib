import { ParentRevHub, RevHub } from "./RevHub.js";
import { ModuleStatus } from "./ModuleStatus.js";
import { ModuleInterface } from "./ModuleInterface.js";
import { Rgb } from "./Rgb.js";
import { LedPattern } from "./LedPattern.js";
import { DebugGroup } from "./DebugGroup.js";
import { VerbosityLevel } from "./VerbosityLevel.js";
import { BulkInputData } from "./BulkInputData.js";
import { Version } from "./Version.js";
import { DioDirection } from "./DioDirection.js";
import { I2CSpeedCode } from "./I2CSpeedCode.js";
import { I2CWriteStatus } from "./I2CWriteStatus.js";
import { PidCoefficients } from "./PidCoefficients.js";
import { MotorMode } from "./MotorMode.js";
import { DigitalState } from "./digital-state.js";

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
    readVersionString(): Promise<string>;
    readVersion(): Promise<Version>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<void>;
    getFTDIResetControl(): Promise<boolean>;

    // DIO
    setDigitalOutput(dioPin: number, value: DigitalState): Promise<void>;
    setAllDigitalOutputs(bitPackedField: number): Promise<void>;

    /**
     * Set a digital pin as input or output.
     * @param digitalChannel
     * @param direction
     */
    setDigitalDirection(digitalChannel: number, direction: DioDirection): Promise<void>;

    /**
     * Get the Input/Output direction of a digital channel
     * @param digitalChannel
     */
    getDigitalDirection(digitalChannel: number): Promise<DioDirection>;

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

    /**
     * Read a single byte from a target device. Use {@link getI2CReadStatus} to
     * get the actual byte.
     * @param i2cChannel
     * @param targetAddress the address of the target device
     */
    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<number>;

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
    ): Promise<number[]>;

    /**
     * Send a write command to a given target requesting data at a given register.
     * @param i2cChannel
     * @param targetAddress the address of the target device
     * @param numBytesToRead size of data to read
     * @param register a byte to send at the start of the payload, typically a register address.
     */
    readI2CRegister(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        register: number,
    ): Promise<number[]>;

    // Motor
    /**
     * Configure a specific motor
     * @param motorChannel
     * @param motorMode
     * @param floatAtZero whether to coast when power is set to 0. If this is
     * set to true, the motor will brake at 0 instead.
     */
    setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void>;

    /**
     * Get the configuration for a specific motor
     * @param motorChannel
     */
    getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: MotorMode; floatAtZero: boolean }>;

    /**
     * Enable a motor. The motor must be configured before enabling.
     * @param motorChannel
     * @param enable
     */
    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void>;

    /**
     * Check whether a motor channel is currently enabled
     * @param motorChannel
     */
    getMotorChannelEnable(motorChannel: number): Promise<boolean>;

    /**
     * Set the current level in mA that will trigger the current alert for a given motor channel
     * @param motorChannel
     * @param currentLimit_mA Current level in mA that will trigger the current alert
     */
    setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void>;

    /**
     * Get the current level in mA that will trigger the current alert for a given motor channel
     * @param motorChannel
     */
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;

    /**
     * Reset motor position to 0 counts.
     * @param motorChannel
     */
    resetMotorEncoder(motorChannel: number): Promise<void>;

    /**
     * Set the power for a motor. Assumes the current motor mode is
     * 'constant power'
     * @param motorChannel the motor
     * @param powerLevel power in range [-1,1]
     */
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void>;

    /**
     * Get the current constant power setting for a motor. Assumes the current
     * motor mode is 'constant power'
     * @param motorChannel
     */
    getMotorConstantPower(motorChannel: number): Promise<number>;

    /**
     * Set the target velocity for a motor. Assumes the current motor
     * mode is 'target velocity' or 'position target'
     * @param motorChannel the motor
     * @param velocity_cps velocity in encoder counts per second
     */
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void>;

    /**
     * Get the current target velocity for a motor. Assumes the current motor
     * mode is 'target velocity'
     * @param motorChannel
     */
    getMotorTargetVelocity(motorChannel: number): Promise<number>;

    /**
     * Set the target position for a motor. Assumes the motor mode is
     * 'position target' and a velocity has been set using setMotorTargetVelocity.
     * @param motorChannel
     * @param targetPositionCounts target position in encoder counts
     * @param targetToleranceCounts how far the position can be from the target
     * and still considered 'at target'
     */
    setMotorTargetPosition(
        motorChannel: number,
        targetPositionCounts: number,
        targetToleranceCounts: number,
    ): Promise<void>;

    /**
     * Get the current target position for a motor. Assumes the current motor
     * mode is 'position target'
     * @param motorChannel
     */
    getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }>;

    /**
     * Check if a motor has reached its target
     * @param motorChannel
     */
    getMotorAtTarget(motorChannel: number): Promise<boolean>;

    /**
     * Get the current encoder counts for a motor
     * @param motorChannel
     */
    getMotorEncoderPosition(motorChannel: number): Promise<number>;

    /**
     * Set the current PID coefficients for a motor
     * @param motorChannel
     * @param motorMode
     * @param pid
     */
    setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
    ): Promise<void>;

    /**
     * Get the current PID coefficients for a motor
     * @param motorChannel
     * @param motorMode
     */
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
