import { ExpansionHub, ParentRevHub, RevHub } from "@rev-robotics/rev-hub-core";
import {
    NativeRevHub,
    Serial as SerialPort,
    RhspLibErrorCode,
    NackCode,
} from "@rev-robotics/rhsplib";
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
    TimeoutError,
    nackCodeToError,
    NoExpansionHubWithAddressError,
    ParameterOutOfRangeError,
    GeneralSerialError,
    CommandNotSupportedError,
} from "@rev-robotics/rev-hub-core";
import { closeSerialPort } from "../open-rev-hub.js";
import { EventEmitter } from "events";
import { RevHubType } from "@rev-robotics/rev-hub-core";
import { RhspLibError } from "../errors/RhspLibError.js";
import { startKeepAlive } from "../start-keep-alive.js";
import { performance } from "perf_hooks";

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

    type: RevHubType = RevHubType.ExpansionHub;
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
        this.moduleAddress = destAddress;
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

    async getAnalogInput(channel: number): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(channel, 0);
        });
    }

    async getI2CCurrent(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(5, 0);
        });
    }

    async getDigitalBusCurrent(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(4, 0);
        });
    }

    async getServoCurrent(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(6, 0);
        });
    }

    async getBatteryCurrent(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(7, 0);
        });
    }

    async getMotorCurrent(motorChannel: number): Promise<number> {
        if (motorChannel > 3 || motorChannel < 0) {
            throw new ParameterOutOfRangeError(NackCode.PARAMETER_OUT_OF_RANGE_START + 1);
        }
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(motorChannel + 8, 0);
        });
    }

    async getBatteryVoltage(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(13, 0);
        });
    }

    async get5VBusVoltage(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(12, 0);
        });
    }

    async getTemperature(): Promise<number> {
        let deciCelsius: number = await this.convertErrorPromise(() => {
            return this.nativeRevHub.getADC(14, 0);
        });

        return deciCelsius / 10;
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

    getDigitalDirection(dioPin: number): Promise<DioDirection> {
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

    getModuleLedColor(): Promise<Rgb> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getModuleLEDColor();
        });
    }

    getModuleLedPattern(): Promise<LedPattern> {
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
    ): Promise<PidCoefficients> {
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

    setDigitalDirection(dioPin: number, direction: DioDirection): Promise<void> {
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

    setModuleLedPattern(ledPattern: LedPattern): Promise<void> {
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

    /**
     * Set the power for a motor
     * @param motorChannel the motor
     * @param powerLevel power in range [-100,100]
     */
    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorConstantPower(
                motorChannel,
                powerLevel * 327.67,
            );
        });
    }

    setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
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

    setServoConfiguration(servoChannel: number, framePeriod_us: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoConfiguration(servoChannel, framePeriod_us);
        });
    }

    setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoEnable(servoChannel, enable);
        });
    }

    setServoPulseWidth(servoChannel: number, pulseWidth_us: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setServoPulseWidth(servoChannel, pulseWidth_us);
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
        if (e.errorCode == RhspLibErrorCode.GENERAL_ERROR) {
            return new RhspLibError("General RHSPlib error");
        } else if (e.errorCode == RhspLibErrorCode.MSG_NUMBER_MISMATCH) {
            return new RhspLibError("Message Number Mismatch");
        } else if (e.errorCode == RhspLibErrorCode.NOT_OPENED) {
            return new RhspLibError("Hub is not opened");
        } else if (e.errorCode == RhspLibErrorCode.COMMAND_NOT_SUPPORTED) {
            return new CommandNotSupportedError();
        } else if (e.errorCode == RhspLibErrorCode.UNEXPECTED_RESPONSE) {
            return new RhspLibError("Unexpected packet received");
        } else if (e.errorCode == RhspLibErrorCode.TIMEOUT) {
            return new TimeoutError();
        } else if (e.errorCode == RhspLibErrorCode.SERIAL_ERROR) {
            return new GeneralSerialError(
                this.serialNumber ?? "no serial number provided",
            );
        } else if (
            e.errorCode >= RhspLibErrorCode.ARG_OUT_OF_RANGE_END &&
            e.errorCode <= RhspLibErrorCode.ARG_OUT_OF_RANGE_START
        ) {
            let index = -e.errorCode + RhspLibErrorCode.ARG_OUT_OF_RANGE_START;
            return new ParameterOutOfRangeError(index);
        } else if (e.nackCode !== undefined) {
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
            // If discovery has not occurred on the hub, then we will
            // need to send keep-alive signals until the hub responds.
            // If we don't do this, the hub will be stuck waiting to
            // find out if it's a parent or child and won't respond.
            let startTime = performance.now();
            while (true) {
                try {
                    if (performance.now() - startTime >= 1000) break;
                    await childHub.sendKeepAlive();
                    break;
                } catch (e) {}
            }
            await childHub.queryInterface("DEKA");
        } catch (e: any) {
            console.log(e);
            if (e instanceof TimeoutError)
                throw new NoExpansionHubWithAddressError(
                    this.serialNumber!, //Can only call this method on parent, so serialNumber is not undefined.
                    moduleAddress,
                );
        }

        if (childHub.isExpansionHub()) {
            startKeepAlive(childHub as ExpansionHubInternal, 1000);
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
