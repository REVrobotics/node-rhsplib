import { NackCode, NativeRevHub, Serial as SerialPort } from "@rev-robotics/rhsplib";
import {
    BulkInputData,
    ClosedLoopControlAlgorithm,
    DebugGroup,
    DigitalChannelDirection,
    DigitalState,
    ExpansionHub,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LedPattern,
    ModuleInterface,
    ModuleStatus,
    MotorMode,
    NoExpansionHubWithAddressError,
    ParameterOutOfRangeError,
    I2cOperationInProgressError,
    ParentRevHub,
    PidCoefficients,
    PidfCoefficients,
    RevHub,
    RevHubType,
    Rgb,
    TimeoutError,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rev-hub-core";
import { closeSerialPort } from "../open-rev-hub.js";
import { EventEmitter } from "events";
import { startKeepAlive } from "../start-keep-alive.js";
import { convertErrorPromise, convertErrorSync } from "./error-conversion.js";
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

        //Closing a parent closes the serial port and all children
        if (this.isParent()) {
            this.children.forEach((child) => {
                if (child.isExpansionHub()) {
                    child.close();
                }
            });
            if (this.serialPort) closeSerialPort(this.serialPort);
        }
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

    getAllDigitalInputs(): Promise<number> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalAllInputs();
        });
    }

    async getDigitalDirection(digitalChannel: number): Promise<DigitalChannelDirection> {
        return await this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalDirection(digitalChannel);
        });
    }

    async getDigitalInput(digitalChannel: number): Promise<DigitalState> {
        return (await this.convertErrorPromise(() => {
            return this.nativeRevHub.getDigitalSingleInput(digitalChannel);
        }))
            ? DigitalState.HIGH
            : DigitalState.LOW;
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
    ): Promise<{ motorMode: MotorMode; floatAtZero: boolean }> {
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

    async setMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
        algorithm: ClosedLoopControlAlgorithm,
        pid: PidCoefficients | PidfCoefficients,
    ): Promise<void> {
        await this.convertErrorPromise(async () => {
            await this.nativeRevHub.setMotorClosedLoopControlCoefficients(
                motorChannel,
                motorMode,
                algorithm,
                pid,
            );
        });
    }

    async getMotorClosedLoopControlCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
    ): Promise<PidfCoefficients | PidCoefficients> {
        let pid: any = await this.nativeRevHub.getMotorClosedLoopControlCoefficients(
            motorChannel,
            motorMode,
        );

        if (pid.algorithm === ClosedLoopControlAlgorithm.Pid) {
            return {
                p: pid.p,
                i: pid.i,
                d: pid.d,
                algorithm: ClosedLoopControlAlgorithm.Pid,
            };
        } else {
            return {
                p: pid.p,
                i: pid.i,
                d: pid.d,
                f: pid.f,
                algorithm: ClosedLoopControlAlgorithm.Pidf,
            };
        }
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
    ): Promise<number[]> {
        return this.convertErrorPromise(async () => {
            await this.nativeRevHub.readI2CMultipleBytes(
                i2cChannel,
                targetAddress,
                numBytesToRead,
            );
            while (true) {
                try {
                    let status: I2CReadStatus = await this.nativeRevHub.getI2CReadStatus(
                        i2cChannel,
                    );
                    return status.bytes;
                } catch (e) {
                    if (e! instanceof I2cOperationInProgressError) {
                        throw e;
                    }
                }
            }
        });
    }

    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<number> {
        return this.convertErrorPromise(async () => {
            await this.nativeRevHub.readI2CSingleByte(i2cChannel, targetAddress);
            while (true) {
                try {
                    let status: I2CReadStatus = await this.nativeRevHub.getI2CReadStatus(
                        i2cChannel,
                    );
                    return status.bytes[0];
                } catch (e) {
                    if (e! instanceof I2cOperationInProgressError) {
                        throw e;
                    }
                }
            }
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
        this.convertErrorSync(() => {
            this.nativeRevHub.setDestAddress(destAddress);
        });
    }

    setAllDigitalOutputs(bitPackedField: number): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalAllOutputs(bitPackedField);
        });
    }

    setDigitalDirection(
        digitalChannel: number,
        direction: DigitalChannelDirection,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalDirection(digitalChannel, direction);
        });
    }

    setDigitalOutput(digitalChannel: number, value: DigitalState): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setDigitalSingleOutput(
                digitalChannel,
                value.isHigh(),
            );
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
        motorMode: MotorMode,
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
        motorMode: MotorMode,
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

    setMotorPIDFCoefficients(
        motorChannel: number,
        motorMode: MotorMode,
        pidf: PidfCoefficients,
    ): Promise<void> {
        return this.convertErrorPromise(() => {
            return this.nativeRevHub.setMotorPIDFCoefficients(
                motorChannel,
                motorMode,
                pidf,
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

    readI2CRegister(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        register: number,
    ): Promise<number[]> {
        return this.convertErrorPromise(async () => {
            await this.nativeRevHub.writeI2CReadMultipleBytes(
                i2cChannel,
                targetAddress,
                numBytesToRead,
                register,
            );
            while (true) {
                try {
                    let status: I2CReadStatus = await this.nativeRevHub.getI2CReadStatus(
                        i2cChannel,
                    );
                    return status.bytes;
                } catch (e) {
                    if (e! instanceof I2cOperationInProgressError) {
                        throw e;
                    }
                }
            }
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
        return convertErrorPromise(this.serialNumber, block);
    }

    private convertErrorSync<T>(block: () => T): T {
        return convertErrorSync(this.serialNumber, block);
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
