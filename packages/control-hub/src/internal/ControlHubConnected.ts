import {
    BulkInputData,
    ClosedLoopControlAlgorithm, ControlHub,
    DebugGroup,
    DigitalChannelDirection,
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
            id: this.id,
            channel: channel,
        });
    }

    async get5VBusVoltage(): Promise<number> {
        return await this.sendCommand("get5VBusVoltage", {
            id: this.id,
        });
    }

    async getBatteryCurrent(): Promise<number> {
        return await this.sendCommand("getBatteryCurrent", {
            id: this.id,
        });
    }

    async getBatteryVoltage(): Promise<number> {
        return await this.sendCommand("getBatteryVoltage", {
            id: this.id,
        });
    }

    async getDigitalBusCurrent(): Promise<number> {
        return await this.sendCommand("getDigitalBusCurrent", {
            id: this.id,
        });
    }

    async getI2CCurrent(): Promise<number> {
        return await this.sendCommand("getI2CCurrent", {
            id: this.id,
        });
    }

    async getMotorCurrent(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorCurrent", {
            id: this.id,
        });
    }

    async getServoCurrent(): Promise<number> {
        return await this.sendCommand("getMotorCurrent", {
            id: this.id,
        });
    }

    async getTemperature(): Promise<number> {
        return await this.sendCommand("getTemperature", {
            id: this.id,
        });
    }

    async getBulkInputData(): Promise<BulkInputData> {
        return await this.sendCommand("getBulkInputData", {
            id: this.id,
        });
    }

    async getDigitalAllInputs(): Promise<number> {
        return await this.sendCommand("getAllDigitalInputs", {
            id: this.id,
        });
    }

    async getDigitalDirection(dioPin: number): Promise<DigitalChannelDirection> {
        let isOutput = await this.sendCommand("getDigitalDirection", {
            id: this.id,
            channel: dioPin,
        });

        return isOutput ? DigitalChannelDirection.Output : DigitalChannelDirection.Input;
    }

    async getDigitalSingleInput(dioPin: number): Promise<boolean> {
        return await this.sendCommand("getDigitalInput", {
            id: this.id,
            channel: dioPin,
        });
    }

    async getFTDIResetControl(): Promise<boolean> {
        return await this.sendCommand("getFtdiResetControl", {
            id: this.id,
        });
    }

    async getI2CChannelConfiguration(i2cChannel: number): Promise<I2CSpeedCode> {
        let speedCode = await this.sendCommand("getI2CChannelConfiguration", {
            id: this.id,
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
            id: this.id,
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
            id: this.id,
        });
    }

    async getMotorAtTarget(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getIsMotorAtTarget", {
            id: this.id,
        });
    }

    async getMotorChannelCurrentAlertLevel(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorAlertLevel", {
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async getMotorChannelEnable(motorChannel: number): Promise<boolean> {
        return await this.sendCommand("getMotorChannelEnable", {
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async getMotorChannelMode(
        motorChannel: number,
    ): Promise<{ motorMode: number; floatAtZero: boolean }> {
        return await this.sendCommand("getMotorMode", {
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async getMotorConstantPower(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorConstantPower", {
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async getMotorEncoderPosition(motorChannel: number): Promise<number> {
        return await this.sendCommand("getMotorEncoderPosition", {
            id: this.id,
            motorChannel: motorChannel,
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
                motorChannel: motorChannel,
            },
        );

        return {
            p: result.p,
            i: result.i,
            d: result.d,
            algorithm: ClosedLoopControlAlgorithm.Pid,
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
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async getPhoneChargeControl(): Promise<boolean> {
        return await this.sendCommand("getPhoneChargeControl", {
            id: this.id,
        });
    }

    async getServoConfiguration(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoConfiguration", {
            id: this.id,
            servoChannel: servoChannel,
        });
    }

    async getServoEnable(servoChannel: number): Promise<boolean> {
        return await this.sendCommand("getServoEnable", {
            id: this.id,
            servoChannel: servoChannel,
        });
    }

    async getServoPulseWidth(servoChannel: number): Promise<number> {
        return await this.sendCommand("getServoPulseWidth", {
            id: this.id,
            servoChannel: servoChannel,
        });
    }

    async injectDataLogHint(hintText: string): Promise<void> {
        await this.sendCommand("injectDebugLogHint", {
            id: this.id,
            hint: hintText,
        });
    }

    isExpansionHub(): this is ExpansionHub {
        return true;
    }

    isControlHub(): this is ControlHub {
        //this class represents the expansion hub board, so it is not a control hub.
        return false;
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
            id: this.id,
        });
    }

    async resetMotorEncoder(motorChannel: number): Promise<void> {
        await this.sendCommand("resetMotorEncoder", {
            id: this.id,
            motorChannel: motorChannel,
        });
    }

    async sendFailSafe(): Promise<void> {
        await this.sendCommand("readVersionString", {
            id: this.id,
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
            id: this.id,
            debugGroup: debugGroup,
            verbosityLevel: verbosityLevel,
        });
    }

    async setDigitalAllOutputs(bitPackedField: number): Promise<void> {
        await this.sendCommand("readVersionString", {
            id: this.id,
            bitField: bitPackedField,
        });
    }

    async setDigitalDirection(dioPin: number, direction: DigitalChannelDirection): Promise<void> {
        await this.sendCommand("readVersionString", {
            id: this.id,
            pin: dioPin,
            isOutput: direction == DigitalChannelDirection.Output,
        });
    }

    async setDigitalSingleOutput(dioPin: number, value?: boolean): Promise<void> {
        await this.sendCommand("readVersionString", {
            id: this.id,
            pin: dioPin,
            value: value ?? false,
        });
    }

    async setFTDIResetControl(ftdiResetControl: boolean): Promise<void> {
        await this.sendCommand("setFtdiResetControl", {
            id: this.id,
        });
    }

    async setI2CChannelConfiguration(
        i2cChannel: number,
        speedCode: I2CSpeedCode,
    ): Promise<void> {
        await this.sendCommand("setI2CChannelConfiguration", {
            id: this.id,
            i2cChannel: i2cChannel,
            speedCode: speedCode,
        });
    }

    async setModuleLedColor(red: number, green: number, blue: number): Promise<void> {
        await this.sendCommand("setLedColor", {
            id: this.id,
            r: red,
            g: green,
            b: blue,
        });
    }

    async setModuleLedPattern(ledPattern: LedPattern): Promise<void> {
        await this.sendCommand("setLedPattern", {
            id: this.id,
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
            id: this.id,
            motorChannel: motorChannel,
            currentLimit_mA: currentLimit_mA,
        });
    }

    async setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setMotorEnabled", {
            id: this.id,
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
            id: this.id,
            motorChannel: motorChannel,
            motorMode: motorMode,
            floatAtZero: floatAtZero,
        });
    }

    async setMotorConstantPower(motorChannel: number, powerLevel: number): Promise<void> {
        await this.sendCommand("setMotorConstantPower", {
            id: this.id,
            motorChannel: motorChannel,
            motorPower: powerLevel,
        });
    }

    async setMotorPIDCoefficients(
        motorChannel: number,
        motorMode: number,
        pid: PidCoefficients,
    ): Promise<void> {
        await this.sendCommand("setMotorPidCoefficients", {
            id: this.id,
            motorChannel: motorChannel,
            motorMode: motorMode,
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
            id: this.id,
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
            id: this.id,
            motorChannel: motorChannel,
            velocityCps: velocity_cps,
        });
    }

    async setNewModuleAddress(newModuleAddress: number): Promise<void> {
        await this.sendCommand("setNewModuleAddress", {
            id: this.id,
            address: newModuleAddress,
        });
    }

    async setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
        await this.sendCommand("setPhoneChargeControl", {
            id: this.id,
            enabled: chargeEnable,
        });
    }

    async setServoConfiguration(
        servoChannel: number,
        framePeriod: number,
    ): Promise<void> {
        await this.sendCommand("setServoConfiguration", {
            id: this.id,
            servoChannel: servoChannel,
            framePeriod: framePeriod,
        });
    }

    async setServoEnable(servoChannel: number, enable: boolean): Promise<void> {
        await this.sendCommand("setServoEnable", {
            id: this.id,
            servoChannel: servoChannel,
            enabled: enable,
        });
    }

    async setServoPulseWidth(servoChannel: number, pulseWidth: number): Promise<void> {
        await this.sendCommand("setServoPulseWidth", {
            id: this.id,
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
