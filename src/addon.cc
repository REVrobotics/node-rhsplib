#include <napi.h>

#include "rhsplibWrapper.h"
#include "serialWrapper.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  RHSPlib::Init(env, exports);
  Serial::Init(env, exports);
  return exports;
}

NODE_API_MODULE(addon, Init);
