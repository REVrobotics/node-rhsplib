#ifndef RHSPLIB_WRAPPER_H_
#define RHSPLIB_WRAPPER_H_

#include <napi.h>
#include <rev/RHSPlib.h>

class RHSPlib : public Napi::ObjectWrap<RHSPlib> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  RHSPlib(const Napi::CallbackInfo &info);

  void open(const Napi::CallbackInfo &info);
  Napi::Value isOpened(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);

 private:
  RHSPlib_Module_T obj;
};

#endif