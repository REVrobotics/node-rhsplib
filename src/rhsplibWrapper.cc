#include "rhsplibWrapper.h"

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

void RHSPlib::open(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());
  uint8_t destAddress = info[1].As<Napi::Number>().Uint32Value();

  RHSPlib_open(&this->obj, &serialPort->getSerialObj(), destAddress);
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

void RHSPlib::sendWriteCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();
  uint8_t nackReasonCode;

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  RHSPlib_sendWriteCommandInternal(&this->obj, packetTypeID, payloadData,
                                   payloadSize, &nackReasonCode);
  // TODO(jan): Add error handling
}

Napi::Value RHSPlib::sendWriteCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();
  RHSPlib_PayloadData_T responsePayloadData;
  uint8_t nackReasonCode;

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData, payloadSize,
                           &responsePayloadData, &nackReasonCode);
  // TODO(jan): Add error handling

  if (responsePayloadData.size) {
    Napi::Array responsePayload = Napi::Array::New(env);
    for (int i = 0; i < responsePayloadData.size; i++) {
      responsePayload[i] = responsePayloadData.data[i];
    }
    return responsePayload;
  }

  return Napi::Array::New(env);
}

void RHSPlib::sendReadCommandInternal(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();
  uint8_t nackReasonCode;

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  RHSPlib_sendReadCommandInternal(&this->obj, packetTypeID, payloadData,
                                  payloadSize, &nackReasonCode);
  // TODO(jan): Add error handling
}

Napi::Value RHSPlib::sendReadCommand(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint16_t packetTypeID = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array payload = info[1].As<Napi::Array>();
  uint16_t payloadSize = info[2].As<Napi::Number>().Uint32Value();
  RHSPlib_PayloadData_T responsePayloadData;
  uint8_t nackReasonCode;

  uint8_t payloadData[RHSPLIB_MAX_PAYLOAD_SIZE];
  for (int i = 0; i < payloadSize; i++) {
    payloadData[i] = payload.Get(i).As<Napi::Number>().Uint32Value();
  }

  RHSPlib_sendWriteCommand(&this->obj, packetTypeID, payloadData, payloadSize,
                           &responsePayloadData, &nackReasonCode);
  // TODO(jan): Add error handling

  if (responsePayloadData.size) {
    Napi::Array responsePayload = Napi::Array::New(env);
    for (int i = 0; i < responsePayloadData.size; i++) {
      responsePayload[i] = responsePayloadData.data[i];
    }
    return responsePayload;
  }

  return Napi::Array::New(env);
}

Napi::Value RHSPlib::getModuleStatus(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t clearStatusAfterResponse = info[0].As<Napi::Number>().Uint32Value();
  RHSPlib_ModuleStatus_T status;
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_getModuleStatus(&this->obj, clearStatusAfterResponse, &status,
                          &nackReasonCode);

  Napi::Object statusObj = Napi::Object::New(env);
  statusObj.Set("statusWord", status.statusWord);
  statusObj.Set("motorAlerts", status.motorAlerts);

  return statusObj;
}

void RHSPlib::sendKeepAlive(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_sendKeepAlive(&this->obj, &nackReasonCode);
}

void RHSPlib::sendFailSafe(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_sendFailSafe(&this->obj, &nackReasonCode);
}

void RHSPlib::setNewModuleAddress(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t newModuleAddress = info[0].As<Napi::Number>().Uint32Value();
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_setNewModuleAddress(&this->obj, newModuleAddress, &nackReasonCode);
}

Napi::Value RHSPlib::queryInterface(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *interfaceName = &(info[0].As<Napi::String>().Utf8Value())[0];
  RHSPlib_Module_Interface_T interfaceData;
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_queryInterface(&this->obj, interfaceName, &interfaceData,
                         &nackReasonCode);

  Napi::Object interfaceObj = Napi::Object::New(env);
  interfaceObj.Set("name", interfaceData.name);
  interfaceObj.Set("firstPacketID", interfaceData.firstPacketID);
  interfaceObj.Set("numberIDValues", interfaceData.numberIDValues);
  return interfaceObj;
}

void RHSPlib::setModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t red = info[0].As<Napi::Number>().Uint32Value();
  uint8_t green = info[1].As<Napi::Number>().Uint32Value();
  uint8_t blue = info[2].As<Napi::Number>().Uint32Value();
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_setModuleLEDColor(&this->obj, red, green, blue, &nackReasonCode);
}

Napi::Value RHSPlib::getModuleLEDColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  uint8_t red;
  uint8_t green;
  uint8_t blue;
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_getModuleLEDColor(&this->obj, &red, &green, &blue, &nackReasonCode);

  Napi::Object RGB = Napi::Object::New(env);
  RGB.Set("red", red);
  RGB.Set("green", green);
  RGB.Set("blue", blue);
  return RGB;
}

void RHSPlib::setModuleLEDPattern(const Napi::CallbackInfo &info) {
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
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_setModuleLEDPattern(&this->obj, &ledPattern, &nackReasonCode);
}

Napi::Value RHSPlib::getModuleLEDPattern(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_LEDPattern_T ledPattern;
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_getModuleLEDPattern(&this->obj, &ledPattern, &nackReasonCode);

  Napi::Object ledPatternObj = Napi::Object::New(env);
  ledPatternObj.Set("rgbtPatternStep0", ledPattern.rgbtPatternStep0);
  ledPatternObj.Set("rgbtPatternStep1", ledPattern.rgbtPatternStep1);
  ledPatternObj.Set("rgbtPatternStep2", ledPattern.rgbtPatternStep2);
  ledPatternObj.Set("rgbtPatternStep3", ledPattern.rgbtPatternStep3);
  ledPatternObj.Set("rgbtPatternStep4", ledPattern.rgbtPatternStep4);
  ledPatternObj.Set("rgbtPatternStep5", ledPattern.rgbtPatternStep5);
  ledPatternObj.Set("rgbtPatternStep6", ledPattern.rgbtPatternStep6);
  ledPatternObj.Set("rgbtPatternStep7", ledPattern.rgbtPatternStep7);
  ledPatternObj.Set("rgbtPatternStep8", ledPattern.rgbtPatternStep8);
  ledPatternObj.Set("rgbtPatternStep9", ledPattern.rgbtPatternStep9);
  ledPatternObj.Set("rgbtPatternStep10", ledPattern.rgbtPatternStep10);
  ledPatternObj.Set("rgbtPatternStep11", ledPattern.rgbtPatternStep11);
  ledPatternObj.Set("rgbtPatternStep12", ledPattern.rgbtPatternStep12);
  ledPatternObj.Set("rgbtPatternStep13", ledPattern.rgbtPatternStep13);
  ledPatternObj.Set("rgbtPatternStep14", ledPattern.rgbtPatternStep14);
  ledPatternObj.Set("rgbtPatternStep15", ledPattern.rgbtPatternStep15);
  return ledPatternObj;
}

void RHSPlib::setDebugLogLevel(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_DebugGroupNumber_T debugGroupNumber =
      static_cast<RHSPlib_DebugGroupNumber_T>(
          info[0].As<Napi::Number>().Uint32Value());
  RHSPlib_VerbosityLevel_T verbosityLevel =
      static_cast<RHSPlib_VerbosityLevel_T>(
          info[1].As<Napi::Number>().Uint32Value());
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_setDebugLogLevel(&this->obj, debugGroupNumber, verbosityLevel,
                           &nackReasonCode);
}

Napi::Value RHSPlib::discovery(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Serial *serialPort =
      Napi::ObjectWrap<Serial>::Unwrap(info[0].As<Napi::Object>());
  RHSPlib_DiscoveredAddresses_T discoveredAddresses;

  // TODO(jan): add error handling
  RHSPlib_discovery(&serialPort->getSerialObj(), &discoveredAddresses);

  Napi::Object discoveredAddressesObj = Napi::Object::New(env);
  discoveredAddressesObj.Set("parentAddress",
                             discoveredAddresses.parentAddress);
  discoveredAddressesObj.Set("numberOfChildModules",
                             discoveredAddresses.numberOfChildModules);

  Napi::Array childAddresses = Napi::Array::New(env);
  for (int i = 0; i < discoveredAddresses.numberOfChildModules; i++) {
    childAddresses[i] = discoveredAddresses.childAddresses[i];
  }
  discoveredAddressesObj.Set("childAddresses", childAddresses);

  return discoveredAddressesObj;
}

Napi::Value RHSPlib::getInterfacePacketID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  char *interfaceName = &(info[0].As<Napi::String>().Utf8Value())[0];
  uint16_t functionNumber = info[1].As<Napi::Number>().Uint32Value();
  uint16_t packetID;
  uint8_t nackReasonCode;

  // TODO(jan): add error handling
  RHSPlib_getInterfacePacketID(&this->obj, interfaceName, functionNumber,
                               &packetID, &nackReasonCode);

  return Napi::Number::New(env, packetID);
}
