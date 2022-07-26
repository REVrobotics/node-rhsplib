#ifndef RHSPLIBWORKER_H_
#define RHSPLIBWORKER_H_

#include <napi.h>

#include <mutex>

/* Macros for writing lambda functions */

/**
 * @brief Create a worker whose work function returns a value.
 *
 * @param NAME Name of the worker to create
 * @param ENV Napi::Env
 * @param RETURN Return type of work function
 * @param FUNCTION_BODY Lambda function body enclosed in curly braces. `_code`
 * should be set to the work function's return code (int), and `_data` should be
 * set to the work function's return data
 */
#define CREATE_WORKER(NAME, ENV, RETURN, FUNCTION_BODY) \
  auto NAME = new RHSPlibWorker<RETURN>(                \
      ENV, [=](int &_code, RETURN &_data) mutable FUNCTION_BODY)

/**
 * @brief Create a worker whose work function does not return a value (void).
 *
 * @param NAME Name of the worker to create
 * @param ENV Napi::Env
 * @param FUNCTION_BODY Lambda function body enclosed in curly braces. `_code`
 * should be set to the work function's return code (int)
 */
#define CREATE_VOID_WORKER(NAME, ENV, FUNCTION_BODY) \
  auto NAME =                                        \
      new RHSPlibWorker<void>(ENV, [=](int &_code) mutable FUNCTION_BODY)

/**
 * @brief Set the callback function for a worker.
 *
 * @param NAME Name of worker to set the calback of
 * @param RETURN Return type of the work function
 * @param FUNCTION_BODY Lambda function body enclosed in curly braces. Use
 * `_data` to get the work functions' return data
 */
#define SET_WORKER_CALLBACK(NAME, RETURN, FUNCTION_BODY) \
  NAME->SetCallback([=](Napi::Env _env, int &_code,      \
                        RETURN &_data) mutable FUNCTION_BODY)

/**
 * @brief Queue the worker and return its promise.
 *
 * @param NAME Name of the worker to queue
 */
#define QUEUE_WORKER(NAME) \
  NAME->Queue();           \
  return NAME->GetPromise();

/**
 * @brief Base class for the RHSPlibWorker. The sole responsibility of this
 * class is to contain the static mutex that will be used by the templated
 * RHSPlibWorker class.
 */
class RHSPlibWorkerBase {
 protected:
  static std::mutex m_mutex;
};

/**
 * @brief Async worker class for handling blocking calls from RHSPlib.
 *
 * @tparam TReturn Return type of the work function
 */
template <typename TReturn>
class RHSPlibWorker : public Napi::AsyncWorker, public RHSPlibWorkerBase {
 public:
  /**
   * @brief Create a worker and set the work function to be run asynchronously
   * in Execute().
   *
   * @tparam Function Must be a lambda function that returns void and accepts
   * the following parameters: (Napi::Env env, int &returnCode, TReturn
   * &returnData);
   * @param env Napi::Env
   * @param f Work function
   */
  template <typename Function>
  RHSPlibWorker(Napi::Env env, Function &&f)
      : Napi::AsyncWorker(env),
        deferred(env),
        workFunction(std::forward<Function>(f)) {}

  ~RHSPlibWorker() {}

  /**
   * @brief Set the callback function that handles how data is sent to
   * javascript.
   *
   * @tparam Function Must be a lambda function that returns Napi::Value and
   * accepts the following parameters: (Napi::Env env, TReturn &returnData).
   * @param f Callback function
   */
  template <typename Function>
  void SetCallback(Function &&f) {
    callbackFunction = f;
  }

  /**
   * @brief Get the Promise object owned by the worker to return to javascript.
   *
   * @return Napi::Promise
   */
  Napi::Promise GetPromise() { return deferred.Promise(); }

  /**
   * @brief Run the work function. `resultCode` and `returnData` are passed by
   * reference to be set by the work function.
   */
  void Execute() override {
    std::scoped_lock<std::mutex> lock{m_mutex};
    workFunction(resultCode, returnData);
  }

  /**
   * @brief Run the callback function to prepare the data to be sent to
   * javascript then resolve the promise with an object that contains the
   * `resultCode` and javascript-ready value.
   */
  void OnOK() override {
    Napi::Object resultObj = Napi::Object::New(Env());
    resultObj.Set("resultCode", resultCode);
    if (resultCode >= 0 && callbackFunction) {
      resultObj.Set("value", callbackFunction(Env(), resultCode, returnData));
    }
    deferred.Resolve(resultObj);
  }

  /**
   * @brief Reject the promise with the error.
   *
   * @param e Error
   */
  void OnError(const Napi::Error &e) override { deferred.Reject(e.Value()); }

 private:
  std::function<void(int &, TReturn &)> workFunction;
  std::function<Napi::Value(Napi::Env, int &, TReturn &)> callbackFunction;
  Napi::Promise::Deferred deferred;
  TReturn returnData;
  int resultCode;
};

/**
 * @brief Specialized class of RHSPlib for work functions that do not return a
 * value (void).
 *
 * @tparam
 */
template <>
class RHSPlibWorker<void> : public Napi::AsyncWorker, public RHSPlibWorkerBase {
 public:
  /**
   * @brief Create a worker and set the work function to be run asynchronously
   * in Execute().
   *
   * @tparam Function Must be a lambda function that returns void and accepts
   * the following parameters: (Napi::Env env, int &returnCode);
   * @param env Napi::Env
   * @param f Work function
   */
  template <typename Function>
  RHSPlibWorker(Napi::Env env, Function &&f)
      : Napi::AsyncWorker(env),
        deferred(env),
        workFunction(std::forward<Function>(f)) {}

  ~RHSPlibWorker() {}

  /**
   * @brief Get the Promise object owned by the worker to return to javascript.
   *
   * @return Napi::Promise
   */

  Napi::Promise GetPromise() { return deferred.Promise(); }
  /**
   * @brief Run the work function. `resultCode` is passed by reference to be set
   * by the work function.
   */
  void Execute() override {
    std::scoped_lock<std::mutex> lock{m_mutex};
    workFunction(resultCode);
  }

  /**
   * @brief Resolve the promise with an object that contains the `resultCode`
   */
  void OnOK() override {
    Napi::Object resultObj = Napi::Object::New(Env());
    resultObj.Set("resultCode", resultCode);
    deferred.Resolve(resultObj);
  }

  /**
   * @brief Reject the promise with the error.
   *
   * @param e Error
   */
  void OnError(const Napi::Error &e) override { deferred.Reject(e.Value()); }

 private:
  std::function<void(int &)> workFunction;
  Napi::Promise::Deferred deferred;
  int resultCode;
};

#endif
