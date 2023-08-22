// These MUST be ordered so that their numeric values match the values specified in the REV Hub Serial Protocol spec
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
    Motor3,
}
