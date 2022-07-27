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
    open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): Promise<undefined>;
    close(): void;
    read(numBytesToRead: number): Promise<number[]>;
    write(bytes: number[]): Promise<undefined>;
}
export declare class RevHub {
    constructor();
    open(serialPort: Serial, destAddress: number): Promise<undefined>;
    isOpened(): boolean;
    close(): void;
    setDestAddress(destAddress: number): void;
    getDestAddress(): number;
    setResponseTimeoutMs(responseTimeoutMs: number): void;
    getResponseTimeoutMs(): number;
    sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<undefined>;
    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<undefined>;
    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]>;
    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus>;
    sendKeepAlive(): Promise<undefined>;
    sendFailSafe(): Promise<undefined>;
    setNewModuleAddress(newModuleAddress: number): Promise<undefined>;
    queryInterface(interfaceName: string): Promise<ModuleInterface>;
    setModuleLEDColor(red: number, green: number, blue: number): Promise<undefined>;
    getModuleLEDColor(): Promise<RGB>;
    setModuleLEDPattern(ledPattern: LEDPattern): Promise<undefined>;
    getModuleLEDPattern(): Promise<LEDPattern>;
    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<undefined>;
    static discoverRevHubs(serialPort: Serial): Promise<DiscoveredAddresses>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number>;
    getBulkInputData(): Promise<BulkInputData>;
    getADC(): Promise<number>;
    setPhoneChargeControl(chargeEnable: boolean): Promise<undefined>;
    getPhoneChargeControl(): Promise<boolean>;
    injectDataLogHint(hintText: string): Promise<undefined>;
    readVersionString(): Promise<string>;
    readVersion(): Promise<Version>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<undefined>;
    getFTDIResetControl(): Promise<boolean>;
    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<undefined>;
    setDigitalAllOutputs(bitPackedField: number): Promise<undefined>;
    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<undefined>;
    getDigitalDirection(dioPin: number): Promise<DIODirection>;
    getDigitalSingleInput(dioPin: number): Promise<boolean>;
    getDigitalAllInputs(): Promise<number>;
    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<undefined>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode>;
    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<undefined>;
    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<undefined>;
    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus>;
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<undefined>;
    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<undefined>;
    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<undefined>;
    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus>;
    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<undefined>;
    getMotorChannelMode(motorChannel: number): Promise<{
        motorMode: number;
        floatAtZero: boolean;
    }>;
    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<undefined>;
    getMotorChannelEnable(motorChannel: number): Promise<boolean>;
    setMotorChannelCurrentAlertLevel(motorChannel: number, currentLimit_mA: number): Promise<undefined>;
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number>;
    resetMotorEncoder(motorChannel: number): Promise<undefined>;
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<undefined>;
    getMotorConstantPower(motorChannel: number): Promise<number>;
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<undefined>;
    getMotorTargetVelocity(motorChannel: number): Promise<number>;
    setMotorTargetPosition(motorChannel: number, targetPosition_counts: number, targetTolerance_counts: number): Promise<undefined>;
    getMotorTargetPosition(motorChannel: number): Promise<{
        targetPosition: number;
        targetTolerance: number;
    }>;
    getMotorAtTarget(motorChannel: number): Promise<boolean>;
    getMotorEncoderPosition(motorChannel: number): Promise<number>;
    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<undefined>;
    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<PIDCoefficients>;
    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<undefined>;
    getPWMConfiguration(pwmChannel: number): Promise<number>;
    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<undefined>;
    getPWMPulseWidth(pwmChannel: number): Promise<number>;
    setPWMEnable(pwmChannel: number, enable: boolean): Promise<undefined>;
    getPWMEnable(pwmChannel: number): Promise<boolean>;
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<undefined>;
    getServoConfiguration(servoChannel: number): Promise<number>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<undefined>;
    getServoPulseWidth(servoChannel: number): Promise<number>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<undefined>;
    getServoEnable(servoChannel: number): Promise<boolean>;
}
