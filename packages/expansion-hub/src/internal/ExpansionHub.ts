import { ExpansionHub } from "../ExpansionHub.js";
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
    NativeRevHub,
    RGB,
    Serial as SerialPort,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rhsplib";
import { closeSerialPort } from "../open-rev-hub.js";
import { ParentRevHub, RevHub } from "../RevHub.js";
import { EventEmitter } from "events";
import { RevHubType } from "../RevHubType.js";
import { nackCodeToError } from "../errors/nack-code-to-error.js";
import { ParameterOutOfRangeError } from "../errors/ParameterOutOfRangeError.js";
import { NoExpansionHubWithAddressError } from "../errors/NoExpansionHubWithAddressError.js";
import { SerialError } from "../errors/SerialError.js";
import { TimeoutError } from "../errors/TimeoutError.js";
import { RhspLibErrorCode } from "../errors/error-codes.js";

export class ExpansionHubInternal implements ExpansionHub {
    constructor(isParent: true, serial: SerialPort, serialNumber: string);
    constructor(isParent: false, serial: SerialPort);
    constructor(isParent: boolean, serialPort: SerialPort, serialNumber?: string) {
        this.nativeRevHub = new NativeRevHub();
        this.hubIsParent = isParent;
        this.serialNumber = serialNumber;
        this.serialPort = serialPort;
    }

    hubIsParent: boolean;
    serialPort: SerialPort;
    serialNumber: string | undefined;
    nativeRevHub: typeof NativeRevHub;
    moduleAddress!: number;
    private mutableChildren: RevHub[] = [];

    get children(): ReadonlyArray<RevHub> {
        return this.mutableChildren;
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
        //Closing a parent closes the serial port and all children
        if (this.isParent()) {
            if (this.serialPort) closeSerialPort(this.serialPort);
            this.children.forEach((child) => {
                if (child.isExpansionHub()) {
                    child.close();
                }
            });
        }

        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = undefined;
    }

    open(destAddress: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.open(this.serialPort, destAddress);
        });
    }

    get isOpen(): boolean {
        return this.convertErrorSync(() => {
            return this.nativeRevHub.isOpened();
        });
    }

    get responseTimeoutMs(): number {
        return this.convertErrorSync(() => {
            return this.nativeRevHub.getResponseTimeoutMs();
        });
    }

    set responseTimeoutMs(timeout: number) {
        this.convertErrorSync(() => {
            this.nativeRevHub.setResponseTimeoutMs(timeout);
        });
    }

    getADC(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC();
        });
    }

    getBulkInputData(): Promise<BulkInputData> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getBulkInputData();
        });
    }

    getDestAddress(): number {
        return this.convertErrorSync(() => {
            return this.nativeRevHub.getDestAddress();
        });
    }

    getDigitalAllInputs(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalAllInputs();
        });
    }

    getDigitalDirection(dioPin: number): Promise<DIODirection> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalDirection(dioPin);
        });
    }

    getDigitalSingleInput(dioPin: number): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalSingleInput(dioPin);
        });
    }

    getFTDIResetControl(): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getFTDIResetControl();
        });
    }

    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getI2CChannelConfiguration(i2cChannel);
        });
    }

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getI2CReadStatus(i2cChannel);
        });
    }

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getI2CWriteStatus(i2cChannel);
        });
    }

    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getInterfacePacketID(interfaceName, functionNumber);
        });
    }

    getModuleLedColor(): Promise<RGB> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getModuleLEDColor();
        });
    }

    getModuleLedPattern(): Promise<LEDPattern> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getModuleLEDPattern();
        });
    }

    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getModuleStatus(clearStatusAfterResponse);
        });
    }

    getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorAtTarget(motorChannel);
        });
    }

    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorChannelCurrentAlertLevel(motorChannel);
        });
    }

    getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorChannelEnable(motorChannel);
        });
    }

    getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorChannelMode(motorChannel);
        });
    }

    getMotorConstantPower(motorChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorConstantPower(motorChannel);
        });
    }

    getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorEncoderPosition(motorChannel);
        });
    }

    getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PIDCoefficients> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorPIDCoefficients(motorChannel, motorMode);
        });
    }

    getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorTargetPosition(motorChannel);
        });
    }

    getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getMotorTargetVelocity(motorChannel);
        });
    }

    getPWMConfiguration(pwmChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getPWMConfiguration(pwmChannel);
        });
    }

    getPWMEnable(pwmChannel: number): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getPWMEnable(pwmChannel);
        });
    }

    getPWMPulseWidth(pwmChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getPWMPulseWidth(pwmChannel);
        });
    }

    getPhoneChargeControl(): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getPhoneChargeControl();
        });
    }

    getServoConfiguration(servoChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getServoConfiguration(servoChannel);
        });
    }

    getServoEnable(servoChannel: number): Promise<boolean> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getServoEnable(servoChannel);
        });
    }

    getServoPulseWidth(servoChannel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getServoPulseWidth(servoChannel);
        });
    }

    injectDataLogHint(hintText: string): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.injectDataLogHint(hintText);
        });
    }

    queryInterface(interfaceName: string): Promise<ModuleInterface> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.queryInterface(interfaceName);
        });
    }

    readI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.readI2CMultipleBytes(
                i2cChannel,
                targetAddress,
                numBytesToRead,
            );
        });
    }

    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.readI2CSingleByte(i2cChannel, targetAddress);
        });
    }

    readVersion(): Promise<Version> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.readVersion();
        });
    }

    readVersionString(): Promise<string> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.readVersionString();
        });
    }

    resetMotorEncoder(motorChannel: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.resetMotorEncoder(motorChannel);
        });
    }

    sendFailSafe(): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.sendFailSafe();
        });
    }

    sendKeepAlive(): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.sendKeepAlive();
        });
    }

    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.sendReadCommand(packetTypeID, payload);
        });
    }

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.sendWriteCommand(packetTypeID, payload);
        });
    }

    setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDebugLogLevel(debugGroup, verbosityLevel);
        });
    }

    setDestAddress(destAddress: number): void {
        this.nativeRevHub.setDestAddress(destAddress);
    }

    setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalAllOutputs(bitPackedField);
        });
    }

    setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalDirection(dioPin, direction);
        });
    }

    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalSingleOutput(dioPin, value);
        });
    }

    setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setFTDIResetControl(ftdiResetControl);
        });
    }

    setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setI2CChannelConfiguration(i2cChannel, speedCode);
        });
    }

    setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setModuleLEDColor(red, green, blue);
        });
    }

    setModuleLedPattern(ledPattern: LEDPattern): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setModuleLEDPattern(ledPattern);
        });
    }

    setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorChannelCurrentAlertLevel(
                motorChannel,
                currentLimit_mA,
            );
        });
    }

    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorChannelEnable(motorChannel, enable);
        });
    }

    setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorChannelMode(
                motorChannel,
                motorMode,
                floatAtZero,
            );
        });
    }

    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorConstantPower(motorChannel, powerLevel);
        });
    }

    setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PIDCoefficients,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorPIDCoefficients(
                motorChannel,
                motorMode,
                pid,
            );
        });
    }

    setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorTargetPosition(
                motorChannel,
                targetPosition_counts,
                targetTolerance_counts,
            );
        });
    }

    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorTargetVelocity(motorChannel, velocity_cps);
        });
    }

    setNewModuleAddress(newModuleAddress: number): Promise<void> {
        this.moduleAddress = newModuleAddress;
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setNewModuleAddress(newModuleAddress);
        });
    }

    setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setPhoneChargeControl(chargeEnable);
        });
    }

    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoConfiguration(servoChannel, framePeriod);
        });
    }

    setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoEnable(servoChannel, enable);
        });
    }

    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoPulseWidth(servoChannel, pulseWidth);
        });
    }

    writeI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        bytes: number[],
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.writeI2CMultipleBytes(
                i2cChannel,
                targetAddress,
                bytes,
            );
        });
    }

    writeI2CReadMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.writeI2CReadMultipleBytes(
                i2cChannel,
                targetAddress,
                numBytesToRead,
                startAddress,
            );
        });
    }

    writeI2CSingleByte(
        i2cChannel: number,
        targetAddress: number,
        byte: number,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.writeI2CSingleByte(i2cChannel, targetAddress, byte);
        });
    }

    private async convertErrorPromise<T>(block: () => Promise<T>): Promise<T> {
        try {
            return await block();
        } catch (e: any) {
            throw this.createError(e);
        }
    }

    private convertErrorSync<T>(block: () => T): T {
        try {
            return block();
        } catch (e: any) {
            throw this.createError(e);
        }
    }

    private createError(e: any): any {
        if (e.errorCode == RhspLibErrorCode.TIMEOUT) {
            return new TimeoutError();
        }
        if (e.errorCode == RhspLibErrorCode.SERIAL_ERROR) {
            return new SerialError(this.serialNumber ?? "no serial number provided");
        }
        if (e.errorCode >= -55 && e.errorCode <= -50) {
            let index = -(e.errorCode + 50);
            return new ParameterOutOfRangeError(index);
        }
        if (e.nackCode !== undefined) {
            return nackCodeToError(e.nackCode);
        } else {
            return e;
        }
    }

    addChild(hub: RevHub): void {
        this.mutableChildren.push(hub);
    }

    async addChildByAddress(moduleAddress: number): Promise<RevHub> {
        let childHub = new ExpansionHubInternal(false, this.serialPort);

        try {
            await childHub.open(moduleAddress);
            await childHub.queryInterface("DEKA");
        } catch (e: any) {
            //errorCode = -2 indicates timeout
            if (e instanceof TimeoutError)
                throw new NoExpansionHubWithAddressError(
                    this.serialNumber!, //Can only call this method on parent, so serialNumber is not undefined.
                    moduleAddress,
                );
        }

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
