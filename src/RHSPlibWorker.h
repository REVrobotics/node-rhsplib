#ifndef RHSPLIBWORKER_H_
#define RHSPLIBWORKER_H_

#include <napi.h>
#include <rev/RHSPlib_errors.h>

#include <map>
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

const std::map<int, const char *> rhsplibErrors = {
    {RHSPLIB_SERIAL_ERROR, "SerialGenericError"},
    {RHSPLIB_SERIAL_ERROR_OPENING, "SerialOpenError"},
    {RHSPLIB_SERIAL_ERROR_ARGS, "SerialArgsError"},
    {RHSPLIB_SERIAL_ERROR_CONFIGURE, "SerialConfigureError"},
    {RHSPLIB_SERIAL_ERROR_IO, "SerialIOError"},
    {RHSPLIB_ERROR, "RevHubGenericError"},
    {RHSPLIB_ERROR_RESPONSE_TIMEOUT, "RevHubResponseTimeoutError"},
    {RHSPLIB_ERROR_MSG_NUMBER_MISMATCH, "RevHubMessageNumberMismatchError"},
    {RHSPLIB_ERROR_NACK_RECEIVED, "RevHubNackReceivedError"},
    {RHSPLIB_ERROR_SERIALPORT, "RevHubSerialPortError"},
    {RHSPLIB_ERROR_COMMAND_NOT_SUPPORTED, "RevHubCommandNotSupportedError"},
    {RHSPLIB_ERROR_UNEXPECTED_RESPONSE, "RevHubUnexpectedResponseError"},
    {RHSPLIB_ERROR_ARG_0_OUT_OF_RANGE, "RevHubArg0OutofRangeError"},
    {RHSPLIB_ERROR_ARG_1_OUT_OF_RANGE, "RevHubArg1OutofRangeError"},
    {RHSPLIB_ERROR_ARG_2_OUT_OF_RANGE, "RevHubArg2OutofRangeError"},
    {RHSPLIB_ERROR_ARG_3_OUT_OF_RANGE, "RevHubArg3OutofRangeError"},
    {RHSPLIB_ERROR_ARG_4_OUT_OF_RANGE, "RevHubArg4OutofRangeError"},
    {RHSPLIB_ERROR_ARG_5_OUT_OF_RANGE, "RevHubArg5OutofRangeError"}};

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
   * @brief If the result code is non-negative (no error), run the call back
   * function and resolve the promise on the return value. Otherwise, reject the
   * promise with the associated error.
   */
  void OnOK() override {
    if (resultCode >= 0 && callbackFunction) {
      deferred.Resolve(callbackFunction(Env(), resultCode, returnData));
    } else {
      auto iterator = rhsplibErrors.find(resultCode);
      Napi::Error error = Napi::Error::New(
          Env(),
          iterator != rhsplibErrors.end() ? iterator->second : "UnknownError");
      deferred.Reject(error.Value());
    }
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
   * @brief If the result code is non-negative (no error), resolve the promise
   * with no value. Otherwise, reject the promise with the associated error.
   */
  void OnOK() override {
    if (resultCode >= 0) {
      deferred.Resolve(Env().Undefined());
    } else {
      auto iterator = rhsplibErrors.find(resultCode);
      Napi::Error error = Napi::Error::New(
          Env(),
          iterator != rhsplibErrors.end() ? iterator->second : "UnknownError");
      deferred.Reject(error.Value());
    }
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
