#ifndef REVHUB_WRAPPER_H_
#define REVHUB_WRAPPER_H_

#include <napi.h>
#include <RHSPlib.h>

class RevHub : public Napi::ObjectWrap<RevHub> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  RevHub(const Napi::CallbackInfo &info);

  Napi::Value open(const Napi::CallbackInfo &info);
  Napi::Value isOpened(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);
  void setDestAddress(const Napi::CallbackInfo &info);
  Napi::Value getDestAddress(const Napi::CallbackInfo &info);
  void setResponseTimeoutMs(const Napi::CallbackInfo &info);
  Napi::Value getResponseTimeoutMs(const Napi::CallbackInfo &info);
  Napi::Value sendWriteCommandInternal(const Napi::CallbackInfo &info);
  Napi::Value sendWriteCommand(const Napi::CallbackInfo &info);
  Napi::Value sendReadCommandInternal(const Napi::CallbackInfo &info);
  Napi::Value sendReadCommand(const Napi::CallbackInfo &info);
  Napi::Value getModuleStatus(const Napi::CallbackInfo &info);
  Napi::Value sendKeepAlive(const Napi::CallbackInfo &info);
  Napi::Value sendFailSafe(const Napi::CallbackInfo &info);
  Napi::Value setNewModuleAddress(const Napi::CallbackInfo &info);
  Napi::Value queryInterface(const Napi::CallbackInfo &info);
  Napi::Value setModuleLEDColor(const Napi::CallbackInfo &info);
  Napi::Value getModuleLEDColor(const Napi::CallbackInfo &info);
  Napi::Value setModuleLEDPattern(const Napi::CallbackInfo &info);
  Napi::Value getModuleLEDPattern(const Napi::CallbackInfo &info);
  Napi::Value setDebugLogLevel(const Napi::CallbackInfo &info);
  static Napi::Value discoverRevHubs(const Napi::CallbackInfo &info);
  Napi::Value getInterfacePacketID(const Napi::CallbackInfo &info);

  /* Device Control */

  Napi::Value getBulkInputData(const Napi::CallbackInfo &info);
  Napi::Value getADC(const Napi::CallbackInfo &info);
  Napi::Value setPhoneChargeControl(const Napi::CallbackInfo &info);
  Napi::Value getPhoneChargeControl(const Napi::CallbackInfo &info);
  Napi::Value injectDataLogHint(const Napi::CallbackInfo &info);
  Napi::Value readVersionString(const Napi::CallbackInfo &info);
  Napi::Value readVersion(const Napi::CallbackInfo &info);
  Napi::Value setFTDIResetControl(const Napi::CallbackInfo &info);
  Napi::Value getFTDIResetControl(const Napi::CallbackInfo &info);

  /* Digital */
  Napi::Value setDigitalSingleOutput(const Napi::CallbackInfo &info);
  Napi::Value setDigitalAllOutputs(const Napi::CallbackInfo &info);
  Napi::Value setDigitalDirection(const Napi::CallbackInfo &info);
  Napi::Value getDigitalDirection(const Napi::CallbackInfo &info);
  Napi::Value getDigitalSingleInput(const Napi::CallbackInfo &info);
  Napi::Value getDigitalAllInputs(const Napi::CallbackInfo &info);

  /* I2C */
  Napi::Value setI2CChannelConfiguration(const Napi::CallbackInfo &info);
  Napi::Value getI2CChannelConfiguration(const Napi::CallbackInfo &info);
  Napi::Value writeI2CSingleByte(const Napi::CallbackInfo &info);
  Napi::Value writeI2CMultipleBytes(const Napi::CallbackInfo &info);
  Napi::Value getI2CWriteStatus(const Napi::CallbackInfo &info);
  Napi::Value readI2CSingleByte(const Napi::CallbackInfo &info);
  Napi::Value readI2CMultipleBytes(const Napi::CallbackInfo &info);
  Napi::Value writeI2CReadMultipleBytes(const Napi::CallbackInfo &info);
  Napi::Value getI2CReadStatus(const Napi::CallbackInfo &info);

  /* Motor */
  Napi::Value setMotorChannelMode(const Napi::CallbackInfo &info);
  Napi::Value getMotorChannelMode(const Napi::CallbackInfo &info);
  Napi::Value setMotorChannelEnable(const Napi::CallbackInfo &info);
  Napi::Value getMotorChannelEnable(const Napi::CallbackInfo &info);
  Napi::Value setMotorChannelCurrentAlertLevel(const Napi::CallbackInfo &info);
  Napi::Value getMotorChannelCurrentAlertLevel(const Napi::CallbackInfo &info);
  Napi::Value resetMotorEncoder(const Napi::CallbackInfo &info);
  Napi::Value setMotorConstantPower(const Napi::CallbackInfo &info);
  Napi::Value getMotorConstantPower(const Napi::CallbackInfo &info);
  Napi::Value setMotorTargetVelocity(const Napi::CallbackInfo &info);
  Napi::Value getMotorTargetVelocity(const Napi::CallbackInfo &info);
  Napi::Value setMotorTargetPosition(const Napi::CallbackInfo &info);
  Napi::Value getMotorTargetPosition(const Napi::CallbackInfo &info);
  Napi::Value getMotorAtTarget(const Napi::CallbackInfo &info);
  Napi::Value getMotorEncoderPosition(const Napi::CallbackInfo &info);
  Napi::Value setMotorPIDCoefficients(const Napi::CallbackInfo &info);
  Napi::Value getMotorPIDCoefficients(const Napi::CallbackInfo &info);
  Napi::Value setMotorPIDFCoefficients(const Napi::CallbackInfo &info);
  Napi::Value getMotorPIDFCoefficients(const Napi::CallbackInfo &info);

  /* PWM */
  Napi::Value setPWMConfiguration(const Napi::CallbackInfo &info);
  Napi::Value getPWMConfiguration(const Napi::CallbackInfo &info);
  Napi::Value setPWMPulseWidth(const Napi::CallbackInfo &info);
  Napi::Value getPWMPulseWidth(const Napi::CallbackInfo &info);
  Napi::Value setPWMEnable(const Napi::CallbackInfo &info);
  Napi::Value getPWMEnable(const Napi::CallbackInfo &info);

  /* Servo */
  Napi::Value setServoConfiguration(const Napi::CallbackInfo &info);
  Napi::Value getServoConfiguration(const Napi::CallbackInfo &info);
  Napi::Value setServoPulseWidth(const Napi::CallbackInfo &info);
  Napi::Value getServoPulseWidth(const Napi::CallbackInfo &info);
  Napi::Value setServoEnable(const Napi::CallbackInfo &info);
  Napi::Value getServoEnable(const Napi::CallbackInfo &info);

 private:
  RHSPlib_Module_T obj;
};

#endif
