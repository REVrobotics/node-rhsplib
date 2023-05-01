#include "RevHubWrapper.h"

#include <rev/RHSPlib_device_control.h>
#include <rev/RHSPlib_dio.h>
#include <rev/RHSPlib_i2c.h>
#include <rev/RHSPlib_motor.h>
#include <rev/RHSPlib_pwm.h>
#include <rev/RHSPlib_servo.h>

#include "RHSPlibWorker.h"
#include "serialWrapper.h"

// See https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md
Napi::Object RevHub::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(
      env, "RevHub",
      {
          RevHub::InstanceMethod("open", &RevHub::open),
          RevHub::InstanceMethod("isOpened", &RevHub::isOpened),
          RevHub::InstanceMethod("close", &RevHub::close),
          RevHub::InstanceMethod("setDestAddress", &RevHub::setDestAddress),
          RevHub::InstanceMethod("getDestAddress", &RevHub::getDestAddress),
          RevHub::InstanceMethod("setResponseTimeoutMs",
                                 &RevHub::setResponseTimeoutMs),
          RevHub::InstanceMethod("getResponseTimeoutMs",
                                 &RevHub::getResponseTimeoutMs),
          RevHub::InstanceMethod("sendWriteCommandInternal",
                                 &RevHub::sendWriteCommandInternal),
          RevHub::InstanceMethod("sendWriteCommand", &RevHub::sendWriteCommand),
          RevHub::InstanceMethod("sendReadCommandInternal",
                                 &RevHub::sendReadCommandInternal),
          RevHub::InstanceMethod("sendReadCommand", &RevHub::sendReadCommand),
          RevHub::InstanceMethod("getModuleStatus", &RevHub::getModuleStatus),
          RevHub::InstanceMethod("sendKeepAlive", &RevHub::sendKeepAlive),
          RevHub::InstanceMethod("sendFailSafe", &RevHub::sendFailSafe),
          RevHub::InstanceMethod("setNewModuleAddress",
                                 &RevHub::setNewModuleAddress),
          RevHub::InstanceMethod("queryInterface", &RevHub::queryInterface),
          RevHub::InstanceMethod("setModuleLEDColor",
                                 &RevHub::setModuleLEDColor),
          RevHub::InstanceMethod("getModuleLEDColor",
                                 &RevHub::getModuleLEDColor),
          RevHub::InstanceMethod("setModuleLEDPattern",
                                 &RevHub::setModuleLEDPattern),
          RevHub::InstanceMethod("getModuleLEDPattern",
                                 &RevHub::getModuleLEDPattern),
          RevHub::InstanceMethod("setDebugLogLevel", &RevHub::setDebugLogLevel),
          RevHub::StaticMethod("discoverRevHubs", &RevHub::discoverRevHubs),
          RevHub::InstanceMethod("getInterfacePacketID",
                                 &RevHub::getInterfacePacketID),
          RevHub::InstanceMethod("getBulkInputData", &RevHub::getBulkInputData),
          RevHub::InstanceMethod("getADC", &RevHub::getADC),
          RevHub::InstanceMethod("setPhoneChargeControl",
                                 &RevHub::setPhoneChargeControl),
          RevHub::InstanceMethod("getPhoneChargeControl",
                                 &RevHub::getPhoneChargeControl),
          RevHub::InstanceMethod("injectDataLogHint",
                                 &RevHub::injectDataLogHint),
          RevHub::InstanceMethod("readVersionString",
                                 &RevHub::readVersionString),
          RevHub::InstanceMethod("readVersion", &RevHub::readVersion),
          RevHub::InstanceMethod("setFTDIResetControl",
                                 &RevHub::setFTDIResetControl),
          RevHub::InstanceMethod("getFTDIResetControl",
                                 &RevHub::getFTDIResetControl),
          RevHub::InstanceMethod("setDigitalSingleOutput",
                                 &RevHub::setDigitalSingleOutput),
          RevHub::InstanceMethod("setDigitalAllOutputs",
                                 &RevHub::setDigitalAllOutputs),
          RevHub::InstanceMethod("setDigitalDirection",
                                 &RevHub::setDigitalDirection),
          RevHub::InstanceMethod("getDigitalDirection",
                                 &RevHub::getDigitalDirection),
          RevHub::InstanceMethod("getDigitalSingleInput",
                                 &RevHub::getDigitalSingleInput),
          RevHub::InstanceMethod("getDigitalAllInputs",
                                 &RevHub::getDigitalAllInputs),
          RevHub::InstanceMethod("setI2CChannelConfiguration",
                                 &RevHub::setI2CChannelConfiguration),
          RevHub::InstanceMethod("getI2CChannelConfiguration",
                                 &RevHub::getI2CChannelConfiguration),
          RevHub::InstanceMethod("writeI2CSingleByte",
                                 &RevHub::writeI2CSingleByte),
          RevHub::InstanceMethod("writeI2CMultipleBytes",
                                 &RevHub::writeI2CMultipleBytes),
          RevHub::InstanceMethod("getI2CWriteStatus",
                                 &RevHub::getI2CWriteStatus),
          RevHub::InstanceMethod("readI2CSingleByte",
                                 &RevHub::readI2CSingleByte),
          RevHub::InstanceMethod("readI2CMultipleBytes",
                                 &RevHub::readI2CMultipleBytes),
          RevHub::InstanceMethod("writeI2CReadMultipleBytes",
                                 &RevHub::writeI2CReadMultipleBytes),
          RevHub::InstanceMethod("getI2CReadStatus", &RevHub::getI2CReadStatus),
          RevHub::InstanceMethod("setMotorChannelMode",
                                 &RevHub::setMotorChannelMode),
          RevHub::InstanceMethod("getMotorChannelMode",
                                 &RevHub::getMotorChannelMode),
          RevHub::InstanceMethod("setMotorChannelEnable",
                                 &RevHub::setMotorChannelEnable),
          RevHub::InstanceMethod("getMotorChannelEnable",
                                 &RevHub::getMotorChannelEnable),
          RevHub::InstanceMethod("setMotorChannelCurrentAlertLevel",
                                 &RevHub::setMotorChannelCurrentAlertLevel),
          RevHub::InstanceMethod("getMotorChannelCurrentAlertLevel",
                                 &RevHub::getMotorChannelCurrentAlertLevel),
          RevHub::InstanceMethod("resetMotorEncoder",
                                 &RevHub::resetMotorEncoder),
          RevHub::InstanceMethod("setMotorConstantPower",
                                 &RevHub::setMotorConstantPower),
          RevHub::InstanceMethod("getMotorConstantPower",
                                 &RevHub::getMotorConstantPower),
          RevHub::InstanceMethod("setMotorTargetVelocity",
                                 &RevHub::setMotorTargetVelocity),
          RevHub::InstanceMethod("getMotorTargetVelocity",
                                 &RevHub::getMotorTargetVelocity),
          RevHub::InstanceMethod("setMotorTargetPosition",
                                 &RevHub::setMotorTargetPosition),
          RevHub::InstanceMethod("getMotorTargetPosition",
                                 &RevHub::getMotorTargetPosition),
          RevHub::InstanceMethod("getMotorAtTarget", &RevHub::getMotorAtTarget),
          RevHub::InstanceMethod("getMotorEncoderPosition",
                                 &RevHub::getMotorEncoderPosition),
          RevHub::InstanceMethod("setMotorPIDCoefficients",
                                 &RevHub::setMotorPIDCoefficients),
          RevHub::InstanceMethod("getMotorPIDCoefficients",
                                 &RevHub::getMotorPIDCoefficients),
          RevHub::InstanceMethod("setPWMConfiguration",
                                 &RevHub::setPWMConfiguration),
          RevHub::InstanceMethod("getPWMConfiguration",
                                 &RevHub::getPWMConfiguration),
          RevHub::InstanceMethod("setPWMPulseWidth", &RevHub::setPWMPulseWidth),
          RevHub::InstanceMethod("getPWMPulseWidth", &RevHub::getPWMPulseWidth),
          RevHub::InstanceMethod("setPWMEnable", &RevHub::setPWMEnable),
          RevHub::InstanceMethod("getPWMEnable", &RevHub::getPWMEnable),
          RevHub::InstanceMethod("setServoConfiguration",
                                 &RevHub::setServoConfiguration),
          RevHub::InstanceMethod("getServoConfiguration",
                                 &RevHub::getServoConfiguration),
          RevHub::InstanceMethod("setServoPulseWidth",
                                 &RevHub::setServoPulseWidth),
          RevHub::InstanceMethod("getServoPulseWidth",
                                 &RevHub::getServoPulseWidth),
          RevHub::InstanceMethod("setServoEnable", &RevHub::setServoEnable),
          RevHub::InstanceMethod("getServoEnable", &RevHub::getServoEnable),
      });

  Napi::FunctionReference *constructor = new Napi::FunctionReference();

  *constructor = Napi::Persistent(func);
  exports.Set("RevHub", func);

  env.SetInstanceData<Napi::FunctionReference>(constructor);

  return exports;
}

RevHub::RevHub(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RevHub>(info) {
  Napi::Env env = info.Env();

  RHSPlib_init(&this->obj);

  // TODO(jan): Non-default constructor that calls RevHub::open()
}

Napi::Value RevHub::open(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());
  uint8_t destAddress = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_open(&this->obj, serialPort->getSerialObj(), destAddress);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::isOpened(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Boolean::New(env, RHSPlib_isOpened(&this->obj));
}

void RevHub::close(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_close(&this->obj);
}

void RevHub::setDestAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t destAddress = info[0].As<Napi::Number>().Uint32Value();

  RHSPlib_setDestAddress(&this->obj, destAddress);
}

Napi::Value RevHub::getDestAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Number::New(env, RHSPlib_destAddress(&this->obj));
}

void RevHub::setResponseTimeoutMs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint32_t responseTimeoutMs = info[0].As<Napi::Number>().Uint32Value();

  RHSPlib_setResponseTimeoutMs(&this->obj, responseTimeoutMs);
}

Napi::Value RevHub::getResponseTimeoutMs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Number::New(env, RHSPlib_responseTimeoutMs(&this->obj));
}

Napi::Value RevHub::sendWriteCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_sendWriteCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::sendWriteCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  using retType = RHSPlib_PayloadData_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData,
                                     payloadSize, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Array responsePayload = Napi::Array::New(_env);
    if (_data.size) {
      for (int i = 0; i < _data.size; i++) {
        responsePayload[i] = _data.data[i];
      }
    }
    return responsePayload;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::sendReadCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_sendReadCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::sendReadCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  using retType = RHSPlib_PayloadData_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData,
                                     payloadSize, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Array responsePayload = Napi::Array::New(_env);
    if (_data.size) {
      for (int i = 0; i < _data.size; i++) {
        responsePayload[i] = _data.data[i];
      }
    }
    return responsePayload;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getModuleStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t clearStatusAfterResponse = info[0].As<Napi::Boolean>().Value();

  using retType = RHSPlib_ModuleStatus_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_getModuleStatus(&this->obj, clearStatusAfterResponse,
                                    &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object statusObj = Napi::Object::New(_env);
    statusObj.Set("statusWord", _data.statusWord);
    statusObj.Set("motorAlerts", _data.motorAlerts);
    return statusObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::sendKeepAlive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(
      worker, env, { _code = RHSPlib_sendKeepAlive(&this->obj, &_nackCode); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::sendFailSafe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(worker, env,
                     { _code = RHSPlib_sendFailSafe(&this->obj, &_nackCode); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setNewModuleAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t newModuleAddress = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code =
        RHSPlib_setNewModuleAddress(&this->obj, newModuleAddress, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::queryInterface(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::string interfaceNameStr = info[0].As<Napi::String>().Utf8Value();

  using retType = RHSPlib_Module_Interface_T;
  CREATE_WORKER(worker, env, retType, {
    const char *interfaceName = interfaceNameStr.c_str();
    _code =
        RHSPlib_queryInterface(&this->obj, interfaceName, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object interfaceObj = Napi::Object::New(_env);
    interfaceObj.Set("name", _data.name);
    interfaceObj.Set("firstPacketID", _data.firstPacketID);
    interfaceObj.Set("numberIDValues", _data.numberIDValues);
    return interfaceObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t red = info[0].As<Napi::Number>().Uint32Value();
  uint8_t green = info[1].As<Napi::Number>().Uint32Value();
  uint8_t blue = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_setModuleLEDColor(&this->obj, red, green, blue, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t *;
  CREATE_WORKER(worker, env, retType, {
    _data = new uint8_t[3];

    _code = RHSPlib_getModuleLEDColor(&this->obj, &_data[0], &_data[1],
                                      &_data[2], &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object RGB = Napi::Object::New(_env);
    RGB.Set("red", _data[0]);
    RGB.Set("green", _data[1]);
    RGB.Set("blue", _data[2]);
    delete[] _data;
    return RGB;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setModuleLEDPattern(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Object ledPatternObj = info[0].As<Napi::Object>();

  // TODO(jan): find a better way to do this
  RHSPlib_LEDPattern_T ledPattern;
  ledPattern.rgbtPatternStep0 =
      ledPatternObj.Get("rgbtPatternStep0").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep1 =
      ledPatternObj.Get("rgbtPatternStep1").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep2 =
      ledPatternObj.Get("rgbtPatternStep2").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep3 =
      ledPatternObj.Get("rgbtPatternStep3").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep4 =
      ledPatternObj.Get("rgbtPatternStep4").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep5 =
      ledPatternObj.Get("rgbtPatternStep5").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep6 =
      ledPatternObj.Get("rgbtPatternStep6").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep7 =
      ledPatternObj.Get("rgbtPatternStep7").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep8 =
      ledPatternObj.Get("rgbtPatternStep8").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep9 =
      ledPatternObj.Get("rgbtPatternStep9").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep10 =
      ledPatternObj.Get("rgbtPatternStep10").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep11 =
      ledPatternObj.Get("rgbtPatternStep11").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep12 =
      ledPatternObj.Get("rgbtPatternStep12").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep13 =
      ledPatternObj.Get("rgbtPatternStep13").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep14 =
      ledPatternObj.Get("rgbtPatternStep14").As<Napi::Number>().Uint32Value();
  ledPattern.rgbtPatternStep15 =
      ledPatternObj.Get("rgbtPatternStep15").As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_setModuleLEDPattern(&this->obj, &ledPattern, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getModuleLEDPattern(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_LEDPattern_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_getModuleLEDPattern(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object ledPatternObj = Napi::Object::New(_env);
    ledPatternObj.Set("rgbtPatternStep0", _data.rgbtPatternStep0);
    ledPatternObj.Set("rgbtPatternStep1", _data.rgbtPatternStep1);
    ledPatternObj.Set("rgbtPatternStep2", _data.rgbtPatternStep2);
    ledPatternObj.Set("rgbtPatternStep3", _data.rgbtPatternStep3);
    ledPatternObj.Set("rgbtPatternStep4", _data.rgbtPatternStep4);
    ledPatternObj.Set("rgbtPatternStep5", _data.rgbtPatternStep5);
    ledPatternObj.Set("rgbtPatternStep6", _data.rgbtPatternStep6);
    ledPatternObj.Set("rgbtPatternStep7", _data.rgbtPatternStep7);
    ledPatternObj.Set("rgbtPatternStep8", _data.rgbtPatternStep8);
    ledPatternObj.Set("rgbtPatternStep9", _data.rgbtPatternStep9);
    ledPatternObj.Set("rgbtPatternStep10", _data.rgbtPatternStep10);
    ledPatternObj.Set("rgbtPatternStep11", _data.rgbtPatternStep11);
    ledPatternObj.Set("rgbtPatternStep12", _data.rgbtPatternStep12);
    ledPatternObj.Set("rgbtPatternStep13", _data.rgbtPatternStep13);
    ledPatternObj.Set("rgbtPatternStep14", _data.rgbtPatternStep14);
    ledPatternObj.Set("rgbtPatternStep15", _data.rgbtPatternStep15);
    return ledPatternObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setDebugLogLevel(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_DebugGroupNumber_T debugGroupNumber =
      static_cast<RHSPlib_DebugGroupNumber_T>(
          info[0].As<Napi::Number>().Uint32Value());
  RHSPlib_VerbosityLevel_T verbosityLevel =
      static_cast<RHSPlib_VerbosityLevel_T>(
          info[1].As<Napi::Number>().Uint32Value());

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_setDebugLogLevel(&this->obj, debugGroupNumber,
                                     verbosityLevel, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::discoverRevHubs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());

  using retType = RHSPlib_DiscoveredAddresses_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_discovery(serialPort->getSerialObj(), &_data);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object discoveredAddressesObj = Napi::Object::New(_env);
    discoveredAddressesObj.Set("parentAddress", _data.parentAddress);
    discoveredAddressesObj.Set("numberOfChildModules",
                               _data.numberOfChildModules);

    Napi::Array childAddresses = Napi::Array::New(_env);
    for (int i = 0; i < _data.numberOfChildModules; i++) {
      childAddresses[i] = _data.childAddresses[i];
    }
    discoveredAddressesObj.Set("childAddresses", childAddresses);

    return discoveredAddressesObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getInterfacePacketID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::string interfaceNameStr = info[0].As<Napi::String>().Utf8Value();
  uint16_t functionNumber = info[1].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    const char *interfaceName = interfaceNameStr.c_str();
    _code = RHSPlib_getInterfacePacketID(&this->obj, interfaceName,
                                         functionNumber, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getBulkInputData(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_BulkInputData_T;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_deviceControl_getBulkInputData(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object bulkInputDataObj = Napi::Object::New(_env);
    bulkInputDataObj.Set("digitalInputs", _data.digitalInputs);
    bulkInputDataObj.Set("motor0position_enc", _data.motor0position_enc);
    bulkInputDataObj.Set("motor1position_enc", _data.motor1position_enc);
    bulkInputDataObj.Set("motor2position_enc", _data.motor2position_enc);
    bulkInputDataObj.Set("motor3position_enc", _data.motor3position_enc);
    bulkInputDataObj.Set("motorStatus", _data.motorStatus);
    bulkInputDataObj.Set("motor0velocity_cps", _data.motor0velocity_cps);
    bulkInputDataObj.Set("motor1velocity_cps", _data.motor1velocity_cps);
    bulkInputDataObj.Set("motor2velocity_cps", _data.motor2velocity_cps);
    bulkInputDataObj.Set("motor3velocity_cps", _data.motor3velocity_cps);
    bulkInputDataObj.Set("analog0_mV", _data.analog0_mV);
    bulkInputDataObj.Set("analog1_mV", _data.analog1_mV);
    bulkInputDataObj.Set("analog2_mV", _data.analog2_mV);
    bulkInputDataObj.Set("analog3_mV", _data.analog3_mV);
    bulkInputDataObj.Set("attentionRequired", _data.attentionRequired);
    return bulkInputDataObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getADC(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t adcChannelToRead = info[0].As<Napi::Number>().Uint32Value();
  uint8_t rawMode = info[1].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_deviceControl_getADC(&this->obj, adcChannelToRead, rawMode,
                                         &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setPhoneChargeControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t chargeEnable = info[0].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_deviceControl_phoneChargeControl(&this->obj, chargeEnable,
                                                     &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getPhoneChargeControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_deviceControl_phoneChargeQuery(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::injectDataLogHint(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  std::string hintTextStr = info[0].As<Napi::String>().Utf8Value();

  CREATE_VOID_WORKER(worker, env, {
    const char *hintText = hintTextStr.c_str();
    _code = RHSPlib_deviceControl_injectDataLogHint(&this->obj, hintText,
                                                    &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::readVersionString(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = struct {
    uint8_t textLength;
    char text[40];
  };
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_deviceControl_readVersionString(
        &this->obj, &_data.textLength, _data.text, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    return Napi::String::New(_env, _data.text, _data.textLength);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::readVersion(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_Version_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_deviceControl_readVersion(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object version = Napi::Object::New(_env);
    version.Set("engineeringRevision", _data.engineeringRevision);
    version.Set("minorVersion", _data.minorVersion);
    version.Set("majorVersion", _data.majorVersion);
    version.Set("minorHwRevision", _data.minorHwRevision);
    version.Set("majorHwRevision", _data.majorHwRevision);
    version.Set("hwType", _data.hwType);
    return version;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setFTDIResetControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t ftdiResetControl = info[0].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_deviceControl_ftdiResetControl(&this->obj, ftdiResetControl,
                                                   &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getFTDIResetControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_deviceControl_ftdiResetQuery(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setDigitalSingleOutput(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();
  uint8_t value = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_dio_setSingleOutput(&this->obj, dioPin, value, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setDigitalAllOutputs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t bitPackedField = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_dio_setAllOutputs(&this->obj, bitPackedField, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setDigitalDirection(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();
  uint8_t direction = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_dio_setDirection(&this->obj, dioPin, direction, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getDigitalDirection(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_dio_getDirection(&this->obj, dioPin, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getDigitalSingleInput(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_dio_getSingleInput(&this->obj, dioPin, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getDigitalAllInputs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_dio_getAllInputs(&this->obj, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setI2CChannelConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t speedCode = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_configureChannel(&this->obj, i2cChannel, speedCode,
                                         &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getI2CChannelConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_i2c_configureQuery(&this->obj, i2cChannel, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::writeI2CSingleByte(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t byte = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_writeSingleByte(&this->obj, i2cChannel, slaveAddress,
                                        byte, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::writeI2CMultipleBytes(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  Napi::Array bytesArray = info[2].As<Napi::Array>();
  uint8_t numBytes = bytesArray.Length();

  uint8_t *bytes = new uint8_t[numBytes];
  for (int i = 0; i < numBytes; i++) {
    bytes[i] = bytesArray.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_writeMultipleBytes(&this->obj, i2cChannel, slaveAddress,
                                           numBytes, bytes, &_nackCode);
    delete[] bytes;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getI2CWriteStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t i2cTransactionStatus;
    uint8_t numBytesWritten;
  };
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_i2c_writeStatusQuery(&this->obj, i2cChannel,
                                         &_data.i2cTransactionStatus,
                                         &_data.numBytesWritten, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object i2cWriteStatus = Napi::Object::New(_env);
    i2cWriteStatus.Set("i2cTransactionStatus", _data.i2cTransactionStatus);
    i2cWriteStatus.Set("numBytesWritten", _data.numBytesWritten);
    return i2cWriteStatus;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::readI2CSingleByte(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_readSingleByte(&this->obj, i2cChannel, slaveAddress,
                                       &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::readI2CMultipleBytes(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t numBytesToRead = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_readMultipleBytes(&this->obj, i2cChannel, slaveAddress,
                                          numBytesToRead, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::writeI2CReadMultipleBytes(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t numBytesToRead = info[2].As<Napi::Number>().Uint32Value();
  uint8_t startAddress = info[3].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_i2c_writeReadMultipleBytes(&this->obj, i2cChannel,
                                               slaveAddress, numBytesToRead,
                                               startAddress, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getI2CReadStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t i2cTransactionStatus;
    uint8_t numBytesRead;
    uint8_t bytes[100];
  };
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_i2c_readStatusQuery(
        &this->obj, i2cChannel, &_data.i2cTransactionStatus,
        &_data.numBytesRead, _data.bytes, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object i2cReadStatus = Napi::Object::New(_env);
    i2cReadStatus.Set("i2cTransactionStatus", _data.i2cTransactionStatus);
    i2cReadStatus.Set("numBytesRead", _data.numBytesRead);
    Napi::Array bytes = Napi::Array::New(_env, _data.numBytesRead);
    for (int i = 0; i < _data.numBytesRead; i++) {
      bytes[i] = _data.bytes[i];
    }
    i2cReadStatus.Set("bytes", bytes);
    return i2cReadStatus;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorChannelMode(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();
  uint8_t floatAtZero = info[2].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setChannelMode(&this->obj, motorChannel, motorMode,
                                         floatAtZero, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorChannelMode(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t motorMode;
    uint8_t floatAtZero;
  };
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_motor_getChannelMode(&this->obj, motorChannel, &_data.motorMode,
                                     &_data.floatAtZero, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object motorChannelMode = Napi::Object::New(_env);
    motorChannelMode.Set("motorMode", _data.motorMode);
    motorChannelMode.Set("floatAtZero",
                         Napi::Boolean::New(_env, _data.floatAtZero));
    return motorChannelMode;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorChannelEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t enabled = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setChannelEnable(&this->obj, motorChannel, enabled,
                                           &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorChannelEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getChannelEnable(&this->obj, motorChannel, &_data,
                                           &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorChannelCurrentAlertLevel(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t currentLimit_mA = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setChannelCurrentAlertLevel(
        &this->obj, motorChannel, currentLimit_mA, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorChannelCurrentAlertLevel(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getChannelCurrentAlertLevel(&this->obj, motorChannel,
                                                      &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::resetMotorEncoder(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_resetEncoder(&this->obj, motorChannel, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorConstantPower(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int16_t powerLevel = info[1].As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setConstantPower(&this->obj, motorChannel, powerLevel,
                                           &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorConstantPower(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getConstantPower(&this->obj, motorChannel, &_data,
                                           &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorTargetVelocity(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int16_t motorVelocity = info[1].As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setTargetVelocity(&this->obj, motorChannel,
                                            motorVelocity, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorTargetVelocity(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getTargetVelocity(&this->obj, motorChannel, &_data,
                                            &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  return Napi::Number::New(env, 0);
}

Napi::Value RevHub::setMotorTargetPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int32_t targetPosition = info[1].As<Napi::Number>().Int32Value();
  uint16_t targetTolerance = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setTargetPosition(
        &this->obj, motorChannel, targetPosition, targetTolerance, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorTargetPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    int32_t targetPosition;
    uint16_t targetTolerance;
  };
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getTargetPosition(&this->obj, motorChannel,
                                            &_data.targetPosition,
                                            &_data.targetTolerance, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object targetPositionObj = Napi::Object::New(_env);
    targetPositionObj.Set("targetPosition", _data.targetPosition);
    targetPositionObj.Set("targetTolerance", _data.targetTolerance);
    return targetPositionObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorAtTarget(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getMotorAtTarget(&this->obj, motorChannel, &_data,
                                           &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorEncoderPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int32_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getEncoderPosition(&this->obj, motorChannel, &_data,
                                             &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setMotorPIDCoefficients(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();
  Napi::Object pid = info[2].As<Napi::Object>();
  int32_t proportionalCoeff = pid.Get("P").As<Napi::Number>().Int32Value();
  int32_t integralCoeff = pid.Get("I").As<Napi::Number>().Int32Value();
  int32_t derivativeCoeff = pid.Get("D").As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_motor_setPIDControlLoopCoefficients(
        &this->obj, motorChannel, motorMode, proportionalCoeff, integralCoeff,
        derivativeCoeff, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getMotorPIDCoefficients(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();

  using retType = struct {
    int32_t proportionalCoeff;
    int32_t integralCoeff;
    int32_t derivativeCoeff;
  };
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_motor_getPIDControlLoopCoefficients(
        &this->obj, motorChannel, motorMode, &_data.proportionalCoeff,
        &_data.integralCoeff, &_data.derivativeCoeff, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object pidCoeffObj = Napi::Object::New(_env);
    pidCoeffObj.Set("P", _data.proportionalCoeff);
    pidCoeffObj.Set("I", _data.integralCoeff);
    pidCoeffObj.Set("D", _data.derivativeCoeff);
    return pidCoeffObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setPWMConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t framePeriod = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_pwm_setConfiguration(&this->obj, pwmChannel, framePeriod,
                                         &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getPWMConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_pwm_getConfiguration(&this->obj, pwmChannel, &_data,
                                         &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setPWMPulseWidth(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t pulseWidth = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_pwm_setPulseWidth(&this->obj, pwmChannel, pulseWidth,
                                      &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getPWMPulseWidth(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_pwm_getPulseWidth(&this->obj, pwmChannel, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setPWMEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t enable = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_pwm_setEnable(&this->obj, pwmChannel, enable, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getPWMEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t pwmChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_pwm_getEnable(&this->obj, pwmChannel, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setServoConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t framePeriod = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_servo_setConfiguration(&this->obj, servoChannel,
                                           framePeriod, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getServoConfiguration(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_servo_getConfiguration(&this->obj, servoChannel, &_data,
                                           &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setServoPulseWidth(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t pulseWidth = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_servo_setPulseWidth(&this->obj, servoChannel, pulseWidth,
                                        &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getServoPulseWidth(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_servo_getPulseWidth(&this->obj, servoChannel, &_data,
                                        &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::setServoEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t enable = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    _code =
        RHSPlib_servo_setEnable(&this->obj, servoChannel, enable, &_nackCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RevHub::getServoEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t servoChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    _code =
        RHSPlib_servo_getEnable(&this->obj, servoChannel, &_data, &_nackCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}
