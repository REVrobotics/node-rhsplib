import {
  ExpansionHub,
  ParentRevHub,
  RevHub,
} from "@rev-robotics/expansion-hub";
import { RevHubType } from "@rev-robotics/expansion-hub/dist/RevHubType";
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

export class ControlHub implements ExpansionHub {
  readonly isOpen: boolean = true;
  readonly moduleAddress: number = 0;
  responseTimeoutMs: number = 0;
  type: RevHubType = RevHubType.ControlHub;

  async open() {}

  close(): void {}

  getADC(): Promise<number> {
    return Promise.resolve(0);
  }

  async getBulkInputData(): Promise<BulkInputData> {
    throw new Error("not implemented");
  }

  getDigitalAllInputs(): Promise<number> {
    throw new Error("not implemented");
  }

  async getDigitalDirection(dioPin: number): Promise<DIODirection> {
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

  getInterfacePacketID(
    interfaceName: string,
    functionNumber: number
  ): Promise<number> {
    return Promise.resolve(0);
  }

  getModuleLEDColor(): Promise<RGB> {
    throw new Error("not implemented");
  }

  getModuleLEDPattern(): Promise<LEDPattern> {
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
    motorChannel: number
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
    motorMode: number
  ): Promise<PIDCoefficients> {
    throw new Error("not implemented");
  }

  getMotorTargetPosition(
    motorChannel: number
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

  isParent(): this is ParentRevHub {
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
    numBytesToRead: number
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
    verbosityLevel: VerbosityLevel
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setDigitalAllOutputs(bitPackedField: number): Promise<void> {
    throw new Error("not implemented");
  }

  setDigitalDirection(dioPin: number, direction: DIODirection): Promise<void> {
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
    speedCode: I2CSpeedCode
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setModuleLEDColor(red: number, green: number, blue: number): Promise<void> {
    throw new Error("not implemented");
  }

  setModuleLEDPattern(ledPattern: LEDPattern): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorChannelCurrentAlertLevel(
    motorChannel: number,
    currentLimit_mA: number
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorChannelEnable(motorChannel: number, enable: boolean): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorChannelMode(
    motorChannel: number,
    motorMode: number,
    floatAtZero: boolean
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorConstantPower(
    motorChannel: number,
    powerLevel: number
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorPIDCoefficients(
    motorChannel: number,
    motorMode: number,
    pid: PIDCoefficients
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorTargetPosition(
    motorChannel: number,
    targetPosition_counts: number,
    targetTolerance_counts: number
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setMotorTargetVelocity(
    motorChannel: number,
    velocity_cps: number
  ): Promise<void> {
    throw new Error("not implemented");
  }

  setNewModuleAddress(newModuleAddress: number): Promise<void> {
    throw new Error("not implemented");
  }

  setPhoneChargeControl(chargeEnable: boolean): Promise<void> {
    throw new Error("not implemented");
  }

  setServoConfiguration(
    servoChannel: number,
    framePeriod: number
  ): Promise<void> {
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
    bytes: number[]
  ): Promise<void> {
    throw new Error("not implemented");
  }

  writeI2CReadMultipleBytes(
    i2cChannel: number,
    slaveAddress: number,
    numBytesToRead: number,
    startAddress: number
  ): Promise<void> {
    throw new Error("not implemented");
  }

  writeI2CSingleByte(
    i2cChannel: number,
    slaveAddress: number,
    byte: number
  ): Promise<void> {
    throw new Error("not implemented");
  }
}
