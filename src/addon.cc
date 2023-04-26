#include <napi.h>

#include "RevHubWrapper.h"
#include "serialWrapper.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  RevHub::Init(env, exports);
  Serial::Init(env, exports);
  return exports;
}

NODE_API_MODULE(addon, Init);
