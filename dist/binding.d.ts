export declare enum SerialParity {
    None = 0,
    Odd = 1,
    Even = 2
}
export declare enum SerialFlowControl {
    None = 0,
    Hardware = 1,
    Software = 2
}
export declare enum DebugGroup {
    Main = 1,
    TransmitterToHost = 2,
    ReceiverFromHost = 3,
    ADC = 4,
    PWMAndServo = 5,
    ModuleLED = 6,
    DigitalIO = 7,
    I2C = 8,
    Motor0 = 9,
    Motor1 = 10,
    Motor2 = 11,
    Motor3 = 12
}
export declare enum VerbosityLevel {
    Off = 0,
    Level1 = 1,
    Level2 = 2,
    Level3 = 3
}
export declare enum DIODirection {
    Input = 0,
    Output = 1
}
export declare enum I2CSpeedCode {
    SpeedCode100_Kbps = 0,
    SpeedCode400_Kbps = 1
}
export interface ModuleStatus {
    statusWord: number;
    motorAlerts: number;
}
export interface ModuleInterface {
    name: string;
    firstPacketID: number;
    numberIDValues: number;
}
export interface RGB {
    red: number;
    green: number;
    blue: number;
}
export interface LEDPattern {
    rgbtPatternStep0: number;
    rgbtPatternStep1: number;
    rgbtPatternStep2: number;
    rgbtPatternStep3: number;
    rgbtPatternStep4: number;
    rgbtPatternStep5: number;
    rgbtPatternStep6: number;
    rgbtPatternStep7: number;
    rgbtPatternStep8: number;
    rgbtPatternStep9: number;
    rgbtPatternStep10: number;
    rgbtPatternStep11: number;
    rgbtPatternStep12: number;
    rgbtPatternStep13: number;
    rgbtPatternStep14: number;
    rgbtPatternStep15: number;
}
export interface DiscoveredAddresses {
    parentAddress: number;
    childAddresses: number[];
    numberOfChildModules: number;
}
export interface BulkInputData {
    digitalInputs: number;
    motor0position_enc: number;
    motor1position_enc: number;
    motor2position_enc: number;
    motor3position_enc: number;
    motorStatus: number;
    motor0velocity_cps: number;
    motor1velocity_cps: number;
    motor2velocity_cps: number;
    motor3velocity_cps: number;
    analog0_mV: number;
    analog1_mV: number;
    analog2_mV: number;
    analog3_mV: number;
    attentionRequired: number;
}
export interface Version {
    engineeringRevision: number;
    minorVersion: number;
    majorVersion: number;
    minorHwRevision: number;
    majorHwRevision: number;
    hwType: number;
}
export interface I2CWriteStatus {
    i2cTransactionStatus: number;
    numBytesWritten: number;
}
export interface I2CReadStatus {
    i2cTransactionStatus: number;
    numBytesRead: number;
    bytes: number[];
}
export interface PIDCoefficients {
    P: number;
    I: number;
    D: number;
}
export declare class Serial {
    constructor();
    open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): Promise<void>;
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
    getModuleLEDColor(): Promise<RGB>;
    setModuleLEDPattern(ledPattern: LEDPattern): Promise<void>;
    getModuleLEDPattern(): Promise<LEDPattern>;
    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<void>;
    static discoverRevHubs(serialPort: Serial): Promise<DiscoveredAddresses>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;
    getBulkInputData(): Promise<BulkInputData>;
    getADC(): Promise<number>;
    setPhoneChargeControl(chargeEnable: boolean): Promise<void>;
    getPhoneChargeControl(): Promise<boolean>;
    injectDataLogHint(hintText: string): Promise<void>;
    readVersionString(): Promise<string>;
    readVersion(): Promise<Version>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<void>;
    getFTDIResetControl(): Promise<boolean>;
    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void>;
    setDigitalAllOutputs(bitPackedField: number): Promise<void>;
    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void>;
    getDigitalDirection(dioPin: number): Promise<DIODirection>;
    getDigitalSingleInput(dioPin: number): Promise<boolean>;
    getDigitalAllInputs(): Promise<number>;
    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<void>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;
    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<void>;
    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<void>;
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void>;
    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<void>;
    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<void>;
    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;
    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<void>;
    getMotorChannelMode(motorChannel: number): Promise<{
        motorMode: number;
        floatAtZero: boolean;
    }>;
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
    getMotorTargetPosition(motorChannel: number): Promise<{
        targetPosition: number;
        targetTolerance: number;
    }>;
    getMotorAtTarget(motorChannel: number): Promise<boolean>;
    getMotorEncoderPosition(motorChannel: number): Promise<number>;
    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<void>;
    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<PIDCoefficients>;
    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<void>;
    getPWMConfiguration(pwmChannel: number): Promise<number>;
    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<void>;
    getPWMPulseWidth(pwmChannel: number): Promise<number>;
    setPWMEnable(pwmChannel: number, enable: boolean): Promise<void>;
    getPWMEnable(pwmChannel: number): Promise<boolean>;
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<void>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}
