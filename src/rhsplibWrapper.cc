#include "rhsplibWrapper.h"

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

  worker->Queue();
  return worker->GetPromise();
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
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendWriteCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &nackReasonCode);
  });

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::sendWriteCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();

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

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::sendReadCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendReadCommandInternal(
        &this->obj, packetTypeID, payloadData, payloadSize, &nackReasonCode);
  });

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::sendReadCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();

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

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::getModuleStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t clearStatusAfterResponse = info[0].As<Napi::Number>().Uint32Value();

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

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::sendKeepAlive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendKeepAlive(&this->obj, &nackReasonCode);
  });

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::sendFailSafe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_sendFailSafe(&this->obj, &nackReasonCode);
  });

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::setNewModuleAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t newModuleAddress = info[0].As<Napi::Number>().Uint32Value();

  CREATE_VOID_WORKER(worker, env, {
    uint8_t nackReasonCode;
    _code = RHSPlib_setNewModuleAddress(&this->obj, newModuleAddress,
                                        &nackReasonCode);
  });

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
}

Napi::Value RHSPlib::getModuleLEDPattern(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  using retType = RHSPlib_LEDPattern_T;
  CREATE_WORKER(worker, env, retType, {
    uint8_t nackReasonCode;
    _code = RHSPlib_getModuleLEDPattern(&this->obj, &_data, &nackReasonCode);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Object ledPatternObj = Napi::Object::New(env);
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

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
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

  worker->Queue();
  return worker->GetPromise();
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
                      { return Napi::Number::New(env, _data); });

  worker->Queue();
  return worker->GetPromise();
}
