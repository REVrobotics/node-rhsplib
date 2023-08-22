
#include "utils.h"
#include "rhsp/dio.h"

RHSP_TEST(Dio, SetSingleOutput, {
    WITH_HUB
    WITH_INPUT_PIN
    WITH_OUTPUT_PIN

    uint8_t values[] = {0, 1};

    RHSP_CHECK(rhsp_setDirection, outPin, 1)
    RHSP_CHECK(rhsp_setDirection, inPin, 0)

    for (auto value: values)
    {
        RHSP_CHECK(rhsp_setSingleOutput, outPin, value)

        uint8_t in;
        RHSP_CHECK(rhsp_getSingleInput, inPin, &in)

        EXPECT_EQ(in, value) << "Check that pin " << outPin << " and pin " << inPin << " are connected.";
    }
})

RHSP_TEST(Dio, SetOutputForInputPin, {
    WITH_HUB
    uint8_t nackCode;

    uint8_t pins[] = {0, 1, 2, 3, 4, 5, 6, 7};

    for (auto pin: pins)
    {
        RHSP_CHECK(rhsp_setDirection, pin, 0)

        int result = rhsp_setSingleOutput(hub, pin, 1, &nackCode);
        EXPECT_EQ(result, -4);
    }
})

RHSP_TEST(Dio, SetAllDioOutputWithWorkaround, {
    WITH_HUB
    WITH_INPUT_PIN
    WITH_OUTPUT_PIN

    for (int i = 0; i < 8; i++)
    {
        RHSP_CHECK(rhsp_setDirection, i, 1)
    }

    RHSP_CHECK(rhsp_setDirection, inPin, 0)
    RHSP_CHECK(rhsp_setDirection, outPin, 1)

    uint8_t values[] = {24, 57, 57, 10, 135, 137, 98, 255, 0};
    for (auto value: values)
    {
        uint8_t expected = !!(value & (1 << outPin));
        RHSP_CHECK(rhsp_setAllOutputs, value)

        delay(10);

        uint8_t in = 0;
        RHSP_CHECK(rhsp_getSingleInput, inPin, &in)

        EXPECT_EQ(in, expected);
    }
})


RHSP_TEST(Dio, SetAllDioOutput, {
    WITH_HUB
    WITH_INPUT_PIN
    WITH_OUTPUT_PIN

    GTEST_SKIP_("This will fail due to a firmware bug in setAllOutputs");

    RHSP_CHECK(rhsp_setDirection, inPin, 0)
    RHSP_CHECK(rhsp_setDirection, outPin, 1)

    uint8_t values[] = {24, 57, 57, 10, 135, 137, 98, 255, 0};
    for (auto value: values)
    {
        uint8_t expected = !!(value & (1 << outPin));
        RHSP_CHECK(rhsp_setAllOutputs, value)

        delay(10);

        uint8_t in = 0;
        RHSP_CHECK(rhsp_getSingleInput, inPin, &in)

        EXPECT_EQ(in, expected);
    }
})

RHSP_TEST(Dio, SetAllDioOutputWhenNoOutputPins, {
    WITH_HUB
    uint8_t nackCode;

    for (int i = 0; i < 8; i++)
    {
        RHSP_CHECK(rhsp_setDirection, i, 0)
    }

    int result = rhsp_setAllOutputs(hub, 255, &nackCode);
    EXPECT_EQ(result, -4);
    EXPECT_EQ(nackCode, 18);
})

RHSP_TEST(Dio, SetSingleOutputWhenAllPinsAreOutput, {
    WITH_HUB
    uint8_t nackCode;

    for (int i = 0; i < 8; i++)
    {
        RHSP_CHECK(rhsp_setDirection, i, 1)
    }

    uint8_t pins[] = {0, 1, 2, 3, 4, 5, 6, 7};
    for (auto pin: pins)
    {
        uint8_t value;
        int result = rhsp_getSingleInput(hub, pin, &value, &nackCode);
        EXPECT_EQ(result, -4);
        EXPECT_EQ(nackCode, 20 + pin);
    }
})

RHSP_TEST(Dio, GetAllInputWhenAllPinsAreOutput, {
    WITH_HUB
    uint8_t nackCode;

    for (int i = 0; i < 8; i++)
    {
        RHSP_CHECK(rhsp_setDirection, i, 1)
    }

    uint8_t values;
    int result = rhsp_getAllInputs(hub, &values, &nackCode);

    EXPECT_EQ(result, -4);
    EXPECT_EQ(nackCode, 28);
})

RHSP_TEST(Dio, SetPinFromOutputToInput, {
    WITH_HUB
    WITH_INPUT_PIN
    WITH_OUTPUT_PIN

    // set both as inputs
    RHSP_CHECK(rhsp_setDirection, inPin, 0)
    RHSP_CHECK(rhsp_setDirection, outPin, 0)

    uint8_t value;
    RHSP_CHECK(rhsp_getSingleInput, inPin, &value)
    EXPECT_EQ(value, 1);

    RHSP_CHECK(rhsp_setDirection, outPin, 1)

    RHSP_CHECK(rhsp_getSingleInput, inPin, &value)
    EXPECT_EQ(value, 0);
})

RHSP_TEST(Dio, GetDirection, {
    WITH_HUB

    for (int i = 0; i < 8; i++)
    {
        uint8_t isOutput;
        RHSP_CHECK(rhsp_getDirection, i, &isOutput)
    }
})
