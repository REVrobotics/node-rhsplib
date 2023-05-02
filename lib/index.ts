export * from "./discovery.js"
export * from "./RevHub.js"
export * from "./open-rev-hub.js"

export enum SerialParity {
  None = 0,
  Odd,
  Even
}

export enum SerialFlowControl {
  None = 0,
  Hardware,
  Software
}

export enum DebugGroup {
  Main = 1,
  TransmitterToHost,
  ReceiverFromHost,
  ADC,
  PWMAndServo,
  ModuleLED,
  DigitalIO,
  I2C,
  Motor0,
  Motor1,
  Motor2,
  Motor3
}

export enum VerbosityLevel {
  Off = 0,
  Level1,
  Level2,
  Level3
}

export enum DIODirection {
  Input,
  Output
}

export enum I2CSpeedCode {
  SpeedCode100_Kbps,
  SpeedCode400_Kbps
}

export interface ModuleStatus {
  statusWord: number;
  motorAlerts: number;
}

export interface ModuleInterface {
  name: string;
  firstPacketID: number;
  numberIDValues: number;
}

export interface RGB {
  red: number;
  green: number;
  blue: number;
}

export interface LEDPattern {
  rgbtPatternStep0: number;
  rgbtPatternStep1: number;
  rgbtPatternStep2: number;
  rgbtPatternStep3: number;
  rgbtPatternStep4: number;
  rgbtPatternStep5: number;
  rgbtPatternStep6: number;
  rgbtPatternStep7: number;
  rgbtPatternStep8: number;
  rgbtPatternStep9: number;
  rgbtPatternStep10: number;
  rgbtPatternStep11: number;
  rgbtPatternStep12: number;
  rgbtPatternStep13: number;
  rgbtPatternStep14: number;
  rgbtPatternStep15: number;
}

export interface DiscoveredAddresses {
  parentAddress: number;
  childAddresses: number[];
  numberOfChildModules: number;
}

export interface BulkInputData {
  digitalInputs: number;
  motor0position_enc: number;
  motor1position_enc: number;
  motor2position_enc: number;
  motor3position_enc: number;
  motorStatus: number;
  motor0velocity_cps: number;
  motor1velocity_cps: number;
  motor2velocity_cps: number;
  motor3velocity_cps: number;
  analog0_mV: number;
  analog1_mV: number;
  analog2_mV: number;
  analog3_mV: number;
  attentionRequired: number;
}

export interface Version {
  engineeringRevision: number;
  minorVersion: number;
  majorVersion: number;
  minorHwRevision: number;
  majorHwRevision: number;
  hwType: number;
}

export interface I2CWriteStatus {
  i2cTransactionStatus: number;
  numBytesWritten: number;
}

export interface I2CReadStatus {
  i2cTransactionStatus: number;
  numBytesRead: number;
  bytes: number[];
}

export interface PIDCoefficients {
  P: number,
  I: number,
  D: number
}

