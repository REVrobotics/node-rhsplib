//
// Created by landry on 7/25/23.
//

#ifndef RHSP_UTILS_H
#define RHSP_UTILS_H

#include "gtest/gtest.h"
#include "Environment.h"
#include "RhspConfig.h"
#include "rhsp/deviceControl.h"

#define RHSP_TEST(test_suite_name, test_name, ...)  \
    TEST(test_suite_name, test_name) {              \
        RhspEnvironment::prepareTest();             \
        {                                           \
            __VA_ARGS__                             \
        }                                           \
        RhspEnvironment::endTest();                 \
    }

#define WITH_HUB RhspRevHub* hub = RhspEnvironment::hub;
#define WITH_SERIAL RhspSerial* serial = RhspEnvironment::serial;
#define WITH_MOTOR_CHANNEL int motorChannel = RhspConfig::motorChannel;
#define WITH_SERVO_CHANNEL int servoChannel = RhspConfig::servoChannel;
#define WITH_INPUT_PIN uint8_t inPin = RhspConfig::inPin;
#define WITH_OUTPUT_PIN uint8_t outPin = RhspConfig::outPin;

/**
 * method: name of rhsp method, such as rhsp_sendKeepAlive
 * args: list of arguments, excluding the hub and nackCode.
 */
#define RHSP_CHECK(method, ...)                                     \
    {                                                               \
        SCOPED_TRACE(#method);                                      \
        uint8_t localNackCode;                                      \
        int localResult = method(hub, __VA_ARGS__, &localNackCode); \
        processResult(localResult, localNackCode);                  \
    }
extern std::string nackMeanings[];

inline void processResult(int result, uint8_t nackCode)
{
    if (result == 1)
    {
        printf("Command returned 1\n");
    }
    if (result == -4)
    {
        printf("Got NACK: %s\n", nackMeanings[nackCode].c_str());
    }
    EXPECT_GE(result, 0);
}

inline int compareFwVersions(int major1, int minor1, int dev1, int major2, int minor2, int dev2)
{
    if (major1 > major2) return 1; //greater than
    if (major1 < major2) return -1; //less than
    if (minor1 > minor2) return 1; //greater than
    if (minor1 < minor2) return -1; //less than
    if (dev1 > dev2) return 1; //greater than
    if (dev1 < dev2) return -1; //less than
    return 0;
}

#define SKIP_IF_FIRMWARE_BELOW(major, minor, dev)   \
    {                                               \
        RhspVersion version;                        \
        rhsp_readVersion(hub, &version, nullptr);    \
        if(compareFwVersions(version.majorVersion, version.minorVersion, version.engineeringRevision, major, minor, dev) < 0) { \
            GTEST_SKIP_("firmware version is too low for this test.");                                            \
        }                                           \
    }                                               \

void delay(int timeMillis);

#endif //RHSP_UTILS_H
