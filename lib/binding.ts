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

export declare class Serial {
  constructor();
  open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): void;
  close(): void;
  read(numBytesToRead: number): number[];
  write(bytes: number[]): void;
}

export declare class RHSPlib {
  constructor();
  open(serialPort: Serial, destAddress: number): Promise<{value: null, resultCode: number}>;
  isOpened(): boolean;
  close(): void;
  setDestAddress(destAddress: number): void;
  getDestAddress(): number;
  setResponseTimeoutMs(responseTimeoutMs: number): void;
  getResponseTimeoutMs(): number;
  sendWriteCommandInternal(packetTypeID: number, payload: number[]): Promise<{value: null, resultCode: number}>;
  sendWriteCommand(packetTypeID: number, payload: number[]): Promise<{value: number[], resultCode: number}>;
  sendReadCommandInternal(packetTypeID: number, payload: number[]): Promise<{value: null, resultCode: number}>;
  sendReadCommand(packetTypeID: number, payload: number[]): Promise<{value: number[], resultCode: number}>;
  getModuleStatus(clearStatusAfterResponse: boolean): Promise<{value: ModuleStatus, resultCode: number}>;
  sendKeepAlive(): Promise<{value: null, resultCode: number}>;
  sendFailSafe(): Promise<{value: null, resultCode: number}>;
  setNewModuleAddress(newModuleAddress: number): Promise<{value: null, resultCode: number}>;
  queryInterface(interfaceName: string): Promise<{value: ModuleInterface, resultCode: number}>;
  setModuleLEDColor(red: number, green: number, blue: number): Promise<{value: null, resultCode: number}>;
  getModuleLEDColor(): Promise<{value: RGB, resultCode: number}>;
  setModuleLEDPattern(ledPattern: LEDPattern): Promise<{value: null, resultCode: number}>;
  getModuleLEDPattern(): Promise<{value: LEDPattern, resultCode: number}>;
  setDebugLogLevel(debugGroup: DebugGroup, verbosityLevel: VerbosityLevel): Promise<{value: null, resultCode: number}>;
  discovery(serialPort: Serial): Promise<{value: DiscoveredAddresses, resultCode: number}>;
  getInterfacePacketID(interfaceName: string, functionNumber: number): Promise<{value: number, resultCode: number}>;

  // Device Control
  getBulkInputData(): Promise<{value: BulkInputData, resultCode: number}>;
  getADC(): Promise<{value: number, resultCode: number}>;
  setPhoneChargeControl(chargeEnable: boolean): Promise<{value: null, resultCode: number}>;
  getPhoneChargeControl(): Promise<{value: boolean, resultCode: number}>;
  injectDataLogHint(hintText: string): Promise<{value: null, resultCode: number}>;
  readVersionString(): Promise<{value: string, resultCode: number}>;
  readVersion(): Promise<{value: Version, resultCode: number}>;
  setFTDIResetControl(ftdiResetControl: boolean): Promise<{value: null, resultCode: number}>;
  getFTDIResetControl(): Promise<{value: boolean, resultCode: number}>;

  // DIO
  setDigitalSingleOutput(dioPin: number, value: boolean): Promise<{value: null, resultCode: number}>;
  setDigitalAllOutputs(bitPackedField: number): Promise<{value: null, resultCode: number}>;
  setDigitalDirection(dioPin: number, direction: DIODirection): Promise<{value: null, resultCode: number}>;
  getDigitalDirection(dioPin: number): Promise<{value: DIODirection, resultCode: number}>;
  getDigitalSingleInput(dioPin: number): Promise<{value: boolean, resultCode: number}>;
  getDigitalAllInputs(): Promise<{value: number, resultCode: number}>;
}
