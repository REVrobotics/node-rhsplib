#ifndef RHSPLIB_WRAPPER_H_
#define RHSPLIB_WRAPPER_H_

#include <napi.h>
#include <rev/RHSPlib.h>

class RHSPlib : public Napi::ObjectWrap<RHSPlib> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  RHSPlib(const Napi::CallbackInfo &info);

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
  static Napi::Value discovery(const Napi::CallbackInfo &info);
  Napi::Value getInterfacePacketID(const Napi::CallbackInfo &info);

 private:
  RHSPlib_Module_T obj;
};

#endif