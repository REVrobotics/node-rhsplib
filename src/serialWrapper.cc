#include "serialWrapper.h"

#include "RHSPlibWorker.h"

// See https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md
Napi::Object Serial::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func =
      DefineClass(env, "Serial",
                  {
                      Serial::InstanceMethod("open", &Serial::open),
                      Serial::InstanceMethod("close", &Serial::close),
                      Serial::InstanceMethod("read", &Serial::read),
                      Serial::InstanceMethod("write", &Serial::write),
                  });

  Napi::FunctionReference *constructor = new Napi::FunctionReference();

  *constructor = Napi::Persistent(func);
  exports.Set("Serial", func);

  env.SetInstanceData<Napi::FunctionReference>(constructor);

  return exports;
}

Serial::Serial(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Serial>(info) {
  Napi::Env env = info.Env();

  RHSPlib_serial_init(&this->serialPort);

  // TODO(jan): Non-default constructor that calls Serial::open()
}

Napi::Value Serial::open(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::string serialPortNameStr = info[0].As<Napi::String>().Utf8Value();
  uint32_t baudrate = info[1].As<Napi::Number>().Uint32Value();
  uint32_t databits = info[2].As<Napi::Number>().Uint32Value();
  RHSPlib_Serial_Parity_T parity = static_cast<RHSPlib_Serial_Parity_T>(
      info[3].As<Napi::Number>().Uint32Value());
  uint32_t stopbits = info[4].As<Napi::Number>().Uint32Value();
  RHSPlib_Serial_FlowControl_T flowControl =
      static_cast<RHSPlib_Serial_FlowControl_T>(
          info[5].As<Napi::Number>().Uint32Value());

  CREATE_VOID_WORKER(worker, env, {
    const char *serialPortName = serialPortNameStr.c_str();
    _code = RHSPlib_serial_open(&this->serialPort, serialPortName, baudrate,
                                databits, parity, stopbits, flowControl);
  });

  QUEUE_WORKER(worker);
}

void Serial::close(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RHSPlib_serial_close(&this->serialPort);
}

Napi::Value Serial::read(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  size_t bytesToRead = info[0].As<Napi::Number>().Uint32Value();

  using retType = uint8_t *;

  CREATE_WORKER(worker, env, retType, {
    _data = new uint8_t[bytesToRead];

    _code = RHSPlib_serial_read(&this->serialPort, _data, bytesToRead);
  });

  SET_WORKER_CALLBACK(worker, retType, {
    Napi::Array data = Napi::Array::New(_env, bytesToRead);
    for (int i = 0; i < bytesToRead; i++) {
      data[i] = _data[i];
    }
    delete[] _data;
    return data;
  });

  QUEUE_WORKER(worker);
}

Napi::Value Serial::write(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  Napi::Array data = info[0].As<Napi::Array>();
  size_t bytesToWrite = data.Length();

  uint8_t *buffer = new uint8_t[bytesToWrite];
  for (int i = 0; i < bytesToWrite; i++) {
    buffer[i] = data.Get(i).As<Napi::Number>().Uint32Value();
  }

  CREATE_VOID_WORKER(worker, env, {
    _code = RHSPlib_serial_write(&this->serialPort, buffer, bytesToWrite);
    delete[] buffer;
  });

  QUEUE_WORKER(worker);
}
