
#include "utils.h"
#include "rhsp/i2c.h"

RHSP_TEST(I2C, ConfigureChannel, {
    WITH_HUB
    uint8_t channels[] = {0, 1, 2, 3};
    uint8_t speedCodes[] = {0, 1};

    for (auto channel: channels)
    {
        for (auto speedCode: speedCodes)
        {
            RHSP_CHECK(rhsp_configureI2cChannel, channel, speedCode)

            uint8_t actualSpeedCode;
            RHSP_CHECK(rhsp_configureI2cQuery, channel, &actualSpeedCode)

            EXPECT_EQ(speedCode, actualSpeedCode);
        }
    }
})

RHSP_TEST(I2C, ConfigureInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;

    int result = rhsp_configureI2cChannel(hub, channel, 1, &nackCode);
    EXPECT_EQ(result, -51);
})

RHSP_TEST(I2C, ConfigureInvalidSpeedCode, {
    WITH_HUB
    int channel = 0;
    int speedCode = 10;
    uint8_t nackCode;

    int result = rhsp_configureI2cChannel(hub, channel, speedCode, &nackCode);
    EXPECT_EQ(result, -52);
})

RHSP_TEST(I2C, ConfigureQueryInvalidChannel, {
    WITH_HUB
    int channel = 10;
    uint8_t nackCode;
    uint8_t speedCode;

    int result = rhsp_configureI2cQuery(hub, channel, &speedCode, &nackCode);
    EXPECT_EQ(result, -51);
})
