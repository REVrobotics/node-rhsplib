
#include "gtest/gtest.h"
#include "Environment.h"
#include "rhsp/motor.h"
#include "rhsp/rhsp.h"
#include "utils.h"
#include "rhsp/time.h"

RHSP_TEST(Motor, Enable, {
    WITH_HUB
    int channel = 3;
    RHSP_CHECK(rhsp_setMotorChannelMode, channel, MOTOR_MODE_OPEN_LOOP, 0)

    RHSP_CHECK(rhsp_setMotorConstantPower, channel, 0.2)

    RHSP_CHECK(rhsp_setMotorChannelEnable, channel, 1);

    uint8_t isEnabled = 0;
    RHSP_CHECK(rhsp_getMotorChannelEnable, channel, &isEnabled)

    EXPECT_EQ(isEnabled, 1);
})

RHSP_TEST(Motor, EnableInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;

    int channel = 10;
    int result = rhsp_setMotorChannelMode(hub, channel, MOTOR_MODE_OPEN_LOOP, 0, &nackCode);
    EXPECT_EQ(result, -51);

    result = rhsp_setMotorConstantPower(hub, channel, 0.2, &nackCode);
    EXPECT_EQ(result, -51);

    result = rhsp_setMotorChannelEnable(hub, channel, 1, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetEnableInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    uint8_t enabled;
    int result = rhsp_getMotorChannelEnable(hub, channel, &enabled, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, SetMotorChannelMode, {
    WITH_HUB
    uint8_t channels[] = {0, 1, 2, 3};
    MotorMode modes[] = { MOTOR_MODE_OPEN_LOOP, MOTOR_MODE_REGULATED_VELOCITY,  MOTOR_MODE_REGULATED_POSITION };
    uint8_t floatAtZero[] = {0, 1};

    for (auto channel: channels)
    {
        for (auto mode: modes)
        {
            for (auto f: floatAtZero)
            {
                RHSP_CHECK(rhsp_setMotorChannelMode, channel, mode, f)

                uint8_t fValue = 0;
                uint8_t modeValue = 0;
                RHSP_CHECK(rhsp_getMotorChannelMode, channel, &modeValue, &fValue)

                EXPECT_EQ(f, fValue);
                EXPECT_EQ(mode, modeValue);
            }
        }
    }
})

RHSP_TEST(Motor, SetInvalidChannelMotorMode, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;

    int result = rhsp_setMotorChannelMode(hub, channel, MOTOR_MODE_OPEN_LOOP, 0, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetInvalidChannelMotorMode, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;

    uint8_t mode = 0;
    uint8_t f = 0;
    int result = rhsp_getMotorChannelMode(hub, channel, &mode, &f, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, SetInvalidMotorMode, {
    WITH_HUB
    uint8_t nackCode;
    auto invalidMode = static_cast<MotorMode>(10);
    int channels[] = {0, 1, 2, 3};

    for (auto channel: channels)
    {
        uint8_t currentMode = 0;
        uint8_t currentF = 0;
        RHSP_CHECK(rhsp_getMotorChannelMode, channel, &currentMode, &currentF)

        int result = rhsp_setMotorChannelMode(hub, channel, invalidMode, 0, &nackCode);
        EXPECT_EQ(result, -4);
        EXPECT_EQ(nackCode, 1);

        uint8_t newMode = 0;
        uint8_t newF = 0;
        RHSP_CHECK(rhsp_getMotorChannelMode, channel, &newMode, &newF)

        EXPECT_EQ(currentMode, newMode);
        EXPECT_EQ(currentF, newF);
    }
})

RHSP_TEST(Motor, SetInvalidFloatAtZero, {
    WITH_HUB
    uint8_t nackCode;
    int invalidF = 10;
    int channels[] = {0, 1, 2, 3};
    MotorMode modes[] = { MOTOR_MODE_OPEN_LOOP, MOTOR_MODE_REGULATED_VELOCITY, MOTOR_MODE_REGULATED_POSITION };

    for (auto channel: channels)
    {
        for (auto mode: modes)
        {
            uint8_t currentMode = 0;
            uint8_t currentF = 0;
            RHSP_CHECK(rhsp_getMotorChannelMode, channel, &currentMode, &currentF)

            int result = rhsp_setMotorChannelMode(hub, channel, mode, invalidF, &nackCode);
            EXPECT_EQ(result, -53);

            uint8_t newMode = 0;
            uint8_t newF = 0;
            RHSP_CHECK(rhsp_getMotorChannelMode, channel, &newMode, &newF)

            EXPECT_EQ(currentMode, newMode);
            EXPECT_EQ(currentF, newF);
        }
    }
})

RHSP_TEST(Motor, SetCurrentAlertLevel, {
    WITH_HUB
    uint8_t channels[] = {0, 1, 2, 3};
    uint16_t limits[] = {0, 1, 100, 1000, 10000, 65000, 65535, 65535};

    for (auto channel: channels)
    {
        for (auto limit: limits)
        {
            RHSP_CHECK(rhsp_setMotorChannelCurrentAlertLevel, channel, limit)

            uint16_t actualLimit;
            RHSP_CHECK(rhsp_getMotorChannelCurrentAlertLevel, channel, &actualLimit)

            EXPECT_EQ(actualLimit, limit);
        }
    }
})

RHSP_TEST(Motor, SetInvalidChannelCurrentLimit, {
    WITH_HUB
    uint8_t nackCode;

    int channel = 10;
    uint16_t limits[] = {0, 1, 100, 1000, 10000, 65000, 65535, 65535};

    for (auto limit: limits)
    {
        int result = rhsp_setMotorChannelCurrentAlertLevel(hub, channel, limit, &nackCode);
        EXPECT_EQ(result, -51);
    }
})

RHSP_TEST(Motor, GetInvalidChannelCurrentLimit, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;

    uint16_t limit;
    int result = rhsp_getMotorChannelCurrentAlertLevel(hub, channel, &limit, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, RunMotorConstantPower, {
    WITH_HUB
    uint8_t nackCode;
    WITH_MOTOR_CHANNEL
    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_OPEN_LOOP, 0)

    double values[] = {-1.0, -0.5, 0.0, 0.5, 1.0};
    for (double value: values)
    {
        RHSP_CHECK(rhsp_setMotorConstantPower, motorChannel, value)

        double power = 0.0;
        RHSP_CHECK(rhsp_getMotorConstantPower, motorChannel, &power)

        double diff = abs(power - value);
        EXPECT_LT(diff, 0.001);
    }

    rhsp_setMotorConstantPower(hub, motorChannel, 0.0, &nackCode);
})

RHSP_TEST(Motor, SetInvalidChannelConstantPower, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    int result = rhsp_setMotorConstantPower(hub, channel, 0.5, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetInvalidChannelConstantPower, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    double actualPower;
    int result = rhsp_getMotorConstantPower(hub, channel, &actualPower, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, RunMotorTargetVelocity, {
    WITH_HUB
    uint8_t nackCode;
    WITH_MOTOR_CHANNEL
    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_REGULATED_VELOCITY, 0);

    int16_t values[] = {-32768, -32767, 0, 32766, 32767};
    for (int16_t value: values)
    {
        RHSP_CHECK(rhsp_setMotorTargetVelocity, motorChannel, value);

        int16_t power = 0;
        RHSP_CHECK(rhsp_getMotorTargetVelocity, motorChannel, &power);

        EXPECT_EQ(power, value);
    }
    rhsp_setMotorTargetVelocity(hub, motorChannel, 0, &nackCode);
})

RHSP_TEST(Motor, SetInvalidChannelTargetVelocity, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    int result = rhsp_setMotorTargetVelocity(hub, channel, 1234, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetInvalidChannelTargetVelocity, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;
    int16_t actualPower;
    int result = rhsp_getMotorTargetVelocity(hub, channel, &actualPower, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, RunMotorTargetPosition, {
    WITH_HUB
    WITH_MOTOR_CHANNEL
    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_REGULATED_VELOCITY, 0);

    int32_t values[] = {-2147483648, -2147483647, 0, 2147483646, 2147483647};
    uint16_t tolerance = 100;
    for (int16_t value: values)
    {
        RHSP_CHECK(rhsp_setMotorTargetPosition, motorChannel, value, tolerance);

        int32_t actualPosition = 0;
        uint16_t actualTolerance = 0;
        RHSP_CHECK(rhsp_getMotorTargetPosition, motorChannel, &actualPosition, &actualTolerance);

        EXPECT_EQ(actualPosition, value);
    }
    RHSP_CHECK(rhsp_setMotorChannelEnable, motorChannel, 0)
})

RHSP_TEST(Motor, SetInvalidChannelTargetPosition, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    int result = rhsp_setMotorTargetPosition(hub, channel, 1234, 100, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetInvalidChannelTargetPosition, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    int32_t position;
    uint16_t tolerance;
    int result = rhsp_getMotorTargetPosition(hub, channel, &position, &tolerance, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, IsMotorAtTarget, {
    WITH_HUB
    WITH_MOTOR_CHANNEL

    int32_t startPosition;
    RHSP_CHECK(rhsp_getEncoderPosition, motorChannel, &startPosition)

    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_REGULATED_POSITION, 0)
    RHSP_CHECK(rhsp_setMotorTargetVelocity, motorChannel, 100)
    RHSP_CHECK(rhsp_setMotorTargetPosition, motorChannel, startPosition + 300, 100)
    RHSP_CHECK(rhsp_setMotorChannelEnable, motorChannel, 1)

    int didReachTarget = 0;
    uint32_t startTime = rhsp_getSteadyClockMs();
    while (rhsp_getSteadyClockMs() - startTime < 6000)
    {
        uint8_t isAtTarget;
        RHSP_CHECK(rhsp_isMotorAtTarget, motorChannel, &isAtTarget)

        if (isAtTarget)
        {
            didReachTarget = 1;
            break;
        }
    }

    EXPECT_TRUE(didReachTarget);
})

RHSP_TEST(Motor, NotAtTarget, {
    WITH_HUB
    uint8_t nackCode;
    WITH_MOTOR_CHANNEL

    int32_t startPosition;
    RHSP_CHECK(rhsp_getEncoderPosition, motorChannel, &startPosition)

    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_REGULATED_POSITION, 0)
    RHSP_CHECK(rhsp_setMotorTargetVelocity, motorChannel, 100)
    RHSP_CHECK(rhsp_setMotorTargetPosition, motorChannel, startPosition + 1000000, 75)
    RHSP_CHECK(rhsp_setMotorChannelEnable, motorChannel, 1)

    int didReachTarget = 0;
    uint32_t startTime = rhsp_getSteadyClockMs();
    while (rhsp_getSteadyClockMs() - startTime < 100)
    {
        uint8_t isAtTarget;
        RHSP_CHECK(rhsp_isMotorAtTarget, motorChannel, &isAtTarget)

        if (isAtTarget)
        {
            didReachTarget = 1;
            break;
        }
    }
    rhsp_setMotorChannelEnable(hub, motorChannel, 0, &nackCode);

    EXPECT_FALSE(didReachTarget);
})

RHSP_TEST(Motor, GetEncoderPosition, {
    WITH_HUB
    WITH_MOTOR_CHANNEL

    int32_t startPosition;
    RHSP_CHECK(rhsp_getEncoderPosition, motorChannel, &startPosition)

    RHSP_CHECK(rhsp_setMotorChannelMode, motorChannel, MOTOR_MODE_REGULATED_POSITION, 0)
    RHSP_CHECK(rhsp_setMotorTargetVelocity, motorChannel, 100)
    RHSP_CHECK(rhsp_setMotorTargetPosition, motorChannel, startPosition + 1000000, 75)
    RHSP_CHECK(rhsp_setMotorChannelEnable, motorChannel, 1)

    delay(500);

    RHSP_CHECK(rhsp_setMotorChannelEnable, motorChannel, 0)

    int32_t newPosition;
    RHSP_CHECK(rhsp_getEncoderPosition, motorChannel, &newPosition)

    EXPECT_NE(startPosition, newPosition);
})

RHSP_TEST(Motor, GetEncoderInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;

    int32_t position;
    int result = rhsp_getEncoderPosition(hub, channel, &position, &nackCode);

    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, ResetEncoder, {
    WITH_HUB
    WITH_MOTOR_CHANNEL

    delay(100); //make sure the motor doesn't have momentum
    RHSP_CHECK(rhsp_resetEncoder, motorChannel)

    int32_t newPosition;
    RHSP_CHECK(rhsp_getEncoderPosition, motorChannel, &newPosition)

    EXPECT_EQ(newPosition, 0);
})

RHSP_TEST(Motor, ResetEncoderInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;

    int result = rhsp_resetEncoder(hub, channel, &nackCode);

    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, PidCoefficients, {
    WITH_HUB
    WITH_MOTOR_CHANNEL

    double pValues[] = {-10.0, -5.0, 0.0, 5.0, 10.0};
    double iValues[] = {-10.0, -5.0, 0.0, 5.0, 10.0};
    double dValues[] = {-10.0, -5.0, 0.0, 5.0, 10.0};
    MotorMode modes[] = { MOTOR_MODE_REGULATED_VELOCITY, MOTOR_MODE_REGULATED_POSITION };

    for (auto mode: modes)
    {
        for (auto p: pValues)
        {
            for (auto i: iValues)
            {
                for (auto d: dValues)
                {
                    ClosedLoopControlParameters params;
                    params.type = LEGACY_PID_TAG;
                    params.pid.p = p;
                    params.pid.i = i;
                    params.pid.d = d;

                    RHSP_CHECK(rhsp_setClosedLoopControlCoefficients, motorChannel, mode, &params)

                    ClosedLoopControlParameters actualParams;
                    RHSP_CHECK(rhsp_getClosedLoopControlCoefficients, motorChannel, mode, &actualParams)

                    EXPECT_EQ(actualParams.type, LEGACY_PID_TAG);
                    EXPECT_FLOAT_EQ(actualParams.pid.p, params.pid.p);
                    EXPECT_FLOAT_EQ(actualParams.pid.i, params.pid.i);
                    EXPECT_FLOAT_EQ(actualParams.pid.d, params.pid.d);
                }
            }
        }
    }
})

RHSP_TEST(Motor, PidCoefficientsInvalidMode, {
    WITH_HUB
    uint8_t nackCode;
    auto invalidMode = static_cast<MotorMode>(10);
    ClosedLoopControlParameters params;
    int result = rhsp_setClosedLoopControlCoefficients(hub, 0, invalidMode, &params, &nackCode);

    EXPECT_EQ(result, -52);
})

RHSP_TEST(Motor, PidCoefficientsInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    ClosedLoopControlParameters params;
    int result = rhsp_setClosedLoopControlCoefficients(hub, channel, MOTOR_MODE_REGULATED_VELOCITY, &params, &nackCode);

    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetPidCoefficientsInvalidMode, {
    WITH_HUB
    uint8_t nackCode;
    auto invalidMode = static_cast<MotorMode>(10);
    ClosedLoopControlParameters params;
    int result = rhsp_getClosedLoopControlCoefficients(hub, 0, invalidMode, &params, &nackCode);

    EXPECT_EQ(result, -52);
})

RHSP_TEST(Motor, GetPidCoefficientsInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    ClosedLoopControlParameters params;
    int result = rhsp_getClosedLoopControlCoefficients(hub, channel, MOTOR_MODE_REGULATED_VELOCITY, &params, &nackCode);

    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, PidfCoefficients, {
    WITH_HUB
    WITH_MOTOR_CHANNEL

    SKIP_IF_FIRMWARE_BELOW(1, 8, 2)

    double pValues[] = {-10.0, 0.0, 10.0};
    double iValues[] = {-10.0, 0.0, 10.0};
    double dValues[] = {-10.0, 0.0, 10.0};
    double fValues[] = {-10.0, -5.0, 0.0, 5.0, 10.0};
    MotorMode modes[] = { MOTOR_MODE_REGULATED_VELOCITY, MOTOR_MODE_REGULATED_POSITION };

    for (auto mode: modes)
    {
        for (auto p: pValues)
        {
            for (auto i: iValues)
            {
                for (auto d: dValues)
                {
                    for (auto f: fValues)
                    {
                        ClosedLoopControlParameters params;
                        params.type = PIDF_TAG;
                        params.pidf.p = p;
                        params.pidf.i = i;
                        params.pidf.d = d;
                        params.pidf.f = f;

                        RHSP_CHECK(rhsp_setClosedLoopControlCoefficients, motorChannel, mode, &params)

                        ClosedLoopControlParameters actualParams;
                        actualParams.type = PIDF_TAG;
                        RHSP_CHECK(rhsp_getClosedLoopControlCoefficients, motorChannel, mode, &actualParams)

                        EXPECT_EQ(actualParams.type, PIDF_TAG);
                        EXPECT_FLOAT_EQ(actualParams.pidf.p, params.pidf.p);
                        EXPECT_FLOAT_EQ(actualParams.pidf.i, params.pidf.i);
                        EXPECT_FLOAT_EQ(actualParams.pidf.d, params.pidf.d);
                        EXPECT_FLOAT_EQ(actualParams.pidf.f, params.pidf.f);
                    }
                }
            }
        }
    }
})

RHSP_TEST(Motor, PidfCoefficientsInvalidMode, {
    WITH_HUB
    uint8_t nackCode;
    auto invalidMode = static_cast<MotorMode>(10);
    ClosedLoopControlParameters params;
    params.type = PIDF_TAG;
    int result = rhsp_setClosedLoopControlCoefficients(hub, 0, invalidMode, &params, &nackCode);

    EXPECT_EQ(result, -52);
})

RHSP_TEST(Motor, PidfCoefficientsInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    ClosedLoopControlParameters params;
    params.type = PIDF_TAG;
    int result = rhsp_setClosedLoopControlCoefficients(hub, channel, MOTOR_MODE_REGULATED_VELOCITY, &params, &nackCode);

    EXPECT_EQ(result, -51);
})

RHSP_TEST(Motor, GetPidfCoefficientsInvalidMode, {
    WITH_HUB
    uint8_t nackCode;
    auto invalidMode = static_cast<MotorMode>(10);
    ClosedLoopControlParameters params;
    params.type = PIDF_TAG;
    int result = rhsp_getClosedLoopControlCoefficients(hub, 0, invalidMode, &params, &nackCode);

    EXPECT_EQ(result, -52);
})

RHSP_TEST(Motor, GetPidfCoefficientsInvalidChannel, {
    WITH_HUB
    uint8_t nackCode;
    int channel = 10;
    ClosedLoopControlParameters params;
    params.type = PIDF_TAG;
    int result = rhsp_getClosedLoopControlCoefficients(hub, channel, MOTOR_MODE_REGULATED_VELOCITY, &params, &nackCode);

    EXPECT_EQ(result, -51);
})
