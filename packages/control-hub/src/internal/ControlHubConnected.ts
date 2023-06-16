import {
    BulkInputData,
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
    VerbosityLevel,
    Version,
} from "@rev-robotics/rev-hub-core";

export class ControlHubConnected implements ParentExpansionHub {
    isParentHub: boolean;
    type: RevHubType;
    id: Exclude<any, Promise<any>>;
    serialNumber: string;
    moduleAddress: number;
    sendCommand: <P, R>(name: string, params: P, timeout?: number) => Promise<R>;

    isOpen: boolean = false;

    responseTimeoutMs = 1000;

    readonly children: RevHub[] = [];

    constructor(
        isParent: boolean,
        type: RevHubType,
        sendCommand: <P, R>(name: string, params: P, timeout?: number) => Promise<R>,
        serialNumber: string,
        moduleAddress: number,
        id: any,
    ) {
        this.isParentHub = isParent;
        this.type = type;
        this.id = id;
        this.serialNumber = serialNumber;
        this.moduleAddress = moduleAddress;
        this.sendCommand = sendCommand;
    }

    isParent(): this is ParentRevHub {
        return this.isParentHub;
    }

    close(): void {}

    async getAnalogInput(channel: number): Promise<number> {
        return await this.sendCommand("getAnalogInput", {
            hId: this.id,
            analogChannel: channel,
        });
    }

    async get5VBusVoltage(): Promise<number> {
        return await this.sendCommand("get5VBusVoltage", {
            hId: this.id,
        });
    }

    async getBatteryCurrent(): Promise<number> {
        return await this.sendCommand("getBatteryCurrent", {
            hId: this.id,
        });
    }

    async getBatteryVoltage(): Promise<number> {
        return await this.sendCommand("getBatteryVoltage", {
            hId: this.id,
        });
    }

    async getDigitalBusCurrent(): Promise<number> {
        return await this.sendCommand("getDigitalBusCurrent", {
            hId: this.id,
        });
    }

    async getI2CCurrent(): Promise<number> {
        return await this.sendCommand("getI2CCurrent", {
            hId: this.id,
        });
    }

    async getMotorCurrent(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorCurrent", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getServoCurrent(): Promise<number> {
        return await this.sendCommand("getMotorCurrent", {
            hId: this.id,
        });
    }

    async getTemperature(): Promise<number> {
        return await this.sendCommand("getTemperature", {
            hId: this.id,
        });
    }

    async getBulkInputData(): Promise<BulkInputData> {
        return await this.sendCommand("getBulkInputData", {
            hId: this.id,
        });
    }

    async getAllDigitalInputs(): Promise<number> {
        return await this.sendCommand("getAllDigitalInputs", {
            hId: this.id,
        });
    }

    async getDigitalDirection(dioPin: number): Promise<DioDirection> {
        let isOutput = await this.sendCommand("getDigitalDirection", {
            hId: this.id,
            digitalChannel: dioPin,
        });

        return isOutput ? DioDirection.Output : DioDirection.Input;
    }

    async getDigitalInput(dioPin: number): Promise<DigitalState> {
        let result: boolean = await this.sendCommand("getDigitalInput", {
            hId: this.id,
            digitalChannel: dioPin,
        });

        return result ? DigitalState.High : DigitalState.Low;
    }

    async getFTDIResetControl(): Promise<boolean> {
        return await this.sendCommand("getFtdiResetControl", {
            hId: this.id,
        });
    }

    async getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        let speedCode = await this.sendCommand("getI2CChannelConfiguration", {
            hId: this.id,
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
            hId: this.id,
            interfaceName: interfaceName,
            functionNumber: functionNumber,
        });
    }

    async getModuleLedColor(): Promise<Rgb> {
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

    getModuleLedPattern(): Promise<LedPattern> {
        throw new Error("not implemented");
    }

    async getModuleStatus(clearStatusAfterResponse: boolean): Promise<ModuleStatus> {
        return await this.sendCommand("getModuleStatus", {
            hId: this.id,
        });
    }

    async getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getIsMotorAtTarget", {
            hId: this.id,
        });
    }

    async getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorAlertLevel", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getMotorChannelEnable", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return await this.sendCommand("getMotorMode", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getMotorConstantPower(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorConstantPower", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorEncoder", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
    ): Promise<PidCoefficients> {
        let result: { p: number; i: number; d: number } = await this.sendCommand(
            "getMotorPidCoefficients",
            {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
                c: motorChannel,
                m: motorMode,
            },
        );

        return {
            p: result.p,
            i: result.i,
            d: result.d,
        };
    }

    async getMotorTargetPosition(
        motorChannel: number,
    ): Promise<{ targetPosition: number; targetTolerance: number }> {
        let result: { targetPositionCounts: number; targetToleranceCounts: number } =
            await this.sendCommand("getMotorTargetPosition", {
                serialNumber: this.serialNumber,
                moduleAddress: this.moduleAddress,
                c: motorChannel,
            });

        return {
            targetPosition: result.targetPositionCounts,
            targetTolerance: result.targetToleranceCounts,
        };
    }

    async getMotorTargetVelocity(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorTargetVelocity", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async getPhoneChargeControl(): Promise<boolean> {
        return await this.sendCommand("getPhoneChargeControl", {
            hId: this.id,
        });
    }

    async getServoConfiguration(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoConfiguration", {
            hId: this.id,
            c: servoChannel,
        });
    }

    async getServoEnable(servoChannel: number): Promise<boolean> {
        return await this.sendCommand("getServoEnable", {
            hId: this.id,
            c: servoChannel,
        });
    }

    async getServoPulseWidth(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoPulseWidth", {
            hId: this.id,
            c: servoChannel,
        });
    }

    async injectDataLogHint(hintText: string): Promise<void> {
        await this.sendCommand("injectDebugLogHint", {
            hId: this.id,
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

    readI2CRegister(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        register: number,
    ): Promise<number[]> {
        throw new Error("not implemented");
    }

    readI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
    ): Promise<number[]> {
        throw new Error("not implemented");
    }

    readI2CSingleByte(i2cChannel: number, targetAddress: number): Promise<number> {
        throw new Error("not implemented");
    }

    async readVersion(): Promise<Version> {
        let versionString = await this.readVersionString();
        //ToDo(landry) parse version string
        throw new Error("not implemented");
    }

    async readVersionString(): Promise<string> {
        return await this.sendCommand("readVersionString", {
            hId: this.id,
        });
    }

    async resetMotorEncoder(motorChannel: number): Promise<void> {
        await this.sendCommand("resetMotorEncoder", {
            hId: this.id,
            c: motorChannel,
        });
    }

    async sendFailSafe(): Promise<void> {
        await this.sendCommand("readVersionString", {
            hId: this.id,
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
            hId: this.id,
            debugGroup: debugGroup,
            verbosityLevel: verbosityLevel,
        });
    }

    async setAllDigitalOutputs(bitPackedField: number): Promise<void> {
        await this.sendCommand("readVersionString", {
            hId: this.id,
            bitField: bitPackedField,
        });
    }

    async setDigitalDirection(dioPin: number, direction: DioDirection): Promise<void> {
        await this.sendCommand("readVersionString", {
            hId: this.id,
            pin: dioPin,
            isOutput: direction == DioDirection.Output,
        });
    }

    async setDigitalOutput(dioPin: number, value: DigitalState): Promise<void> {
        await this.sendCommand("readVersionString", {
            hId: this.id,
            digitalChannel: dioPin,
            value: value.isHigh(),
        });
    }

    async setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        await this.sendCommand("setFtdiResetControl", {
            hId: this.id,
        });
    }

    async setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        await this.sendCommand("setI2CChannelConfiguration", {
            hId: this.id,
            i2cChannel: i2cChannel,
            speedCode: speedCode,
        });
    }

    async setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        await this.sendCommand("setLedColor", {
            hId: this.id,
            r: red,
            g: green,
            b: blue,
        });
    }

    async setModuleLedPattern(ledPattern: LedPattern): Promise<void> {
        await this.sendCommand("setLedPattern", {
            hId: this.id,
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
            hId: this.id,
            c: motorChannel,
            cl: currentLimit_mA,
        });
    }

    async setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setMotorEnabled", {
            hId: this.id,
            c: motorChannel,
            enable: enable,
        });
    }

    async setMotorChannelMode(
        motorChannel: number,
        motorMode: number,
        floatAtZero: boolean,
    ): Promise<void> {
        await this.sendCommand("setMotorMode", {
            hId: this.id,
            c: motorChannel,
            m: motorMode,
            faz: floatAtZero,
        });
    }

    async setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        await this.sendCommand("setMotorConstantPower", {
            hId: this.id,
            c: motorChannel,
            p: powerLevel,
        });
    }

    async setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
    ): Promise<void> {
        await this.sendCommand("setMotorPidCoefficients", {
            hId: this.id,
            c: motorChannel,
            m: motorMode,
            p: pid.p,
            i: pid.i,
            d: pid.d,
        });
    }

    async setMotorTargetPosition(
        motorChannel: number,
        targetPosition_counts: number,
        targetTolerance_counts: number,
    ): Promise<void> {
        await this.sendCommand("setMotorTargetPosition", {
            hId: this.id,
            c: motorChannel,
            targetPositionCounts: targetPosition_counts,
            targetToleranceCounts: targetTolerance_counts,
        });
    }

    async setMotorTargetVelocity(
        motorChannel: number,
        velocity_cps: number,
    ): Promise<void> {
        await this.sendCommand("setMotorTargetVelocity", {
            hId: this.id,
            c: motorChannel,
            velocityCps: velocity_cps,
        });
    }

    async setNewModuleAddress(newModuleAddress: number): Promise<void> {
        await this.sendCommand("setNewModuleAddress", {
            hId: this.id,
            address: newModuleAddress,
        });
    }

    async setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        await this.sendCommand("setPhoneChargeControl", {
            hId: this.id,
            enabled: chargeEnable,
        });
    }

    async setServoConfiguration(
        servoChannel: number,
        framePeriod: number,
    ): Promise<void> {
        await this.sendCommand("setServoConfiguration", {
            hId: this.id,
            c: servoChannel,
            framePeriod: framePeriod,
        });
    }

    async setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setServoEnable", {
            hId: this.id,
            c: servoChannel,
            enabled: enable,
        });
    }

    async setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        await this.sendCommand("setServoPulseWidth", {
            hId: this.id,
            c: servoChannel,
            pulseWidth: pulseWidth,
        });
    }

    writeI2CMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        bytes: number[],
    ): Promise<void> {
        throw new Error("not implemented");
    }

    writeI2CReadMultipleBytes(
        i2cChannel: number,
        targetAddress: number,
        numBytesToRead: number,
        startAddress: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    writeI2CSingleByte(
        i2cChannel: number,
        targetAddress: number,
        byte: number,
    ): Promise<void> {
        throw new Error("not implemented");
    }

    async addChildByAddress(moduleAddress: number): Promise<RevHub> {
        let id = await this.sendCommand("openHub", {
            parentSerialNumber: this.serialNumber,
            parentHubAddress: this.moduleAddress,
            hubAddress: moduleAddress,
        });
        let newHub = new ControlHubConnected(
            false,
            RevHubType.ExpansionHub,
            this.sendCommand.bind(this),
            this.serialNumber,
            moduleAddress,
            id,
        );

        this.children.push(newHub);

        return newHub;
    }
}
