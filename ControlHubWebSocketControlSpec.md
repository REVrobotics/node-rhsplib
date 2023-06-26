# Specification for an FTC WebSocket namespace to control hardware connected to Control Hubs

## Implementation Note

We don't want to fight with a user Op Mode over control of the hardware; that would be a recipe for trouble. Instead, my idea is to work within the Op Mode system. I would add a built-in, hidden Manual Control Op Mode (MC) that would provide hardware access to the WebSocket API. Using the API would auto-start the MC, and the user could go back to normal operation by stopping the MC from the Driver Station, like any other Op Mode. If a different Op Mode is already running, an error will be reported via the manual control API, and the original Op Mode will keep running.

## Details

1. **Command: Get connected USB devices**

   Sending this command starts the MC, which does a USB scan, so that all connected REV modules can be controlled, even if they aren't included in the current configuration file. The response also includes modules that are configured, but not currently attached. The attachment and configuration state of each device is specified in the response. The response also includes an API version number.

2. **Notification: MC stopped**

   The API client needs to know when the MC is stopped, and it has lost control of the hardware. It can recover from this by sending the command to get connected devices again.

3. **Command: Stop MC**

   The API client needs the ability to specify when it is done performing manual control.

4. **Command: Discover child modules**

   Performs Discovery for all specified serial numbers

5. **Command: Start sending IMU data**

   Starts sending the IMU data notification at a specified frequency. Returns an error if the device is not a Control Hub.

6. **Notification: IMU data**
   Contains the latest IMU data from the Control Hub

There will be additional commands for the various things that an Expansion/Control Hub can do, which typically map to the different RHSP commands.

### Close

**Name**: `close` \
**Payload**: None \
**Response**: None

### Send Write Command

**Name**: `sendWriteCommand`

#### Payload

```
{
    packetTypeId: number
    payload: number[]
}
```

#### Response

```
{
    response: number[]
}
```

### Send Read Command

**Name**: `sendReadCommand`

#### Payload

```
{
    packetTypeId: number
    payload: number[]
}
```

#### Response

```
{
    response: number[]
}
```

### Get Module Status

**Name**: `getModuleStatus`

#### Payload

```
{
    clear: boolean
}
```

#### Response

```
{
    statusWord: number // range: [0,7]
    motorAlerts: number // range: [0,5]
}
```

### Send Fail Safe

**Name**: `sendFailSafe` \
**Payload**: None \
**Response**: None

### Set Module Address

**Name**: `setModuleAddress`

#### Payload

```
{
    address: number
}
```

**Response**: None

### Query Interface command

Name: `queryInterface`

#### Payload

```
{
  interfaceName: string
}
```

#### Response

```
{
  packetId: number
  numIdValues: number
}
```

### Set Module LED color

**Name**: `setModuleLedColor`

#### Payload

```
{
    red: number //range: [0,255]
    green: number //range: [0,255]
    blue: number //range: [0,255]
}
```

**Response**: None

### Get Module LED Color

**Name**: `getModuleLedColor`\
**Payload**: None

#### Response

```
{
  red: number
  green: number
  blue: number
}
```

### Set Module LED Pattern

**Name**: `setModuleLedPattern`

#### Payload

```
{
    pattern: number[][] //array of 4-element number arrays in t,r,g,b format.
}
```

**Response**: None

### Get Module LED Pattern

**Name**: `getModuleLedPattern` \
**Payload**: None

#### Response

```
{
    pattern: number[][] //array of 4-element number arrays in t,r,g,b format.
}
```

### Set Debug Log Level

**Name**: `setDebugLogLevel`

#### Payload

```
{
    /*
        Main = 1
        Transmitter (to Host) = 2
        Receiver (from Host) = 3
        ADC = 4
        PWM and Servo = 5
        Module LED = 6
        Digital IO = 7
        I2C = 8
        Motor 0 = 9
        Motor 1 = 10
        Motor 2 = 11
        Motor 3 = 12
    */
    debugGroup: number
    verbosity: number // [1 = least verbose, 3 = most verbose]
}
```

**Response**: None

### Get Interface Packet ID

This method is not well-documented

**Name**: `getInterfacePacketId`

#### Payload

```
{
    interfaceName: string
    functionNumber: number
}
```

#### Response

```
{
    response: number
}
```

### Get Bulk Input Data

**Name**: `getBulkInputData` \
**Payload**: None

#### Response

```
{
    digitalInputs: number //bitmap of digital pins
    motor0position_enc: number //Motor 0 encoder raw counts
    motor1position_enc: number //Motor 1 encoder raw counts
    motor2position_enc: number //Motor 2 encoder raw counts
    motor3position_enc: number //Motor 3 encoder raw counts
    motorStatus: number //Motor Status byte [0,0x0F]
    motor0velocity_cps: number //Motor 0 velocity counts per second
    motor1velocity_cps: number //Motor 1 velocity counts per second
    motor2velocity_cps: number //Motor 2 velocity counts per second
    motor3velocity_cps: number //Motor 3 velocity counts per second
    analog0_mV: number //analog input 0 mV
    analog1_mV: number //analog input 1 mV
    analog2_mV: number //analog input 2 mV
    analog3_mV: number //analog input 3 mV
    attentionRequired: number
}
```

### Get ADC Value

**Name**: `getADC`

#### Payload

```
{
    channel: number // ADC channel [0,14]
    rawMode: boolean // Use engineering units or raw counts
}
```

#### Response

```
{
    value: number
}
```

### Set Phone Charge Control

**Name**: `setPhoneChargeControl`

#### Payload

```
{
    chargeEnable: boolean
}
```

**Response**: None

### Get Phone Charge Control

**Name**: `getPhoneChargeControl` \
**Payload**: None

#### Response

```
{
    chargeEnable: boolean
}
```

### Inject Data Log Hint

**Name**: `injectDataLogHint`

#### Payload

```
{
    hint: string // text to log
}
```

**Response**: None

### Read Version String

**Name**: `readVersionString` \
**Payload**: None

#### Response

```
{
    verson: string
}
```

### Set FTDI Reset Control

**Name**: `setFtdiResetControl`

#### Payload

```
{
    shouldReset: boolean //whether to reset FTDI chip on keep alive timeout
}
```

**Response**: None

### Get FTDI Reset Control

**Name**: `getFTDI Reset Control` \
**Payload**: None

#### Response

```
{
    shouldReset: boolean //see above command
}
```

### Set Digital Output

**Name**: `setDigitalOutput`

#### Payload

```
{
    pin: number
    value: boolean
}
```

**Response**: None

### Set Digital All Outputs

**Name**: `setDigitalAllOutputs`

#### Payload

```
{
    bitpacked: number // bitpacked field of pin states
}
```

**Response**: None

### Set Digital Direction

**Name**: `setDigitalDirection`

#### Payload

```
{
    pin: number
    direction: number // input = 0, output = 1
}
```

**Response**: None

### Get Digital Input

**Name**: `getDigitalInput`

#### Payload

```
{
    pin: number
}
```

#### Response

```
{
    value: boolean
}
```

### Get Digital All Inputs

**Name**: `getDigitalAllInputs` \
**Payload**: None

#### Response

```
{
    bitpacked: number //bitpacked field of all input pins
}
```

### Get Digital Direction

**Name**: `getDigitalDirection`

#### Payload

```
{
    pin: number
}
```

#### Response

```
{
    direction: number //input = 0, output = 1
}
```

### Set I2C Channel Configuration

**Name**: `setI2CChannelConfiguration`

#### Payload

```
{
    channel: number
    speedCode: number //standard = 0, fast = 1
}
```

**Response**: None

### Get I2C Channel Configuration

**Name**: `getI2CChannelConfiguration`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    speedCode: number //see above command
}
```

### Write I2C Single Byte

**Name**: `writeI2CSingleByte`

#### Payload

```
{
    channel: number
    targetAddress: number
    data: number //[0,255]
}
```

**Response**: None

### Write I2C Multiple Bytes

**Name**: `writeI2CMultipleBytes`

#### Payload

```
{
    channel: number
    targetAddress: number
    data: number[] //each element [0,255]
}
```

**Response**: None

### Get I2C Status

**Name**: `getI2CStatus`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    status: number // bitmap of [!SCL, !SDA, Res, Res, MCLK, MARB, MDAK, MADDR]
    bytesWritten: number
}
```

### Read I2C Single Byte

**Name**: `readI2CSingleByte`

#### Payload

```
{
    channel: number
    targetAddress: number
}
```

**Response**: None //get the read status

### Read I2C multiple bytes

**Name**: `readI2CMultipleBytes`

#### Payload

```
{
    channel: number
    targetAddress: number
    numBytesToRead: number
}
```

**Response**: None //get the read status

### Write and Read I2C Multiple Bytes

**Name**: `writeI2CReadMultipleBytes`

#### Payload

```
{
    channel: number
    targetAddress: number
    numBytesToRead: number
    startAdress: number //value to send before reading [0,255]
}
```

**Response**: None

### Get I2C Read Status

**Name**: `getI2CReadStatus`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    status: number [0, 255]
    numBytesRead: number
    data: number[] //each element [0, 255]
}
```

### Set Motor Channel Mode

**Name**: `setMotorChannelMode`

#### Payload

```
{
    channel: number
    motorMode: number //Constant Power = 0, Constant Velocity = 1, Position Target = 2
    floatAtZero: boolean //whether to brake or coast when power is 0
}
```

**Response**: None

### Get Motor Channel Mode

**Name**: `getMotorChannelMode`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    motorMode: number //Constant Power = 0, Constant Velocity = 1, Position Target = 2
    floatAtZero: boolean //whether to brake or coast when power is 0
}
```

### Set Motor Chanel Enable

**Name**: `setMotorChannelEnable`

#### Payload

```
{
    channel: number
    enable: boolean
}
```

**Response**: None

### Get Motor Channel Enable

**Name**: `getMotorChannelEnable`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    enable: boolean
}
```

### Set Motor Channel Current Alert

**Name**: `setMotorChannelCurrentAlert`

#### Payload

```
{
    channel: number
    currentLimitMa: number //current limit (in mA)
}
```

**Response**: None

### Get Motor Channel Current Alert

**Name**: `getMotorChannelCurrentAlert`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
        currentLimitMa: number //current limit (in mA)
}
```

### Reset Motor Encoder

**Name**: `resetMotorEncoder`

#### Payload

```
{
    channel: number
}
```

**Response**: None

### Set Motor Constant Power

**Name**: `setMotorConstantPower`

#### Payload

```
{
    channel: number
    power: number [-1,1]
}
```

**Response**: None

### Get Motor Constant Power

**Name**: `getMotorConstantPower`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    power: number
}
```

### Set Motor Target Velocity

**Name**: `setMotorTargetVelocity`

#### Payload

```
{
    channel: number
    velocityCps: number //encoder counts per second
}
```

**Response**: None

### Get Motor Target Velocity

**Name**: `getMotorTargetVelocity`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    velocityCps: number //encoder counts per second
}
```

### Set Motor Target Position

**Name**: `setMotorTargetPosition`

#### Payload

```
{
    channel: number
    position: number //encoder counts
    tolerance: number //encoder counts
}
```

**Response**: None

### Get Motor Target Position

**Name**: `getMotorTargetPosition`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    position: number //encoder counts
    tolerance: number //encoder counts
}
```

### Is Motor At Target

**Name**: `isMotorAtTarget`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    isAtTarget: boolean
}
```

### Get Motor Encoder position

**Name**: `getMotorEncoderPosition`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    position: number //encoder counts
}
```

### Set Motor PID Coefficients

**Name**: `setMotorPidCoefficients`

#### Payload

```
{
    channel: number
    motorMode: number //Constant Power = 0, Target Velocity = 1, Target Position = 2
    coefficients: {
        p: number
        i: number
        d: number
    }
}
```

**Response**: None

### Get Motor PID Coefficients

**Name**: `getMotorPidCoefficients`

#### Payload

```
{
    channel: number
    motorMode: number //Constant Power = 0, Target Velocity = 1, Target Position = 2
}
```

#### Response

```
{
    coefficients: {
        p: number
        i: number
        d: number
    }
}
```

### Set Servo Configuration

**Name**: `setServoConfiguration`

#### Payload

```
{
    channel: number
    framePeriod: number
}
```

**Response**: None

### Get Servo Configuration

**Name**: `getServoConfiguration`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    framePeriod: number
}
```

### Set Servo Pulse Width

**Name**: `setServoPulseWidth`

#### Payload

```
{
    channel: number
    pulseWidth: number
}
```

### Get Servo Pulse Width

**Name**: `getServoPulseWidth`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    pulseWidth: number
}
```

### Set Servo Enable

**Name**: `setServoEnable`

#### Payload

```
{
    channel: number
    enable: boolean
}
```

**Response**: None

### Get Servo Enable

**Name**: `getServoEnable`

#### Payload

```
{
    channel: number
}
```

#### Response

```
{
    enable: boolean
}
```
