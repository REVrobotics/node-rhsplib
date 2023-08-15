#ifndef RHSPLIBWORKER_H_
#define RHSPLIBWORKER_H_

#include <napi.h>
#include "rhsp/rhsp.h"

#include <map>
#include <mutex>
#include <thread>

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
    auto NAME = new RHSPlibWorker<RETURN>(ENV, [=         \
    ](int &_code, RETURN &_data, uint8_t &_nackCode) mutable FUNCTION_BODY)

/**
 * @brief Create a worker whose work function does not return a value (void).
 *
 * @param NAME Name of the worker to create
 * @param ENV Napi::Env
 * @param FUNCTION_BODY Lambda function body enclosed in curly braces. `_code`
 * should be set to the work function's return code (int)
 */
#define CREATE_VOID_WORKER(NAME, ENV, FUNCTION_BODY) \
    auto NAME = new RHSPlibWorker<void>(               \
        ENV, [=](int &_code, uint8_t &_nackCode) mutable FUNCTION_BODY)

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
        workFunction(resultCode, returnData, nackCode);
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
            Napi::Object errorObj = Napi::Object::New(Env());
            errorObj.Set("errorCode", resultCode);
            if (resultCode == RHSP_ERROR_NACK_RECEIVED) {
                errorObj.Set("nackCode", nackCode);
            }
            deferred.Reject(errorObj);
        }
    }

    /**
     * @brief Reject the promise with the error.
     *
     * @param e Error
     */
    void OnError(const Napi::Error &e) override { deferred.Reject(e.Value()); }

private:
    Napi::Promise::Deferred deferred;
    std::function<void(int &, TReturn &, uint8_t &)> workFunction;
    std::function<Napi::Value(Napi::Env, int &, TReturn &)> callbackFunction;
    TReturn returnData;
    int resultCode;
    uint8_t nackCode;
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
        workFunction(resultCode, nackCode);
    }

    /**
     * @brief If the result code is non-negative (no error), resolve the promise
     * with no value. Otherwise, reject the promise with the associated error.
     */
    void OnOK() override {
        if (resultCode >= 0) {
            deferred.Resolve(Env().Undefined());
        } else {
            Napi::Object errorObj = Napi::Object::New(Env());
            errorObj.Set("errorCode", resultCode);
            if (resultCode == RHSP_ERROR_NACK_RECEIVED) {
                errorObj.Set("nackCode", nackCode);
            }
            deferred.Reject(errorObj);
        }
    }

    /**
     * @brief Reject the promise with the error.
     *
     * @param e Error
     */
    void OnError(const Napi::Error &e) override { deferred.Reject(e.Value()); }

private:
    Napi::Promise::Deferred deferred;
    std::function<void(int &, uint8_t &)> workFunction;
    int resultCode;
    uint8_t nackCode;
};

#endif
