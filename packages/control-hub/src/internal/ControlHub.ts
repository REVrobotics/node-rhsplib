import { ExpansionHub, ParentRevHub, RevHub, RevHubType } from "@rev-robotics/expansion-hub";
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
} from "@rev-robotics/rhsplib";
import axios from "axios";
import semver from "semver";
import WebSocket from "isomorphic-ws";
import { ControlHub, ParentControlHub } from "../ControlHub.js";

export class ControlHubInternal implements ControlHub {
    readonly isOpen: boolean = true;
    moduleAddress: number = 0;
    responseTimeoutMs: number = 0;
    type: RevHubType = RevHubType.ControlHub;
    webSocketConnection!: WebSocket;
    private readonly serialNumber?: string;

    keyGenerator = 0;
    currentActiveCommands = new Map<
        any,
        (response: any | undefined, error: any | undefined) => void
    >();

    constructor(serialNumber?: string) {
        this.serialNumber = serialNumber;
    }

    isParent(): this is ParentControlHub {
        return this.serialNumber !== undefined;
    }

    async open(ip: string = "192.168.43.1", port: string = "8081"): Promise<void> {
        this.webSocketConnection = new WebSocket(`ws://${ip}:${port}`);

        this.webSocketConnection.on("message", (data) => {
            let rawMessage = JSON.parse(data.toString());

            if (rawMessage.key !== undefined) {
                let key = rawMessage.key;
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

        return new Promise((resolve, reject) => {
            this.webSocketConnection.on("open", async () => {
                this.moduleAddress = await this.sendCommand("getModuleAddress", {});
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

    close(): void {
        this.webSocketConnection.close();
    }

    getADC(): Promise<number> {
        return Promise.resolve(0);
    }

    async getBulkInputData(): Promise<BulkInputData> {
        throw new Error("not implemented");
    }

    getDigitalAllInputs(): Promise<number> {
        throw new Error("not implemented");
    }

    async getDigitalDirection(dioPin: number): Promise<DioDirection> {
        throw new Error("not implemented");
    }

    getDigitalSingleInput(dioPin: number): Promise<boolean> {
        throw new Error("not implemented");
    }

    getFTDIResetControl(): Promise<boolean> {
        throw new Error("not implemented");
    }

    getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        throw new Error("not implemented");
    }

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus> {
        throw new Error("not implemented");
    }

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus> {
        throw new Error("not implemented");
    }

    getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<number> {
        return Promise.resolve(0);
    }

    getModuleLedColor(): Promise<Rgb> {
        throw new Error("not implemented");
    }

    getModuleLedPattern(): Promise<LedPattern> {
        throw new Error("not implemented");
    }

    getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        throw new Error("not implemented");
    }

    getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return Promise.resolve({ floatAtZero: false, motorMode: 0 });
    }

    getMotorConstantPower(motorChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PidCoefficients> {
        throw new Error("not implemented");
    }

    getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }> {
        return Promise.resolve({ targetPosition: 0, targetTolerance: 0 });
    }

    getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getPhoneChargeControl(): Promise<boolean> {
        return Promise.resolve(false);
    }

    getServoConfiguration(servoChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    getServoEnable(servoChannel: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    getServoPulseWidth(servoChannel: number): Promise<number> {
        return Promise.resolve(0);
    }

    injectDataLogHint(hintText: string): Promise<void> {
        throw new Error("not implemented");
    }

    isExpansionHub(): this is ExpansionHub {
        throw new Error("not implemented");
    }

    on(eventName: "error", listener: (error: Error) => void): RevHub {
        throw new Error("not implemented");
    }

    queryInterface(interfaceName: string): Promise<ModuleInterface> {
        throw new Error("not implemented");
    }

    readI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    readI2CSingleByte(i2cChannel: number, slaveAddress: number): Promise<void> {
        throw new Error("not implemented");
    }

    readVersion(): Promise<Version> {
        throw new Error("not implemented");
    }

    readVersionString(): Promise<string> {
        return Promise.resolve("");
    }

    resetMotorEncoder(motorChannel: number): Promise<void> {
        throw new Error("not implemented");
    }

    sendFailSafe(): Promise<void> {
        throw new Error("not implemented");
    }

    sendKeepAlive(): Promise<void> {
        throw new Error("not implemented");
    }

    sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return Promise.resolve([]);
    }

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return Promise.resolve([]);
    }

    setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        throw new Error("not implemented");
    }

    setDigitalDirection(dioPin: number, direction: DioDirection): Promise<void> {
        throw new Error("not implemented");
    }

    setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void> {
        throw new Error("not implemented");
    }

    setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        throw new Error("not implemented");
    }

    setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        throw new Error("not implemented");
    }

    setModuleLedPattern(ledPattern: LedPattern): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    setMotorTargetVelocity(motorChannel: number, velocity_cps: number): Promise<void> {
        throw new Error("not implemented");
    }

    setNewModuleAddress(newModuleAddress: number): Promise<void> {
        throw new Error("not implemented");
    }

    setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        throw new Error("not implemented");
    }

    setServoConfiguration(servoChannel: number, framePeriod: number): Promise<void> {
        throw new Error("not implemented");
    }

    setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        throw new Error("not implemented");
    }

    setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        throw new Error("not implemented");
    }

    writeI2CMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        bytes: number[],
    ): Promise<void> {
        throw new Error("not implemented");
    }

    writeI2CReadMultipleBytes(
        i2cChannel: number,
        slaveAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    writeI2CSingleByte(
        i2cChannel: number,
        slaveAddress: number,
        byte: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    async sendCommand<P, R>(type: string, params: P): Promise<R> {
        let key = 0;
        let messagePayload = {
            key: key,
            commandPayload: JSON.stringify(params),
        };
        let payload = {
            namespace: "ManualControl",
            type: type,
            payload: JSON.stringify(messagePayload),
        };
        this.webSocketConnection?.send(JSON.stringify(payload));

        return new Promise((resolve, reject) => {
            this.currentActiveCommands.set(key, (response, error) => {
                if (response !== undefined) {
                    resolve(response);
                } else {
                    let e = new Error();
                    Object.assign(e, error);
                    reject(e);
                }
            });
        });
    }
}
