import {ExpansionHub} from "../ExpansionHub";
import {
    BulkInputData, DebugGroup,
    DIODirection,
    I2CReadStatus,
    I2CSpeedCode, I2CWriteStatus, LEDPattern, ModuleInterface, ModuleStatus, PIDCoefficients,
    RevHub as NativeRevHub, RGB,
    Serial, VerbosityLevel, Version
} from "@rev-robotics/rhsplib"
import {RevHubType} from "../RevHubType";
import {ParentRevHub, RevHub} from "../RevHub";
import {EventEmitter} from "events";

export class ExpansionHubInternal implements ExpansionHub {
    constructor(isParent: true, serialNumber: string);
    constructor(isParent: false);
    constructor(isParent: boolean, serialNumber?: string) {
        this.nativeRevHub = new NativeRevHub();
        this.hubIsParent = isParent;
        this.serialNumber = serialNumber;
    }

    hubIsParent: boolean;
    serialPort!: Serial;
    serialNumber: string | undefined;
    nativeRevHub: NativeRevHub;
    moduleAddress!: number
    private mutableChildren: RevHub[] = [];

    get children(): ReadonlyArray<RevHub> {
        return this.mutableChildren
    }

    keepAliveTimer?: NodeJS.Timer;
    type = RevHubType.ExpansionHub;
    private emitter = new EventEmitter();

    isParent(): this is ParentRevHub {
        return this.hubIsParent;
    }

    isExpansionHub(): this is ExpansionHub {
        return true;
    }

    close(): void {
        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = undefined;
    }

    open(serialPort: Serial, destAddress: number): Promise<void> {
        this.serialPort = serialPort;
        this.moduleAddress = destAddress;
        return this.nativeRevHub.open(serialPort, destAddress);
    }

    get isOpen(): boolean {
        return this.nativeRevHub.isOpened();
    }

    get responseTimeoutMs(): number {
        return this.nativeRevHub.getResponseTimeoutMs();
    }

    set responseTimeoutMs(timeout: number) {
        this.nativeRevHub.setResponseTimeoutMs(timeout);
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

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.nativeRevHub.sendWriteCommand(packetTypeID, payload);
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
        this.moduleAddress = newModuleAddress;
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

    addChild(hub: RevHub): void {
        this.mutableChildren.push(hub);
    }

    async addChildByAddress(moduleAddress: number): Promise<RevHub> {
        if (this.serialPort === undefined) {
            throw new Error("Parent hub is not initialized. Can't add child.")
        }
        let childHub = new ExpansionHubInternal(false);
        await childHub.open(this.serialPort!, moduleAddress);
        await childHub.queryInterface("DEKA");

        this.addChild(childHub);

        return childHub;
    }

    /**
     * Listen for errors that do not happen as a result of a specific function call
     *
     * @param eventName
     * @param listener
     */
    on(eventName: "error", listener: (error: Error) => void): RevHub {
        this.emitter.on(eventName, listener);
        return this;
    }

    emitError(error: Error) {
        this.emitter.emit("error", error);
    }
}
