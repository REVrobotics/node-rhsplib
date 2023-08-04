import axios from "axios";
import semver from "semver";
import WebSocket from "isomorphic-ws";
import {
    BulkInputData,
    ClosedLoopControlAlgorithm,
    ControlHub,
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
    ParentExpansionHub,
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
import { clearTimeout } from "timers";
import { ControlHubConnectedExpansionHub } from "./ControlHubConnectedExpansionHub.js";

export class ControlHubInternal implements ControlHub {
    readonly isOpen: boolean = true;
    readonly moduleAddress: number = 173;
    responseTimeoutMs: number = 0;
    type: RevHubType = RevHubType.ControlHub;
    readonly serialNumber: string;

    /**
     * All children connected over USB, as well as the one embedded hub.
     */
    readonly children: RevHub[] = [];

    /**
     * All children connected over USB.
     */
    readonly usbChildren: RevHub[] = [];

    private id: any | null;
    private keyGenerator = 0;

    private supportedManualControlMajorVersion = 0;
    private supportedManualControlMinorVersion = 1;

    /**
     * Whether the websocket is currently open.
     */
    isConnected = false;

    /**
     * The board for this control hub. All Expansion Hub commands go through
     * this delegate.
     */
    private embedded!: ControlHubConnectedExpansionHub;

    private webSocketConnection!: WebSocket;
    private currentActiveCommands = new Map<
        any,
        (response: any | undefined, error: any | undefined) => void
    >();

    constructor(serialNumber: string) {
        this.serialNumber = serialNumber;
    }

    async setDigitalOutput(digitalChannel: number, value: DigitalState): Promise<void> {
        await this.embedded.setDigitalOutput(digitalChannel, value);
    }
    async setAllDigitalOutputs(bitPackedField: number): Promise<void> {
        await this.embedded.setAllDigitalOutputs(bitPackedField);
    }

    getAllDigitalInputs(): Promise<number> {
        return this.embedded.getAllDigitalInputs();
    }

    async getDigitalInput(digitalChannel: number): Promise<DigitalState> {
        return await this.embedded.getDigitalInput(digitalChannel);
    }

    isParent(): this is ParentRevHub {
        return true;
    }

    async open(ip: string, port: number): Promise<void> {
        this.webSocketConnection = new WebSocket(`ws://${ip}:${port}`);

        this.webSocketConnection.on("message", (data) => {
            let rawMessage = JSON.parse(data.toString());

            if (rawMessage.commandKey !== undefined) {
                let key = rawMessage.commandKey;
                let callback = this.currentActiveCommands.get(key);

                let response = rawMessage.response
                    ? JSON.parse(rawMessage.response)
                    : undefined;
                let error = rawMessage.error ? JSON.parse(rawMessage.error) : undefined;

                if (callback) {
                    callback(response, error);
                }
            }
        });

        this.webSocketConnection.on("close", () => {
            console.log(`Connection was closed`);
            this.isConnected = false;
        });

        this.webSocketConnection.on("error", (_: WebSocket, err: Error) => {
            console.log("Websocket error");
            console.log(err);
            this.isConnected = false;
        });

        return new Promise((resolve, reject) => {
            this.webSocketConnection.on("open", async () => {
                this.isConnected = true;
                await this.subscribe();
                let apiVersion: { majorVersion: number; minorVersion: number } =
                    await this.sendCommand("start", {});

                this.id = await this.openHub("(embedded)", this.moduleAddress);

                this.embedded = new ControlHubConnectedExpansionHub(
                    true,
                    RevHubType.ControlHub,
                    this.sendCommand.bind(this),
                    "(embedded)",
                    this.moduleAddress,
                    this.id,
                );

                if (
                    apiVersion.majorVersion !== this.supportedManualControlMajorVersion ||
                    apiVersion.minorVersion < this.supportedManualControlMinorVersion
                ) {
                    reject(
                        new Error(
                            `API Version ${apiVersion.majorVersion}.${apiVersion.minorVersion} is not supported`,
                        ),
                    );
                }

                resolve();
            });
        });
    }

    async isWiFiConnected(): Promise<boolean> {
        try {
            let response = await axios.get("http://192.168.43.1:8080/js/rcInfo.json", {
                timeout: 1000,
            });
            if (response.data) {
                let rcVersion: string | undefined = response.data.sdkVersion;
                if(rcVersion === undefined) {
                    return false;
                }
                return semver.satisfies(rcVersion, ">=8.2");
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    async subscribe(): Promise<void> {
        let payload = {
            namespace: "system",
            type: "subscribeToNamespace",
            payload: "MC",
        };
        this.webSocketConnection.send(JSON.stringify(payload));
    }

    async openHub(
        serialNumber: string,
        parentAddress: number,
        address: number = parentAddress,
    ): Promise<any> {
        return await this.sendCommand("openHub", {
            parentSerialNumber: serialNumber,
            parentHubAddress: parentAddress,
            hubAddress: address,
        });
    }

    close() {
        this.embedded.close();
        this.sendCommand("stop", {}).then(() => this.webSocketConnection.close());
    }

    async getAnalogInput(channel: number): Promise<number> {
        return this.embedded.getAnalogInput(channel);
    }

    async get5VBusVoltage(): Promise<number> {
        return this.embedded.get5VBusVoltage();
    }

    async getBatteryCurrent(): Promise<number> {
        return this.embedded.getBatteryCurrent();
    }

    async getBatteryVoltage(): Promise<number> {
        return this.embedded.getBatteryVoltage();
    }

    async getDigitalBusCurrent(): Promise<number> {
        return this.embedded.getDigitalBusCurrent();
    }

    async getI2CCurrent(): Promise<number> {
        return this.embedded.getI2CCurrent();
    }

    async getMotorCurrent(motorChannel: number): Promise<number> {
        return this.embedded.getMotorCurrent(motorChannel);
    }

    async getServoCurrent(): Promise<number> {
        return this.embedded.getServoCurrent();
    }

    async getTemperature(): Promise<number> {
        return this.embedded.getTemperature();
    }

    async getBulkInputData(): Promise<BulkInputData> {
        return this.embedded.getBulkInputData();
    }

    async getDigitalAllInputs(): Promise<number> {
        return this.embedded.getAllDigitalInputs();
    }

    async getDigitalDirection(dioPin: number): Promise<DigitalChannelDirection> {
        return this.embedded.getDigitalDirection(dioPin);
    }

    async getFTDIResetControl(): Promise<boolean> {
        return this.embedded.getFTDIResetControl();
    }

    async getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        return this.embedded.getI2CChannelConfiguration(i2cChannel);
    }

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus> {
        return this.embedded.getI2CReadStatus(i2cChannel);
    }

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus> {
        return this.embedded.getI2CWriteStatus(i2cChannel);
    }

    async getInterfacePacketID(
        interfaceName: string,
        functionNumber: number,
    ): Promise<number> {
        return this.embedded.getInterfacePacketID(interfaceName, functionNumber);
    }

    async getModuleLedColor(): Promise<Rgb> {
        return this.embedded.getModuleLedColor();
    }

    getModuleLedPattern(): Promise<LedPattern> {
        return this.embedded.getModuleLedPattern();
    }

    async getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        return this.embedded.getModuleStatus(clearStatusAfterResponse);
    }

    async getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return this.embedded.getMotorAtTarget(motorChannel);
    }

    async getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return this.embedded.getMotorChannelCurrentAlertLevel(motorChannel);
    }

    async getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return this.embedded.getMotorChannelEnable(motorChannel);
    }

    async getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return this.embedded.getMotorChannelMode(motorChannel);
    }

    async getMotorConstantPower(motorChannel: number): Promise<number> {
        return this.embedded.getMotorConstantPower(motorChannel);
    }

    async getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return this.embedded.getMotorEncoderPosition(motorChannel);
    }

    async getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }> {
        return this.embedded.getMotorTargetPosition(motorChannel);
    }

    async getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return this.embedded.getMotorTargetVelocity(motorChannel);
    }

    async getPhoneChargeControl(): Promise<boolean> {
        return this.embedded.getPhoneChargeControl();
    }

    async getServoConfiguration(servoChannel: number): Promise<number> {
        return this.embedded.getServoConfiguration(servoChannel);
    }

    async getServoEnable(servoChannel: number): Promise<boolean> {
        return this.embedded.getServoEnable(servoChannel);
    }

    async getServoPulseWidth(servoChannel: number): Promise<number> {
        return this.embedded.getServoPulseWidth(servoChannel);
    }

    async injectDataLogHint(hintText: string): Promise<void> {
        return this.embedded.injectDataLogHint(hintText);
    }

    isExpansionHub(): this is ExpansionHub {
        return true;
    }

    isControlHub(): this is ControlHub {
        return true;
    }

    on(eventName: "error", listener: (error: Error) => void): RevHub {
        return this.embedded.on(eventName, listener);
    }

    async queryInterface(interfaceName: string): Promise<ModuleInterface> {
        return this.embedded.queryInterface(interfaceName);
    }

    readI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
    ): Promise<void> {
        return this.embedded.readI2CMultipleBytes(
            i2cChannel,
            slaveAddress,
            numBytesToRead,
        );
    }

    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void> {
        return this.embedded.readI2CSingleByte(i2cChannel, slaveAddress);
    }

    async readVersion(): Promise<Version> {
        return this.embedded.readVersion();
    }

    async readVersionString(): Promise<string> {
        return this.embedded.readVersionString();
    }

    async resetMotorEncoder(motorChannel: number): Promise<void> {
        return this.embedded.resetMotorEncoder(motorChannel);
    }

    async sendFailSafe(): Promise<void> {
        return this.embedded.sendFailSafe();
    }

    async sendKeepAlive(): Promise<void> {
        return this.embedded.sendKeepAlive();
    }

    async sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.embedded.sendReadCommand(packetTypeID, payload);
    }

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return this.embedded.sendWriteCommand(packetTypeID, payload);
    }

    async setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void> {
        return this.embedded.setDebugLogLevel(debugGroup, verbosityLevel);
    }

    async setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        return this.embedded.setAllDigitalOutputs(bitPackedField);
    }

    async setDigitalDirection(dioPin: number, direction: DigitalChannelDirection): Promise<void> {
        return this.embedded.setDigitalDirection(dioPin, direction);
    }

    async setDigitalSingleOutput(dioPin: number, value: DigitalState): Promise<void> {
        return this.embedded.setDigitalOutput(dioPin, value);
    }

    async setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        return this.embedded.setFTDIResetControl(ftdiResetControl);
    }

    async setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        return this.embedded.setI2CChannelConfiguration(i2cChannel, speedCode);
    }

    async setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        return this.embedded.setModuleLedColor(red, green, blue);
    }

    async setModuleLedPattern(ledPattern: LedPattern): Promise<void> {
        return this.embedded.setModuleLedPattern(ledPattern);
    }

    async setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void> {
        return this.embedded.setMotorChannelCurrentAlertLevel(
            motorChannel,
            currentLimit_mA,
        );
    }

    async setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        return this.embedded.setMotorChannelEnable(motorChannel, enable);
    }

    async setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void> {
        return this.embedded.setMotorChannelMode(motorChannel, motorMode, floatAtZero);
    }

    async setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        return this.embedded.setMotorConstantPower(motorChannel, powerLevel);
    }

    async setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void> {
        return this.embedded.setMotorTargetPosition(
            motorChannel,
            targetPosition_counts,
            targetTolerance_counts,
        );
    }

    async setMotorTargetVelocity(
        motorChannel: number,
        velocity_cps: number,
    ): Promise<void> {
        return this.embedded.setMotorTargetVelocity(motorChannel, velocity_cps);
    }

    async getMotorClosedLoopControlCoefficients(motorChannel: number, motorMode: MotorMode): Promise<PidfCoefficients | PidCoefficients> {
        return await this.embedded.getMotorClosedLoopControlCoefficients(motorChannel, motorMode);
    }

    setMotorClosedLoopControlCoefficients(motorChannel: number, motorMode: MotorMode, algorithm: ClosedLoopControlAlgorithm.Pid, pid: PidCoefficients): Promise<void>;
    setMotorClosedLoopControlCoefficients(motorChannel: number, motorMode: MotorMode, algorithm: ClosedLoopControlAlgorithm.Pidf, pidf: PidfCoefficients): Promise<void>;
    setMotorClosedLoopControlCoefficients(motorChannel: number, motorMode: MotorMode, algorithm: ClosedLoopControlAlgorithm, pid: PidCoefficients | PidfCoefficients): Promise<void>;
    async setMotorClosedLoopControlCoefficients(motorChannel: number, motorMode: MotorMode, algorithm: ClosedLoopControlAlgorithm.Pid | ClosedLoopControlAlgorithm.Pidf | ClosedLoopControlAlgorithm, pid: PidCoefficients | PidfCoefficients): Promise<void> {
        return await this.embedded.setMotorClosedLoopControlCoefficients(motorChannel, motorMode, algorithm, pid);
    }

    async setNewModuleAddress(newModuleAddress: number): Promise<void> {
        return this.embedded.setNewModuleAddress(newModuleAddress);
    }

    async setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        return this.embedded.setPhoneChargeControl(chargeEnable);
    }

    async setServoConfiguration(
        servoChannel: number,
        framePeriod: number,
    ): Promise<void> {
        return this.embedded.setServoConfiguration(servoChannel, framePeriod);
    }

    async setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        return this.embedded.setServoEnable(servoChannel, enable);
    }

    async setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        return this.embedded.setServoPulseWidth(servoChannel, pulseWidth);
    }

    writeI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        bytes: number[],
    ): Promise<void> {
        return this.embedded.writeI2CMultipleBytes(i2cChannel, slaveAddress, bytes);
    }

    writeI2CReadMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void> {
        return this.embedded.writeI2CReadMultipleBytes(
            i2cChannel,
            slaveAddress,
            numBytesToRead,
            startAddress,
        );
    }

    writeI2CSingleByte(
        i2cChannel: number,
        slaveAddress: number,
        byte: number,
    ): Promise<void> {
        return this.embedded.writeI2CSingleByte(i2cChannel, slaveAddress, byte);
    }

    async addChildByAddress(moduleAddress: number): Promise<RevHub> {
        let id = await this.openHub("(embedded)", this.moduleAddress, moduleAddress);

        let newHub = new ControlHubConnectedExpansionHub(
            false,
            RevHubType.ExpansionHub,
            this.sendCommand.bind(this),
            "(embedded)",
            moduleAddress,
            id,
        );

        this.children.push(newHub);

        if (newHub.isParentHub) {
            throw new Error("A child hub without a serial number must not be a parent.");
        }
        return newHub;
    }

    async addUsbConnectedHub(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentExpansionHub> {
        let id = await this.openHub(serialNumber, moduleAddress, moduleAddress);

        let newHub = new ControlHubConnectedExpansionHub(
            true,
            RevHubType.ExpansionHub,
            this.sendCommand.bind(this),
            serialNumber,
            moduleAddress,
            id,
        );

        this.usbChildren.push(newHub);
        this.children.push(newHub);

        if (!newHub.isParentHub) {
            throw new Error("A child hub with a serial number must also be a parent.");
        }
        return newHub;
    }

    async sendCommand<P, R>(type: string, params: P, timeout: number = 1000): Promise<R> {
        let key = this.keyGenerator++;
        let messagePayload = {
            commandKey: key,
            commandPayload: JSON.stringify(params),
        };
        let payload = {
            namespace: "MC",
            type: type,
            payload: JSON.stringify(messagePayload),
        };

        this.webSocketConnection.send(JSON.stringify(payload));

        let callbackPromise: Promise<R> = new Promise((resolve, reject) => {
            this.currentActiveCommands.set(key, (response, error) => {
                if (response !== undefined) {
                    resolve(response);
                } else {
                    console.error(`Got error for ${type}`);
                    let e = new Error();
                    Object.assign(e, error);
                    reject(e);
                }
            });
        });

        let timer!: NodeJS.Timer;
        let timeoutPromise: Promise<R> = new Promise((_, reject) => {
            timer = setTimeout(() => {
                console.log(`Got timeout for ${type}`);
                reject(new TimeoutError());
            }, timeout);
        });

        return await Promise.race([callbackPromise, timeoutPromise]).finally(() => {
            clearTimeout(timer);
        });
    }
}
