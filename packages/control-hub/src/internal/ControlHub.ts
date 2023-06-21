import axios from "axios";
import semver from "semver";
import WebSocket from "isomorphic-ws";
import {
    BulkInputData,
    ControlHub,
    DebugGroup,
    DigitalState,
    DioDirection,
    ExpansionHub,
    I2CReadStatus,
    I2CSpeedCode,
    I2CWriteStatus,
    LedPattern,
    ModuleInterface,
    ModuleStatus,
    ParentExpansionHub,
    ParentRevHub,
    PidCoefficients,
    RevHub,
    RevHubType,
    Rgb,
    TimeoutError,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rev-hub-core";
import { clearTimeout } from "timers";
import { ControlHubConnected } from "./ControlHubConnected.js";

export class ControlHubInternal implements ControlHub {
    readonly isOpen: boolean = true;
    moduleAddress: number = 173;
    responseTimeoutMs: number = 0;
    type: RevHubType = RevHubType.ControlHub;
    readonly serialNumber: string;

    /**
     * All children connected over USB or RS-485.
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
    private embedded!: ControlHubConnected;

    private webSocketConnection!: WebSocket;
    private currentActiveCommands = new Map<
        any,
        (response: any | undefined, error: any | undefined) => void
    >();

    constructor(serialNumber: string) {
        this.serialNumber = serialNumber;
    }

    isParent(): this is ParentRevHub {
        return true;
    }

    async open(ip: string = "192.168.43.1", port: string = "8081"): Promise<void> {
        console.log(`Port is ${port}`);
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
            } else {
                //we have a message
                if (rawMessage.type === "sessionEnded") {
                    let allHubs = this.flattenChildren();
                    for (let hub of allHubs) {
                        hub.emit("sessionEnded");
                    }
                } else if (rawMessage.type === "hubAddressChanged") {
                    //notify that hub address changed
                    let payload = rawMessage.payload;
                    let addressChangedPayload = JSON.parse(payload);
                    let handles: number[] = addressChangedPayload.hIds;

                    let allHubs = this.flattenChildren();

                    for (let hub of allHubs) {
                        if (handles.includes(hub.id)) {
                            hub.moduleAddress = addressChangedPayload.na;
                            hub.emit(
                                "addressChanged",
                                addressChangedPayload.oa,
                                addressChangedPayload.na,
                            );
                        }
                    }
                } else if (rawMessage.type === "hubStatusChanged") {
                    let payloadString = rawMessage.payload;
                    let payload = JSON.parse(payloadString);
                    let handles = payload.hIds;
                    let status: ModuleStatus = {
                        statusWord: payload.sw,
                        motorAlerts: payload.ma,
                    };

                    let allHubs = this.flattenChildren();

                    for (let hub of allHubs) {
                        if (handles.includes(hub.id)) {
                            hub.emit("statusChanged", status);
                        }
                    }
                }
            }
        });

        this.webSocketConnection.on("close", () => {
            console.log(`Connection was closed`);
            this.isConnected = false;
        });

        this.webSocketConnection.on("error", (_: WebSocket, err: Error) => {
            console.log("Websocket error");
            console.error(err);
            this.isConnected = false;
        });

        return new Promise((resolve, reject) => {
            this.webSocketConnection.on("open", async () => {
                this.isConnected = true;
                await this.subscribe();
                let apiVersion: { majorVersion: number; minorVersion: number } =
                    await this.sendCommand("start", {});

                this.id = await this.openHub("(embedded)", this.moduleAddress);

                this.embedded = new ControlHubConnected(
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
                let rcVersion: string = response.data.rcVersion;
                return semver.satisfies(rcVersion, ">=8.2");
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    private isControlHub(path: string): boolean {
        return path.includes("_box") && path.includes("msm8916_64");
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

    // ToDo(landry): Always call close() on the parent hub when the sample exits
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

    async getAllDigitalInputs(): Promise<number> {
        return this.embedded.getAllDigitalInputs();
    }

    async getDigitalDirection(dioPin: number): Promise<DioDirection> {
        return this.embedded.getDigitalDirection(dioPin);
    }

    async getDigitalInput(dioPin: number): Promise<DigitalState> {
        return this.embedded.getDigitalInput(dioPin);
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

    async getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PidCoefficients> {
        return this.embedded.getMotorPIDCoefficients(motorChannel, motorMode);
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

    on(eventName: "error", listener: (error: Error) => void): this;
    on(eventName: "statusChanged", listener: (status: ModuleStatus) => void): this;
    on(
        eventName: "addressChanged",
        listener: (oldAddress: number, newAddress: number) => void,
    ): this;
    on(eventName: "sessionEnded", listener: () => void): this;

    on(
        eventName: "error" | "statusChanged" | "addressChanged" | "sessionEnded",
        listener: (...args: any) => void,
    ): this {
        this.embedded.on(eventName, listener);
        return this;
    }

    async queryInterface(interfaceName: string): Promise<ModuleInterface> {
        return this.embedded.queryInterface(interfaceName);
    }

    readI2CRegister(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        register: number,
    ): Promise<number[]> {
        return this.embedded.readI2CRegister(
            i2cChannel,
            targetAddress,
            numBytesToRead,
            register,
        );
    }

    readI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
    ): Promise<number[]> {
        return this.embedded.readI2CMultipleBytes(
            i2cChannel,
            slaveAddress,
            numBytesToRead,
        );
    }

    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<number> {
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

    async setAllDigitalOutputs(bitPackedField: number): Promise<void> {
        return this.embedded.setAllDigitalOutputs(bitPackedField);
    }

    async setDigitalDirection(dioPin: number, direction: DioDirection): Promise<void> {
        return this.embedded.setDigitalDirection(dioPin, direction);
    }

    async setDigitalOutput(dioPin: number, value: DigitalState): Promise<void> {
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

    async setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
    ): Promise<void> {
        return this.embedded.setMotorPIDCoefficients(motorChannel, motorMode, pid);
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

    async writeI2CSingleByte(
        i2cChannel: number,
        slaveAddress: number,
        byte: number,
    ): Promise<void> {
        return this.embedded.writeI2CSingleByte(i2cChannel, slaveAddress, byte);
    }

    /**
     * Returns all connected hubs in the hierarchy as a flat list. Intended for
     * operations that could affect all hubs.
     * @private
     */
    private flattenChildren(): ControlHubConnected[] {
        let result: ControlHubConnected[] = [];
        result.push(this.embedded);

        for (let child of this.children) {
            if (child instanceof ControlHubConnected) {
                result.push(child);
                result.push(...child.flattenChildren());
            }
        }

        return result;
    }

    async addChildByAddress(moduleAddress: number): Promise<RevHub> {
        // Note from Noah: This should not just call addHubBySerialNumberAndAddress(), because that
        //                 will add the hub to usbChildren.
        // ToDo(landry): Extract the embedded constant somewhere
        let id = await this.openHub("(embedded)", this.moduleAddress, moduleAddress);

        let newHub = new ControlHubConnected(
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

    // ToDo(landry): Rename this addUsbConnectedHub (I'm not sure we need all these byX suffixes)
    async addHubBySerialNumberAndAddress(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentExpansionHub> {
        let id = await this.openHub(serialNumber, moduleAddress, moduleAddress);

        let newHub = new ControlHubConnected(
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
                console.error(`Got timeout for ${type}`);
                reject(new TimeoutError());
            }, timeout);
        });

        return await Promise.race([callbackPromise, timeoutPromise]).finally(() => {
            clearTimeout(timer);
        });
    }
}
