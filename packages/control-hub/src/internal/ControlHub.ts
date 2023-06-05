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
    RGB,
    VerbosityLevel,
    Version,
} from "@rev-robotics/rhsplib";
import axios from "axios";
import semver from "semver";
import WebSocket from "isomorphic-ws";
import {
    ControlHub,
    ExpansionHub,
    ParentRevHub,
    RevHub,
    RevHubType,
} from "@rev-robotics/rev-hub-core";

export class ControlHubInternal implements ControlHub {
    readonly isOpen: boolean = true;
    moduleAddress: number = 0;
    responseTimeoutMs: number = 0;
    type: RevHubType = RevHubType.ControlHub;
    webSocketConnection!: WebSocket;
    readonly serialNumber: string;
    readonly children: ReadonlyArray<RevHub> = [];

    keyGenerator = 0;
    currentActiveCommands = new Map<
        any,
        (response: any | undefined, error: any | undefined) => void
    >();

    constructor(serialNumber: string) {
        this.serialNumber = serialNumber;
    }

    isParent(): this is ParentRevHub {
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
                this.moduleAddress = await this.sendCommand("getModuleAddress", {
                    serialNumber: "Embedded",
                    moduleAddress: 173,
                });
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
        let result = await this.sendCommand("getBulkInputData", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
        throw new Error("not implemented");
    }

    async getDigitalAllInputs(): Promise<number> {
        return await this.sendCommand("getAllDigitalInputs", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async getDigitalDirection(dioPin: number): Promise<DIODirection> {
        let isOutput = await this.sendCommand("getDigitalDirection", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            channel: dioPin,
        });

        return isOutput ? DIODirection.Output : DIODirection.Input;
    }

    async getDigitalSingleInput(dioPin: number): Promise<boolean> {
        return await this.sendCommand("getDigitalInput", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            channel: dioPin,
        });
    }

    async getFTDIResetControl(): Promise<boolean> {
        return await this.sendCommand("getFtdiResetControl", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        let speedCode = await this.sendCommand("getI2CChannelConfiguration", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            channel: i2cChannel,
        });

        return speedCode == 1
            ? I2CSpeedCode.SpeedCode400_Kbps
            : I2CSpeedCode.SpeedCode100_Kbps;
    }

    getI2CReadStatus(i2cChannel: number): Promise<I2CReadStatus> {
        throw new Error("not implemented");
    }

    getI2CWriteStatus(i2cChannel: number): Promise<I2CWriteStatus> {
        throw new Error("not implemented");
    }

    async getInterfacePacketID(
        interfaceName: string,
        functionNumber: number,
    ): Promise<number> {
        return await this.sendCommand("getInterfacePacketId", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            interfaceName: interfaceName,
            functionNumber: functionNumber,
        });
    }

    async getModuleLedColor(): Promise<RGB> {
        let result: { r: number; g: number; b: number } = await this.sendCommand(
            "getLedColor",
            {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
            },
        );

        return {
            red: result.r,
            green: result.g,
            blue: result.b,
        };
    }

    getModuleLedPattern(): Promise<LEDPattern> {
        throw new Error("not implemented");
    }

    async getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        return await this.sendCommand("getModuleStatus", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getIsMotorAtTarget", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorAlertLevel", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getMotorChannelEnable", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return await this.sendCommand("getMotorMode", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getMotorConstantPower(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorConstantPower", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorEncoderPosition", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PIDCoefficients> {
        let result: { p: number; i: number; d: number } = await this.sendCommand(
            "getMotorPidCoefficients",
            {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
                motorChannel: motorChannel,
            },
        );

        return {
            P: result.p,
            I: result.i,
            D: result.d,
        };
    }

    async getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }> {
        let result: { targetPositionCounts: number; targetToleranceCounts: number } =
            await this.sendCommand("getMotorTargetPosition", {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
                motorChannel: motorChannel,
            });

        return {
            targetPosition: result.targetPositionCounts,
            targetTolerance: result.targetToleranceCounts,
        };
    }

    async getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorTargetVelocity", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async getPhoneChargeControl(): Promise<boolean> {
        return await this.sendCommand("getPhoneChargeControl", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async getServoConfiguration(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoConfiguration", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
        });
    }

    async getServoEnable(servoChannel: number): Promise<boolean> {
        return await this.sendCommand("getServoEnable", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
        });
    }

    async getServoPulseWidth(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoPulseWidth", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
        });
    }

    async injectDataLogHint(hintText: string): Promise<void> {
        await this.sendCommand("injectDebugLogHint", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            hint: hintText,
        });
    }

    isExpansionHub(): this is ExpansionHub {
        return true;
    }

    on(eventName: "error", listener: (error: Error) => void): RevHub {
        throw new Error("not implemented");
    }

    async queryInterface(interfaceName: string): Promise<ModuleInterface> {
        let result: { name: string; firstPacketId: number; numberIds: number } =
            await this.sendCommand("queryInterface", {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
                interfaceName: interfaceName,
            });

        return {
            name: result.name,
            firstPacketID: result.firstPacketId,
            numberIDValues: result.numberIds,
        };
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

    async readVersion(): Promise<Version> {
        let versionString = await this.readVersionString();
        //ToDo(landry) parse version string
        throw new Error("not implemented");
    }

    async readVersionString(): Promise<string> {
        return await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async resetMotorEncoder(motorChannel: number): Promise<void> {
        await this.sendCommand("resetMotorEncoder", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
        });
    }

    async sendFailSafe(): Promise<void> {
        await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async sendKeepAlive(): Promise<void> {}

    async sendReadCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return Promise.resolve([]);
    }

    sendWriteCommand(packetTypeID: number, payload: number[]): Promise<number[]> {
        return Promise.resolve([]);
    }

    async setDebugLogLevel(
        debugGroup: DebugGroup,
        verbosityLevel: VerbosityLevel,
    ): Promise<void> {
        await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            debugGroup: debugGroup,
            verbosityLevel: verbosityLevel,
        });
    }

    async setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            bitField: bitPackedField,
        });
    }

    async setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void> {
        await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            pin: dioPin,
            isOutput: direction == DIODirection.Output,
        });
    }

    async setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void> {
        await this.sendCommand("readVersionString", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            pin: dioPin,
            value: value ?? false,
        });
    }

    async setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        await this.sendCommand("setFtdiResetControl", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
        });
    }

    async setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        await this.sendCommand("setI2CChannelConfiguration", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            i2cChannel: i2cChannel,
            speedCode: speedCode,
        });
    }

    async setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        await this.sendCommand("setLedColor", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            r: red,
            g: green,
            b: blue,
        });
    }

    async setModuleLedPattern(ledPattern: LEDPattern): Promise<void> {
        await this.sendCommand("setLedColor", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            rgbtPatternStep0: ledPattern.rgbtPatternStep0,
            rgbtPatternStep1: ledPattern.rgbtPatternStep1,
            rgbtPatternStep2: ledPattern.rgbtPatternStep2,
            rgbtPatternStep3: ledPattern.rgbtPatternStep3,
            rgbtPatternStep4: ledPattern.rgbtPatternStep4,
            rgbtPatternStep5: ledPattern.rgbtPatternStep5,
            rgbtPatternStep6: ledPattern.rgbtPatternStep6,
            rgbtPatternStep7: ledPattern.rgbtPatternStep7,
            rgbtPatternStep8: ledPattern.rgbtPatternStep8,
            rgbtPatternStep9: ledPattern.rgbtPatternStep9,
            rgbtPatternStep10: ledPattern.rgbtPatternStep10,
            rgbtPatternStep11: ledPattern.rgbtPatternStep11,
            rgbtPatternStep12: ledPattern.rgbtPatternStep12,
            rgbtPatternStep13: ledPattern.rgbtPatternStep13,
            rgbtPatternStep14: ledPattern.rgbtPatternStep14,
            rgbtPatternStep15: ledPattern.rgbtPatternStep15,
        });
    }

    async setMotorChannelCurrentAlertLevel(
        motorChannel: number,
        currentLimit_mA: number,
    ): Promise<void> {
        await this.sendCommand("setMotorAlertLevel", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            currentLimit_mA: currentLimit_mA,
        });
    }

    async setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setMotorEnabled", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            enable: enable,
        });
    }

    async setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void> {
        await this.sendCommand("setMotorChannelMode", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            motorMode: motorMode,
            floatAtZero: floatAtZero,
        });
    }

    async setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        await this.sendCommand("setMotorConstantPower", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            motorPower: powerLevel,
        });
    }

    async setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PIDCoefficients,
    ): Promise<void> {
        await this.sendCommand("setMotorPidCoefficients", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            motorMode: motorMode,
            p: pid.P,
            i: pid.I,
            d: pid.D,
        });
    }

    async setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void> {
        await this.sendCommand("setMotorTargetPosition", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            targetPositionCounts: targetPosition_counts,
            targetToleranceCounts: targetTolerance_counts,
        });
    }

    async setMotorTargetVelocity(
        motorChannel: number,
        velocity_cps: number,
    ): Promise<void> {
        await this.sendCommand("setMotorTargetVelocity", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            motorChannel: motorChannel,
            velocityCps: velocity_cps,
        });
    }

    async setNewModuleAddress(newModuleAddress: number): Promise<void> {
        await this.sendCommand("setNewModuleAddress", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            address: newModuleAddress,
        });
    }

    async setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        await this.sendCommand("setPhoneChargeControl", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            enabled: chargeEnable,
        });
    }

    async setServoConfiguration(
        servoChannel: number,
        framePeriod: number,
    ): Promise<void> {
        await this.sendCommand("setServoConfiguration", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
            framePeriod: framePeriod,
        });
    }

    async setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setServoEnable", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
            enabled: enable,
        });
    }

    async setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        await this.sendCommand("setServoPulseWidth", {
            serialNumber: this.serialNumber,
            moduleAddress: this.moduleAddress,
            servoChannel: servoChannel,
            pulseWidth: pulseWidth,
        });
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

    addChild(hub: RevHub): void {
        throw new Error("not implemented");
    }

    addChildByAddress(moduleAddress: number): Promise<RevHub> {
        throw new Error("not implemented");
    }
}
