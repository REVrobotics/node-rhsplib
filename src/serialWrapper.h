#ifndef SERIAL_WRAPPER_H_
#define SERIAL_WRAPPER_H_

#include <RHSPlib_serial.h>
#include <napi.h>

class Serial : public Napi::ObjectWrap<Serial> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  Serial(const Napi::CallbackInfo &info);

  void open(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);
  Napi::Value read(const Napi::CallbackInfo &info);
  void write(const Napi::CallbackInfo &info);

  RHSPlib_Serial_T getSerialObj() { return serialPort; };

 private:
  RHSPlib_Serial_T serialPort;
};

#endif
