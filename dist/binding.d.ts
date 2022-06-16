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
    open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): void;
    close(): void;
    read(numBytesToRead: number): number[];
    write(bytes: number[]): void;
}
export declare class RHSPlib {
    constructor();
    open(serialPort: Serial, destAddress: number): Promise<{
        resultCode: number;
    }>;
    isOpened(): boolean;
    close(): void;
    setDestAddress(destAddress: number): void;
    getDestAddress(): number;
    setResponseTimeoutMs(responseTimeoutMs: number): void;
    getResponseTimeoutMs(): number;
    sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<{
        resultCode: number;
    }>;
    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<{
        value?: number[];
        resultCode: number;
    }>;
    sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<{
        resultCode: number;
    }>;
    sendReadCommand(packetTypeID: number, payload: number[]): Promise<{
        value?: number[];
        resultCode: number;
    }>;
    getModuleStatus(clearStatusAfterResponse: boolean): Promise<{
        value?: ModuleStatus;
        resultCode: number;
    }>;
    sendKeepAlive(): Promise<{
        resultCode: number;
    }>;
    sendFailSafe(): Promise<{
        resultCode: number;
    }>;
    setNewModuleAddress(newModuleAddress: number): Promise<{
        resultCode: number;
    }>;
    queryInterface(interfaceName: string): Promise<{
        value?: ModuleInterface;
        resultCode: number;
    }>;
    setModuleLEDColor(red: number, green: number, blue: number): Promise<{
        resultCode: number;
    }>;
    getModuleLEDColor(): Promise<{
        value?: RGB;
        resultCode: number;
    }>;
    setModuleLEDPattern(ledPattern: LEDPattern): Promise<{
        resultCode: number;
    }>;
    getModuleLEDPattern(): Promise<{
        value?: LEDPattern;
        resultCode: number;
    }>;
    setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<{
        resultCode: number;
    }>;
    discovery(serialPort: Serial): Promise<{
        value?: DiscoveredAddresses;
        resultCode: number;
    }>;
    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    getBulkInputData(): Promise<{
        value?: BulkInputData;
        resultCode: number;
    }>;
    getADC(): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setPhoneChargeControl(chargeEnable: boolean): Promise<{
        resultCode: number;
    }>;
    getPhoneChargeControl(): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    injectDataLogHint(hintText: string): Promise<{
        resultCode: number;
    }>;
    readVersionString(): Promise<{
        value?: string;
        resultCode: number;
    }>;
    readVersion(): Promise<{
        value?: Version;
        resultCode: number;
    }>;
    setFTDIResetControl(ftdiResetControl: boolean): Promise<{
        resultCode: number;
    }>;
    getFTDIResetControl(): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<{
        resultCode: number;
    }>;
    setDigitalAllOutputs(bitPackedField: number): Promise<{
        resultCode: number;
    }>;
    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<{
        resultCode: number;
    }>;
    getDigitalDirection(dioPin: number): Promise<{
        value?: DIODirection;
        resultCode: number;
    }>;
    getDigitalSingleInput(dioPin: number): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    getDigitalAllInputs(): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setI2CChannelConfiguration(i2cChannel: number, speedCode: I2CSpeedCode): Promise<{
        resultCode: number;
    }>;
    getI2CChannelConfiguration(i2cChannel: number): Promise<{
        value?: I2CSpeedCode;
        resultCode: number;
    }>;
    writeI2CSingleByte(i2cChannel: number, slaveAddress: number, byte: number): Promise<{
        resultCode: number;
    }>;
    writeI2CMultipleBytes(i2cChannel: number, slaveAddress: number, bytes: number[]): Promise<{
        resultCode: number;
    }>;
    getI2CWriteStatus(i2cChannel: number): Promise<{
        value?: I2CWriteStatus;
        resultCode: number;
    }>;
    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<{
        resultCode: number;
    }>;
    readI2CMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number): Promise<{
        resultCode: number;
    }>;
    writeI2CReadMultipleBytes(i2cChannel: number, slaveAddress: number, numBytesToRead: number, startAddress: number): Promise<{
        resultCode: number;
    }>;
    getI2CReadStatus(i2cChannel: number): Promise<{
        value?: I2CReadStatus;
        resultCode: number;
    }>;
    setMotorChannelMode(motorChannel: number, motorMode: number, floatAtZero: boolean): Promise<{
        resultCode: number;
    }>;
    getMotorChannelMode(motorChannel: number): Promise<{
        value?: {
            motorMode: number;
            floatAtZero: boolean;
        };
        resultCode: number;
    }>;
    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<{
        resultCode: number;
    }>;
    getMotorChannelEnable(motorChannel: number): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    setMotorChannelCurrentAlertLevel(motorChannel: number, currentLimit_mA: number): Promise<{
        resultCode: number;
    }>;
    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    resetMotorEncoder(motorChannel: number): Promise<{
        resultCode: number;
    }>;
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<{
        resultCode: number;
    }>;
    getMotorConstantPower(motorChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<{
        resultCode: number;
    }>;
    getMotorTargetVelocity(motorChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setMotorTargetPosition(motorChannel: number, targetPosition_counts: number, targetTolerance_counts: number): Promise<{
        resultCode: number;
    }>;
    getMotorTargetPosition(motorChannel: number): Promise<{
        value?: {
            targetPosition: number;
            targetTolerance: number;
        };
        resultCode: number;
    }>;
    getMotorAtTarget(motorChannel: number): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    getMotorEncoderPosition(motorChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setMotorPIDCoefficients(motorChannel: number, motorMode: number, pid: PIDCoefficients): Promise<{
        resultCode: number;
    }>;
    getMotorPIDCoefficients(motorChannel: number, motorMode: number): Promise<{
        value?: PIDCoefficients;
        resultCode: number;
    }>;
    setPWMConfiguration(pwmChannel: number, framePeriod: number): Promise<{
        resultCode: number;
    }>;
    getPWMConfiguration(pwmChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setPWMPulseWidth(pwmChannel: number, pulseWidth: number): Promise<{
        resultCode: number;
    }>;
    getPWMPulseWidth(pwmChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setPWMEnable(pwmChannel: number, enable: boolean): Promise<{
        resultCode: number;
    }>;
    getPWMEnable(pwmChannel: number): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<{
        resultCode: number;
    }>;
    getServoConfiguration(servoChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<{
        resultCode: number;
    }>;
    getServoPulseWidth(servoChannel: number): Promise<{
        value?: number;
        resultCode: number;
    }>;
    setServoEnable(servoChannel: number, enable: boolean): Promise<{
        resultCode: number;
    }>;
    getServoEnable(servoChannel: number): Promise<{
        value?: boolean;
        resultCode: number;
    }>;
}
