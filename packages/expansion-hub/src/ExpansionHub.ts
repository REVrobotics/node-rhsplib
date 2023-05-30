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
import { MotorMode } from "./MotorMode.js";
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
    /**
     * Configure a specific motor
     * @param motorChannel
     * @param motorMode
     * @param floatAtZero whether to coast when power is set to 0. If this is set to true, the motor will brake at 0 instead.
     */
    setMotorChannelMode(
        motorChannel: number,
        motorMode: MotorMode,
        floatAtZero: boolean,
    ): Promise<void>;

    /**
     *
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
    setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void>;

    /**
     * Get the present current alert (mA)
     * @param motorChannel
     */
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;
    resetMotorEncoder(motorChannel: number): Promise<void>;

    /**
     * Set the power for a motor
     * @param motorChannel the motor
     * @param powerLevel power in range [-1,1]
     */
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void>;

    /**
     * Get the current constant power setting for a motor
     * @param motorChannel
     */
    getMotorConstantPower(motorChannel: number): Promise<number>;

    /**
     * Set the target velocity for a motor
     * @param motorChannel the motor
     * @param velocity_cps velocity in encoder counts per second
     */
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void>;

    /**
     * Get the current target velocity for a motor
     * @param motorChannel
     */
    getMotorTargetVelocity(motorChannel: number): Promise<number>;
    setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void>;

    /**
     * Get the current target position for a motor
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
        motorMode: MotorMode,
        pid: PIDCoefficients,
    ): Promise<void>;

    /**
     * Get the current PID coefficients for a motor
     * @param motorChannel
     * @param motorMode
     */
    getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
    ): Promise<PIDCoefficients>;

    // Servo
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}
