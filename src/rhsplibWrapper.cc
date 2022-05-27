#include "rhsplibWrapper.h"

#include "serialWrapper.h"

// See https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md
Napi::Object RHSPlib::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func =
      DefineClass(env, "RHSPlib",
                  {
                      RHSPlib::InstanceMethod("open", &RHSPlib::open),
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
