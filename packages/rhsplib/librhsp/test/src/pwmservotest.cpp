
#include "utils.h"
#include "rhsp/servo.h"

RHSP_TEST(Servo, SetServoConfiguration, {
    WITH_HUB
    WITH_SERVO_CHANNEL

    uint16_t values[] = {30000, 65534, 65535};
    for (auto value: values)
    {
        RHSP_CHECK(rhsp_setServoConfiguration, servoChannel, value)

        uint16_t framePeriod;
        RHSP_CHECK(rhsp_getServoConfiguration, servoChannel, &framePeriod)
        EXPECT_EQ(value, framePeriod);
    }
})

RHSP_TEST(Servo, SetInvalidConfiguration, {
    WITH_HUB
    WITH_SERVO_CHANNEL
    uint8_t nackCode;

    uint16_t values[] = {0, 1};
    for (auto value: values)
    {
        int result = rhsp_setServoConfiguration(hub, servoChannel, value, &nackCode);
        EXPECT_EQ(result, -52);
    }
})

RHSP_TEST(Servo, SetInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    uint16_t values[] = {50000};
    for (auto value: values)
    {
        int result = rhsp_setServoConfiguration(hub, channel, value, &nackCode);
        EXPECT_EQ(result, -51);
    }
})

RHSP_TEST(Servo, GetInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    uint16_t value;
    int result = rhsp_getServoConfiguration(hub, channel, &value, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Servo, SetPulseWidth, {
    WITH_HUB
    WITH_SERVO_CHANNEL

    uint16_t values[] = {1, 30000, 65534, 65535};
    for (auto value: values)
    {
        RHSP_CHECK(rhsp_setServoPulseWidth, servoChannel, value)

        uint16_t pulseWidth;
        RHSP_CHECK(rhsp_getServoPulseWidth, servoChannel, &pulseWidth)
        EXPECT_EQ(value, pulseWidth);
    }
})

RHSP_TEST(Servo, SetInvalidPulseWidth, {
    WITH_HUB
    WITH_SERVO_CHANNEL
    uint8_t nackCode;

    uint16_t values[] = {0};
    for (auto value: values)
    {
        int result = rhsp_setServoPulseWidth(hub, servoChannel, value, &nackCode);
        EXPECT_EQ(result, -52);
    }
})

RHSP_TEST(Servo, SetPulseWidthInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    int result = rhsp_setServoPulseWidth(hub, channel, 10, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Servo, GetPulseWidthInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    uint16_t value;
    int result = rhsp_getServoPulseWidth(hub, channel, &value, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Servo, EnableDisable, {
    WITH_HUB
    WITH_SERVO_CHANNEL
    uint8_t isEnabled;

    RHSP_CHECK(rhsp_setServoConfiguration, servoChannel, 10000)
    RHSP_CHECK(rhsp_setServoPulseWidth, servoChannel, 1500)
    RHSP_CHECK(rhsp_setServoEnable, servoChannel, 1)
    RHSP_CHECK(rhsp_getServoEnable, servoChannel, &isEnabled)
    EXPECT_EQ(isEnabled, 1);

    RHSP_CHECK(rhsp_setServoEnable, servoChannel, 0)
    RHSP_CHECK(rhsp_getServoEnable, servoChannel, &isEnabled)
    EXPECT_EQ(isEnabled, 0);
})

RHSP_TEST(Servo, EnableInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    int result = rhsp_setServoEnable(hub, channel, 1, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Servo, GetEnableInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    uint8_t isEnabled;
    int result = rhsp_getServoEnable(hub, channel, &isEnabled, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(Servo, SetInvalidEnableState, {
    WITH_HUB
    WITH_SERVO_CHANNEL
    uint8_t nackCode;

    int result = rhsp_setServoEnable(hub, servoChannel, 2, &nackCode);
    EXPECT_EQ(result, -52);
})
