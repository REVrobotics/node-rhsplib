#include "rhsplibWrapper.h"

#include <rev/RHSPlib_device_control.h>
#include <rev/RHSPlib_dio.h>
#include <rev/RHSPlib_i2c.h>
#include <rev/RHSPlib_motor.h>

#include "RHSPlibWorker.h"
#include "serialWrapper.h"

// See https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md
Napi::Object RHSPlib::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(
      env, "RHSPlib",
      {
          RHSPlib::InstanceMethod("open", &RHSPlib::open),
          RHSPlib::InstanceMethod("isOpened", &RHSPlib::isOpened),
          RHSPlib::InstanceMethod("close", &RHSPlib::close),
          RHSPlib::InstanceMethod("setDestAddress", &RHSPlib::setDestAddress),
          RHSPlib::InstanceMethod("getDestAddress", &RHSPlib::getDestAddress),
          RHSPlib::InstanceMethod("setResponseTimeoutMs",
                                  &RHSPlib::setResponseTimeoutMs),
          RHSPlib::InstanceMethod("getResponseTimeoutMs",
                                  &RHSPlib::getResponseTimeoutMs),
          RHSPlib::InstanceMethod("sendWriteCommandInternal",
                                  &RHSPlib::sendWriteCommandInternal),
          RHSPlib::InstanceMethod("sendWriteCommand",
                                  &RHSPlib::sendWriteCommand),
          RHSPlib::InstanceMethod("sendReadCommandInternal",
                                  &RHSPlib::sendReadCommandInternal),
          RHSPlib::InstanceMethod("sendReadCommand", &RHSPlib::sendReadCommand),
          RHSPlib::InstanceMethod("getModuleStatus", &RHSPlib::getModuleStatus),
          RHSPlib::InstanceMethod("sendKeepAlive", &RHSPlib::sendKeepAlive),
          RHSPlib::InstanceMethod("sendFailSafe", &RHSPlib::sendFailSafe),
          RHSPlib::InstanceMethod("setNewModuleAddress",
                                  &RHSPlib::setNewModuleAddress),
          RHSPlib::InstanceMethod("queryInterface", &RHSPlib::queryInterface),
          RHSPlib::InstanceMethod("setModuleLEDColor",
                                  &RHSPlib::setModuleLEDColor),
          RHSPlib::InstanceMethod("getModuleLEDColor",
                                  &RHSPlib::getModuleLEDColor),
          RHSPlib::InstanceMethod("setModuleLEDPattern",
                                  &RHSPlib::setModuleLEDPattern),
          RHSPlib::InstanceMethod("getModuleLEDPattern",
                                  &RHSPlib::getModuleLEDPattern),
          RHSPlib::InstanceMethod("setDebugLogLevel",
                                  &RHSPlib::setDebugLogLevel),
          RHSPlib::StaticMethod("discovery", &RHSPlib::discovery),
          RHSPlib::InstanceMethod("getInterfacePacketID",
                                  &RHSPlib::getInterfacePacketID),
          RHSPlib::InstanceMethod("getBulkInputData",
                                  &RHSPlib::getBulkInputData),
          RHSPlib::InstanceMethod("getADC", &RHSPlib::getADC),
          RHSPlib::InstanceMethod("setPhoneChargeControl",
                                  &RHSPlib::setPhoneChargeControl),
          RHSPlib::InstanceMethod("getPhoneChargeControl",
                                  &RHSPlib::getPhoneChargeControl),
          RHSPlib::InstanceMethod("injectDataLogHint",
                                  &RHSPlib::injectDataLogHint),
          RHSPlib::InstanceMethod("readVersionString",
                                  &RHSPlib::readVersionString),
          RHSPlib::InstanceMethod("readVersion", &RHSPlib::readVersion),
          RHSPlib::InstanceMethod("setFTDIResetControl",
                                  &RHSPlib::setFTDIResetControl),
          RHSPlib::InstanceMethod("getFTDIResetControl",
                                  &RHSPlib::getFTDIResetControl),
          RHSPlib::InstanceMethod("setDigitalSingleOutput",
                                  &RHSPlib::setDigitalSingleOutput),
          RHSPlib::InstanceMethod("setDigitalAllOutputs",
                                  &RHSPlib::setDigitalAllOutputs),
          RHSPlib::InstanceMethod("setDigitalDirection",
                                  &RHSPlib::setDigitalDirection),
          RHSPlib::InstanceMethod("getDigitalDirection",
                                  &RHSPlib::getDigitalDirection),
          RHSPlib::InstanceMethod("getDigitalSingleInput",
                                  &RHSPlib::getDigitalSingleInput),
          RHSPlib::InstanceMethod("getDigitalAllInputs",
                                  &RHSPlib::getDigitalAllInputs),
          RHSPlib::InstanceMethod("setI2CChannelConfiguration",
                                  &RHSPlib::setI2CChannelConfiguration),
          RHSPlib::InstanceMethod("getI2CChannelConfiguration",
                                  &RHSPlib::getI2CChannelConfiguration),
          RHSPlib::InstanceMethod("writeI2CSingleByte",
                                  &RHSPlib::writeI2CSingleByte),
          RHSPlib::InstanceMethod("writeI2CMultipleBytes",
                                  &RHSPlib::writeI2CMultipleBytes),
          RHSPlib::InstanceMethod("getI2CWriteStatus",
                                  &RHSPlib::getI2CWriteStatus),
          RHSPlib::InstanceMethod("readI2CSingleByte",
                                  &RHSPlib::readI2CSingleByte),
          RHSPlib::InstanceMethod("readI2CMultipleBytes",
                                  &RHSPlib::readI2CMultipleBytes),
          RHSPlib::InstanceMethod("writeI2CReadMultipleBytes",
                                  &RHSPlib::writeI2CReadMultipleBytes),
          RHSPlib::InstanceMethod("getI2CReadStatus",
                                  &RHSPlib::getI2CReadStatus),
          RHSPlib::InstanceMethod("setMotorChannelMode",
                                  &RHSPlib::setMotorChannelMode),
          RHSPlib::InstanceMethod("getMotorChannelMode",
                                  &RHSPlib::getMotorChannelMode),
          RHSPlib::InstanceMethod("setMotorChannelEnable",
                                  &RHSPlib::setMotorChannelEnable),
          RHSPlib::InstanceMethod("getMotorChannelEnable",
                                  &RHSPlib::getMotorChannelEnable),
          RHSPlib::InstanceMethod("setMotorChannelCurrentAlertLevel",
                                  &RHSPlib::setMotorChannelCurrentAlertLevel),
          RHSPlib::InstanceMethod("getMotorChannelCurrentAlertLevel",
                                  &RHSPlib::getMotorChannelCurrentAlertLevel),
          RHSPlib::InstanceMethod("resetMotorEncoder",
                                  &RHSPlib::resetMotorEncoder),
          RHSPlib::InstanceMethod("setMotorConstantPower",
                                  &RHSPlib::setMotorConstantPower),
          RHSPlib::InstanceMethod("getMotorConstantPower",
                                  &RHSPlib::getMotorConstantPower),
          RHSPlib::InstanceMethod("setMotorTargetVelocity",
                                  &RHSPlib::setMotorTargetVelocity),
          RHSPlib::InstanceMethod("getMotorTargetVelocity",
                                  &RHSPlib::getMotorTargetVelocity),
          RHSPlib::InstanceMethod("setMotorTargetPosition",
                                  &RHSPlib::setMotorTargetPosition),
          RHSPlib::InstanceMethod("getMotorTargetPosition",
                                  &RHSPlib::getMotorTargetPosition),
          RHSPlib::InstanceMethod("getMotorAtTarget",
                                  &RHSPlib::getMotorAtTarget),
          RHSPlib::InstanceMethod("getMotorEncoderPosition",
                                  &RHSPlib::getMotorEncoderPosition),
          RHSPlib::InstanceMethod("setMotorPIDCoefficients",
                                  &RHSPlib::setMotorPIDCoefficients),
          RHSPlib::InstanceMethod("getMotorPIDCoefficients",
                                  &RHSPlib::getMotorPIDCoefficients),
      });

  Napi::FunctionReference *constructor = new Napi::FunctionReference();

  *constructor = Napi::Persistent(func);
  exports.Set("RHSPlib", func);

  env.SetInstanceData<Napi::FunctionReference>(constructor);

  return exports;
}

RHSPlib::RHSPlib(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RHSPlib>(info) {
  Napi::Env env = info.Env();

  RHSPlib_init(&this->obj);

  // TODO(jan): Non-default constructor that calls RHSPlib::open()
}

Napi::Value RHSPlib::open(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());
  uint8_t destAddress = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_open(&this->obj, &serialPort->getSerialObj(), destAddress);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::isOpened(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Boolean::New(env, RHSPlib_isOpened(&this->obj));
}

void RHSPlib::close(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_close(&this->obj);
}

void RHSPlib::setDestAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t destAddress = info[0].As<Napi::Number>().Uint32Value();

  RHSPlib_setDestAddress(&this->obj, destAddress);
}

Napi::Value RHSPlib::getDestAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Number::New(env, RHSPlib_destAddress(&this->obj));
}

void RHSPlib::setResponseTimeoutMs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint32_t responseTimeoutMs = info[0].As<Napi::Number>().Uint32Value();

  RHSPlib_setResponseTimeoutMs(&this->obj, responseTimeoutMs);
}

Napi::Value RHSPlib::getResponseTimeoutMs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  return Napi::Number::New(env, RHSPlib_responseTimeoutMs(&this->obj));
}

Napi::Value RHSPlib::sendWriteCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendWriteCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::sendWriteCommand(const Napi::CallbackInfo &info) {
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
    uint8_t nackReasonCode;
    _code = RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData,
                                     payloadSize, &_data, &nackReasonCode);
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

Napi::Value RHSPlib::sendReadCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = payload.Length();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendReadCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::sendReadCommand(const Napi::CallbackInfo &info) {
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
    uint8_t nackReasonCode;
    _code = RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData,
                                     payloadSize, &_data, &nackReasonCode);
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

Napi::Value RHSPlib::getModuleStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t clearStatusAfterResponse = info[0].As<Napi::Boolean>().Value();

  using retType = RHSPlib_ModuleStatus_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_getModuleStatus(&this->obj, clearStatusAfterResponse,
                                    &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object statusObj = Napi::Object::New(_env);
    statusObj.Set("statusWord", _data.statusWord);
    statusObj.Set("motorAlerts", _data.motorAlerts);
    return statusObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::sendKeepAlive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendKeepAlive(&this->obj, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::sendFailSafe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendFailSafe(&this->obj, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setNewModuleAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t newModuleAddress = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_setNewModuleAddress(&this->obj, newModuleAddress,
                                        &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::queryInterface(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *interfaceName = &(info[0].As<Napi::String>().Utf8Value())[0];

  using retType = RHSPlib_Module_Interface_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_queryInterface(&this->obj, interfaceName, &_data,
                                   &nackReasonCode);
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

Napi::Value RHSPlib::setModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t red = info[0].As<Napi::Number>().Uint32Value();
  uint8_t green = info[1].As<Napi::Number>().Uint32Value();
  uint8_t blue = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_setModuleLEDColor(&this->obj, red, green, blue,
                                      &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t *;
  CREATE_WORKER(worker, env, retType, {
    _data = new uint8_t[3];
    uint8_t nackReasonCode;
    _code = RHSPlib_getModuleLEDColor(&this->obj, &_data[0], &_data[1],
                                      &_data[2], &nackReasonCode);
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

Napi::Value RHSPlib::setModuleLEDPattern(const Napi::CallbackInfo &info) {
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
    uint8_t nackReasonCode;
    _code =
        RHSPlib_setModuleLEDPattern(&this->obj, &ledPattern, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getModuleLEDPattern(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_LEDPattern_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_getModuleLEDPattern(&this->obj, &_data, &nackReasonCode);
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

Napi::Value RHSPlib::setDebugLogLevel(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_DebugGroupNumber_T debugGroupNumber =
      static_cast<RHSPlib_DebugGroupNumber_T>(
          info[0].As<Napi::Number>().Uint32Value());
  RHSPlib_VerbosityLevel_T verbosityLevel =
      static_cast<RHSPlib_VerbosityLevel_T>(
          info[1].As<Napi::Number>().Uint32Value());

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_setDebugLogLevel(&this->obj, debugGroupNumber,
                                     verbosityLevel, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::discovery(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());

  using retType = RHSPlib_DiscoveredAddresses_T;
  CREATE_WORKER(worker, env, retType, {
    _code = RHSPlib_discovery(&serialPort->getSerialObj(), &_data);
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

Napi::Value RHSPlib::getInterfacePacketID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *interfaceName = &(info[0].As<Napi::String>().Utf8Value())[0];
  uint16_t functionNumber = info[1].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_getInterfacePacketID(
        &this->obj, interfaceName, functionNumber, &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getBulkInputData(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_BulkInputData_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_getBulkInputData(&this->obj, &_data,
                                                   &nackReasonCode);
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

Napi::Value RHSPlib::getADC(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t adcChannelToRead = info[0].As<Napi::Number>().Uint32Value();
  uint8_t rawMode = info[1].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_getADC(&this->obj, adcChannelToRead, rawMode,
                                         &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setPhoneChargeControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t chargeEnable = info[0].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_phoneChargeControl(&this->obj, chargeEnable,
                                                     &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getPhoneChargeControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_phoneChargeQuery(&this->obj, &_data,
                                                   &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::injectDataLogHint(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *hintText = &(info[0].As<Napi::String>().Utf8Value())[0];

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_injectDataLogHint(&this->obj, hintText,
                                                    &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::readVersionString(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = struct {
    uint8_t textLength;
    char text[40];
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_readVersionString(
        &this->obj, &_data.textLength, _data.text, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    return Napi::String::New(_env, _data.text, _data.textLength);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::readVersion(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_Version_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_deviceControl_readVersion(&this->obj, &_data, &nackReasonCode);
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

Napi::Value RHSPlib::setFTDIResetControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t ftdiResetControl = info[0].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_ftdiResetControl(&this->obj, ftdiResetControl,
                                                   &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getFTDIResetControl(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_deviceControl_ftdiResetQuery(&this->obj, &_data,
                                                 &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setDigitalSingleOutput(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();
  uint8_t value = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_dio_setSingleOutput(&this->obj, dioPin, value, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setDigitalAllOutputs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t bitPackedField = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_dio_setAllOutputs(&this->obj, bitPackedField, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setDigitalDirection(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();
  uint8_t direction = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_dio_setDirection(&this->obj, dioPin, direction,
                                     &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getDigitalDirection(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_dio_getDirection(&this->obj, dioPin, &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getDigitalSingleInput(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t dioPin = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_dio_getSingleInput(&this->obj, dioPin, &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getDigitalAllInputs(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_dio_getAllInputs(&this->obj, &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setI2CChannelConfiguration(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t speedCode = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_configureChannel(&this->obj, i2cChannel, speedCode,
                                         &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getI2CChannelConfiguration(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_configureQuery(&this->obj, i2cChannel, &_data,
                                       &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::writeI2CSingleByte(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t byte = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_writeSingleByte(&this->obj, i2cChannel, slaveAddress,
                                        byte, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::writeI2CMultipleBytes(const Napi::CallbackInfo &info) {
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
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_writeMultipleBytes(&this->obj, i2cChannel, slaveAddress,
                                           numBytes, bytes, &nackReasonCode);
    delete[] bytes;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getI2CWriteStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t i2cTransactionStatus;
    uint8_t numBytesWritten;
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_writeStatusQuery(
        &this->obj, i2cChannel, &_data.i2cTransactionStatus,
        &_data.numBytesWritten, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    if (_code < 0) {
      Napi::Object nullStatus = Napi::Object::New(_env);
      nullStatus.Set("i2cTransactionStatus", 0);
      nullStatus.Set("numBytesWritten", 0);
      return nullStatus;
    }

    Napi::Object i2cWriteStatus = Napi::Object::New(_env);
    i2cWriteStatus.Set("i2cTransactionStatus", _data.i2cTransactionStatus);
    i2cWriteStatus.Set("numBytesWritten", _data.numBytesWritten);
    return i2cWriteStatus;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::readI2CSingleByte(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_readSingleByte(&this->obj, i2cChannel, slaveAddress,
                                       &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::readI2CMultipleBytes(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t numBytesToRead = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_readMultipleBytes(&this->obj, i2cChannel, slaveAddress,
                                          numBytesToRead, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::writeI2CReadMultipleBytes(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t slaveAddress = info[1].As<Napi::Number>().Uint32Value();
  uint8_t numBytesToRead = info[2].As<Napi::Number>().Uint32Value();
  uint8_t startAddress = info[3].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_writeReadMultipleBytes(&this->obj, i2cChannel,
                                               slaveAddress, numBytesToRead,
                                               startAddress, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getI2CReadStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t i2cChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t i2cTransactionStatus;
    uint8_t numBytesRead;
    uint8_t bytes[100];
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_i2c_readStatusQuery(
        &this->obj, i2cChannel, &_data.i2cTransactionStatus,
        &_data.numBytesRead, _data.bytes, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    if (_code < 0) {
      Napi::Object nullStatus = Napi::Object::New(_env);
      nullStatus.Set("i2cTransactionStatus", 0);
      nullStatus.Set("numBytesRead", 0);
      nullStatus.Set("bytes", Napi::Array::New(_env, 0));
      return nullStatus;
    }

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

Napi::Value RHSPlib::setMotorChannelMode(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();
  uint8_t floatAtZero = info[2].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setChannelMode(&this->obj, motorChannel, motorMode,
                                         floatAtZero, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorChannelMode(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    uint8_t motorMode;
    uint8_t floatAtZero;
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_motor_getChannelMode(&this->obj, motorChannel, &_data.motorMode,
                                     &_data.floatAtZero, &nackReasonCode);
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

Napi::Value RHSPlib::setMotorChannelEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t enabled = info[1].As<Napi::Boolean>().Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setChannelEnable(&this->obj, motorChannel, enabled,
                                           &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorChannelEnable(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getChannelEnable(&this->obj, motorChannel, &_data,
                                           &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setMotorChannelCurrentAlertLevel(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint16_t currentLimit_mA = info[1].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setChannelCurrentAlertLevel(
        &this->obj, motorChannel, currentLimit_mA, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorChannelCurrentAlertLevel(
    const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint16_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getChannelCurrentAlertLevel(&this->obj, motorChannel,
                                                      &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::resetMotorEncoder(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code =
        RHSPlib_motor_resetEncoder(&this->obj, motorChannel, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setMotorConstantPower(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int16_t powerLevel = info[1].As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setConstantPower(&this->obj, motorChannel, powerLevel,
                                           &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorConstantPower(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getConstantPower(&this->obj, motorChannel, &_data,
                                           &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setMotorTargetVelocity(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int16_t motorVelocity = info[1].As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setTargetVelocity(&this->obj, motorChannel,
                                            motorVelocity, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorTargetVelocity(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int16_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getTargetVelocity(&this->obj, motorChannel, &_data,
                                            &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  return Napi::Number::New(env, 0);
}

Napi::Value RHSPlib::setMotorTargetPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  int32_t targetPosition = info[1].As<Napi::Number>().Int32Value();
  uint16_t targetTolerance = info[2].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setTargetPosition(&this->obj, motorChannel,
                                            targetPosition, targetTolerance,
                                            &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorTargetPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = struct {
    int32_t targetPosition;
    uint16_t targetTolerance;
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getTargetPosition(
        &this->obj, motorChannel, &_data.targetPosition, &_data.targetTolerance,
        &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object targetPositionObj = Napi::Object::New(_env);
    targetPositionObj.Set("targetPosition", _data.targetPosition);
    targetPositionObj.Set("targetTolerance", _data.targetTolerance);
    return targetPositionObj;
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorAtTarget(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getMotorAtTarget(&this->obj, motorChannel, &_data,
                                           &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Boolean::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorEncoderPosition(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();

  using retType = int32_t;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getEncoderPosition(&this->obj, motorChannel, &_data,
                                             &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType,
                      { return Napi::Number::New(_env, _data); });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::setMotorPIDCoefficients(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();
  Napi::Object pid = info[2].As<Napi::Object>();
  int32_t proportionalCoeff = pid.Get("P").As<Napi::Number>().Int32Value();
  int32_t integralCoeff = pid.Get("I").As<Napi::Number>().Int32Value();
  int32_t derivativeCoeff = pid.Get("D").As<Napi::Number>().Int32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_setPIDControlLoopCoefficients(
        &this->obj, motorChannel, motorMode, proportionalCoeff, integralCoeff,
        derivativeCoeff, &nackReasonCode);
  });

  QUEUE_WORKER(worker);
}

Napi::Value RHSPlib::getMotorPIDCoefficients(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t motorChannel = info[0].As<Napi::Number>().Uint32Value();
  uint8_t motorMode = info[1].As<Napi::Number>().Uint32Value();

  using retType = struct {
    int32_t proportionalCoeff;
    int32_t integralCoeff;
    int32_t derivativeCoeff;
  };
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_motor_getPIDControlLoopCoefficients(
        &this->obj, motorChannel, motorMode, &_data.proportionalCoeff,
        &_data.integralCoeff, &_data.derivativeCoeff, &nackReasonCode);
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
