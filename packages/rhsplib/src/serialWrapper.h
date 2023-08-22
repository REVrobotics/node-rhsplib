#ifndef SERIAL_WRAPPER_H_
#define SERIAL_WRAPPER_H_

#include "rhsp/serial.h"
#include <napi.h>

class Serial : public Napi::ObjectWrap<Serial> {
  public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);

    Serial(const Napi::CallbackInfo &info);

    Napi::Value open(const Napi::CallbackInfo &info);
    void close(const Napi::CallbackInfo &info);
    Napi::Value read(const Napi::CallbackInfo &info);
    Napi::Value write(const Napi::CallbackInfo &info);

    RhspSerial *getSerialObj() { return &serialPort; };

  private:
    RhspSerial serialPort;
};

#endif
