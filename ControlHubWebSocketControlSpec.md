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

### Stop

Stops the MC op mode.

**Name**: `stop` \
**Payload**: None \
**Response**: None

### Send Fail Safe

**Name**: `sendFailSafe`

#### Payload

```
{
  hId: any
}
```

**Response**: None

### Set Hub Address

**Name**: `setHubAddress`

#### Payload

```
{
  hId: any,
  newAddress: [0,255]
}
```

**Response**: None

### Query Interface command

Name: `queryInterface`

#### Payload

```
{
  hId: any,
  interfaceName: string
}
```

#### Response

```
{
  name: string,
  firstPacketId: number,
  numberIds: number
}
```

### Set Module LED color

**Name**: `setLedColor`

#### Payload

```
{
  hId: any,
  r: [0,255],
  g: [0,255],
  b: [0,255]
}
```

**Response**: None

### Get Module LED Color

**Name**: `getLedColor`

#### Payload

```
{
  hId: any
}
```

#### Response

```
{
  hId: any,
  r: [0,255],
  g: [0,255],
  b: [0,255]
}
```

### Set Module LED Pattern

**Name**: `setLedPattern`

#### Payload

```
{
  hId: any,
  s0: number, //bytes in t,r,g,b format.
  s1: number, //bytes in t,r,g,b format.
  s2: number, //bytes in t,r,g,b format.
  s3: number, //bytes in t,r,g,b format.
  s4: number, //bytes in t,r,g,b format.
  s5: number, //bytes in t,r,g,b format.
  s6: number, //bytes in t,r,g,b format.
  s7: number, //bytes in t,r,g,b format.
  s8: number, //bytes in t,r,g,b format.
  s9: number, //bytes in t,r,g,b format.
  s10: number, //bytes in t,r,g,b format.
  s11: number, //bytes in t,r,g,b format.
  s12: number, //bytes in t,r,g,b format.
  s13: number, //bytes in t,r,g,b format.
  s14: number, //bytes in t,r,g,b format.
  s15: number //bytes in t,r,g,b format.
}
```

**Response**: None

### Get Module LED Pattern

**Name**: `getLedPattern`

#### Payload

```
{
  hId: any
}
```

#### Response

```
{
  s0: number, //bytes in t,r,g,b format.
  s1: number, //bytes in t,r,g,b format.
  s2: number, //bytes in t,r,g,b format.
  s3: number, //bytes in t,r,g,b format.
  s4: number, //bytes in t,r,g,b format.
  s5: number, //bytes in t,r,g,b format.
  s6: number, //bytes in t,r,g,b format.
  s7: number, //bytes in t,r,g,b format.
  s8: number, //bytes in t,r,g,b format.
  s9: number, //bytes in t,r,g,b format.
  s10: number, //bytes in t,r,g,b format.
  s11: number, //bytes in t,r,g,b format.
  s12: number, //bytes in t,r,g,b format.
  s13: number, //bytes in t,r,g,b format.
  s14: number, //bytes in t,r,g,b format.
  s15: number //bytes in t,r,g,b format.
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
     verbosity: number // [0 = off, 1 = least verbose, 3 = most verbose]
}
```

**Response**: None

### Get Bulk Input Data

**Name**: `getBulkInputData`

#### Payload

```
{
  hId: any
}
```

#### Response

```
{
  diBf: number //bitmap of digital pins
  m0ep: number //Motor 0 encoder raw counts
  m1ep: number //Motor 1 encoder raw counts
  m2ep: number //Motor 2 encoder raw counts
  m3ep: number //Motor 3 encoder raw counts
  msBf: number //Motor Status byte [0,0x0F]
  m0v: number //Motor 0 velocity counts per second
  m1v: number //Motor 1 velocity counts per second
  m2v: number //Motor 2 velocity counts per second
  m3v: number //Motor 3 velocity counts per second
  a0: number //analog input 0 mV
  a1: number //analog input 1 mV
  a2: number //analog input 2 mV
  a3: number //analog input 3 mV
}
```

### Get ADC Value

**Name**: `getAnalogInput`

#### Payload

```
{
  hId: any,
  c: [0,3] // channel
}
```

#### Response

```
number
```

### Get Battery Current

**Name**: `getBatteryCurrent`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mA
```

### Get Battery Voltage

**Name**: `getBatteryVoltage`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mV
```

### Get Temperature

**Name**: `getTemperature`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number // degrees Celsius
```

### Get I2C current

**Name**: `getI2cCurrent`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mA
```

### Get Servo Current

**Name**: `getServoCurrent`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mA
```

### Get Digital Bus Current

**Name**: `getDigitalBusCurrent`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mA
```

### Get Motor Current

**Name**: `getMotorCurrent`

#### Payload

```
{
  hId: any,
  c: [0,3]
}
```

#### Response

```
number //mA
```

### Get 5V Bus Voltage

**Name**: `get5VBusVoltage`

#### Payload

```
{
  hId: any,
}
```

#### Response

```
number //mV
```

### Inject Data Log Hint

**Name**: `injectDataLogHint`

#### Payload

```
{
  hId: any,
  hint: string // text to log
}
```

**Response**: None

### Read Version String

**Name**: `readVersionString` \

#### Payload

```
{
  hId: any
}
```

#### Response

```
string
```

### Set Digital Output

**Name**: `setDigitalOutput`

#### Payload

```
{
  hId: any,
  c: [0,7], //channel
  v: boolean //output value
}
```

**Response**: None

### Set All Digital Outputs

**Name**: `setAllDigitalOutputs`

#### Payload

```
{
  hId: any,
  bf: number // bitpacked field of pin states
}
```

**Response**: None

### Set Digital Direction

**Name**: `setDigitalDirection`

#### Payload

```
{
  hId: any,
  c: [0,7],
  o: boolean // input = false, output = true
}
```

**Response**: None

### Get Digital Input

**Name**: `getDigitalInput`

#### Payload

```
{
  hId: any,
  c: [0,7]
}
```

#### Response

```
boolean
```

### Get All Digital Inputs

**Name**: `getAllDigitalInputs`

#### Payload

```
{
  hId: any
}
```

#### Response

```
number //bitpacked field of all input pins
```

### Get Digital Direction

**Name**: `isDigitalOutput`

#### Payload

```
{
  hid: any,
  c: [0,7] //channel
}
```

#### Response

```
boolean //input = false, output = true
```

### Set I2C Channel Configuration

**Name**: `setI2cChannelConfiguration`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  sc: number //speed code: standard = 0, fast = 1
}
```

**Response**: None

### Get I2C Channel Configuration

**Name**: `getI2cChannelConfiguration`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
number //see above command for speed code values
```

### Write I2C Data

**Name**: `writeI2cData`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  a: number, //target address
  d: number[] //data
}
```

**Response**: None

### Write I2C Register

**Name**: `writeI2cRegister`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  a: number, //target address
  d: number[], //data
  r: number //register
}
```

**Response**: None

### Read I2C Data

**Name**: `readI2cData`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  a: number, //target address
  cb: number //number of bytes to read
}
```

**Response**: None

### Read I2C Register

**Name**: `readI2cRegister`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  a: number, //target address
  cb: number, //number of bytes to read
  r: number //register
}
```

**Response**: None

### Set Motor Channel Mode

**Name**: `setMotorMode`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  m: number, //Constant Power = 0, Constant Velocity = 1, Position Target = 2
  faz: boolean //whether to brake or coast when power is 0
}
```

**Response**: None

### Get Motor Channel Mode

**Name**: `getMotorMode`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
{
    m: number, //Constant Power = 0, Constant Velocity = 1, Position Target = 2
    faz: boolean //whether to brake or coast when power is 0
}
```

### Set Motor Chanel Enable

**Name**: `setMotorEnabled`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  enable: boolean
}
```

**Response**: None

### Get Motor Channel Enable

**Name**: `getMotorEnable`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
boolean
```

### Set Motor Channel Current Alert

**Name**: `setMotorAlertLevel`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  cl: number //current limit (in mA)
}
```

**Response**: None

### Get Motor Channel Current Alert

**Name**: `getMotorAlertLevel`

#### Payload

```
{
  hId: any,
  c: [0,3]
}
```

#### Response

```
number //current limit (in mA)
```

### Reset Motor Encoder

**Name**: `resetMotorEncoder`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

**Response**: None

### Set Motor Constant Power

**Name**: `setMotorConstantPower`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  p: [-1.0,1.0] //power
}
```

**Response**: None

### Get Motor Constant Power

**Name**: `getMotorConstantPower`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
number
```

### Set Motor Target Velocity

**Name**: `setMotorTargetVelocity`

#### Payload

```
{
  hId: any,
  c: [0,3], //channel
  tv: number //encoder counts per second
}
```

**Response**: None

### Get Motor Target Velocity

**Name**: `getMotorTargetVelocity`

#### Payload

```
{
  hId: any,
  c: [0,3]
}
```

#### Response

```
number //encoder counts per second
```

### Set Motor Target Position

**Name**: `setMotorTargetPosition`

#### Payload

```
{
    c: [0,3], //channel
    tpc: number, //position in encoder counts
    ttc: number //tolerance in encoder counts
}
```

**Response**: None

### Get Motor Target Position

**Name**: `getMotorTargetPosition`

#### Payload

```
{
  hId: any,
  c: [0,3]
}
```

#### Response

```
{
  tpc: number, //position in encoder counts
  ttc: number //tolerance in encoder counts
}
```

### Is Motor At Target

**Name**: `getIsMotorAtTarget`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
boolean //isAtTarget
```

### Get Motor Encoder position

**Name**: `getMotorEncoder`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
number //position in encoder counts
```

### Set Motor PID Coefficients

**Name**: `setMotorPidCoefficients`

#### Payload

```
{
  hId: any,
  c: [0,3],
  m: number, //Constant Power = 0, Target Velocity = 1, Target Position = 2
  p: number,
  i: number,
  d: number
}
```

**Response**: None

### Get Motor PID Coefficients

**Name**: `getMotorPidCoefficients`

#### Payload

```
{
  hId: any,
  c: [0,3],
  m: number //Constant Power = 0, Target Velocity = 1, Target Position = 2
}
```

#### Response

```
{
  p: number,
  i: number,
  d: number
}
```

### Set Servo Configuration

**Name**: `setServoConfiguration`

#### Payload

```
{
  hId: any,
  c: [0,5], //channel
  fp: number //frame period
}
```

**Response**: None

### Get Servo Configuration

**Name**: `getServoConfiguration`

#### Payload

```
{
  hId: any,
  c: [0,5] //channel
}
```

#### Response

```
number //frame period
```

### Set Servo Pulse Width

**Name**: `setServoPulseWidth`

#### Payload

```
{
  hId: any,
  c: [0,5],
  pulseWidth: number
}
```

**Response**: None

### Get Servo Pulse Width

**Name**: `getServoPulseWidth`

#### Payload

```
{
  hId: any,
  c: [0,5]
}
```

#### Response

```
number //pulse width
```

### Set Servo Enable

**Name**: `setServoEnable`

#### Payload

```
{
  hId: any,
  c: [0,5], //channel
  enable: boolean
}
```

**Response**: None

### Get Servo Enable

**Name**: `getServoEnable`

#### Payload

```
{
  hId: any,
  c: [0,3] //channel
}
```

#### Response

```
boolean
```
