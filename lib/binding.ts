const addon = require('bindings')('addon');

export enum SerialParity {
  None,
  Odd,
  Even
}

export enum SerialFlowControl {
  None,
  Hardware,
  Software
}

export interface ModuleStatus {
  statusWord: Number;
  motorAlerts: Number;
}

export interface ModuleInterface {
  name: String;
  firstPacketID: Number;
  numberIDValues: Number;
}

export interface RGB {
  red: Number;
  green: Number;
  blue: Number;
}

export interface LEDPattern {
  rgbtPatternStep0: Number;
  rgbtPatternStep1: Number;
  rgbtPatternStep2: Number;
  rgbtPatternStep3: Number;
  rgbtPatternStep4: Number;
  rgbtPatternStep5: Number;
  rgbtPatternStep6: Number;
  rgbtPatternStep7: Number;
  rgbtPatternStep8: Number;
  rgbtPatternStep9: Number;
  rgbtPatternStep10: Number;
  rgbtPatternStep11: Number;
  rgbtPatternStep12: Number;
  rgbtPatternStep13: Number;
  rgbtPatternStep14: Number;
  rgbtPatternStep15: Number;
}

export interface DiscoveredAddresses {
  parentAddress: Number;
  childAddresses: Array<Number>;
  numberOfChildModules: Number;
}
