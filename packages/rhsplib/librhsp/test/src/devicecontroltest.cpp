
#include "utils.h"
#include "rhsp/deviceControl.h"

RHSP_TEST(DeviceControl, BulkRead, {
    WITH_HUB

    RhspBulkInputData data;
    RHSP_CHECK(rhsp_getBulkInputData, &data)
})

RHSP_TEST(DeviceControl, BulkWrite, {
    GTEST_SKIP_("This method is not implemented");
    WITH_HUB
    RhspBulkOutputData outData;
    RhspBulkInputData inData;

    RHSP_CHECK(rhsp_setBulkOutputData, &outData, &inData)
})

RHSP_TEST(DeviceControl, InjectDataLog, {
    WITH_HUB
    RHSP_CHECK(rhsp_injectDataLogHint, "Test")
})

RHSP_TEST(DeviceControl, SetChargingStatus, {
    WITH_HUB

    uint8_t values[] = {0, 1};

    for (auto value: values)
    {
        RHSP_CHECK(rhsp_phoneChargeControl, value)

        uint8_t actual;
        RHSP_CHECK(rhsp_phoneChargeQuery, &actual)

        EXPECT_EQ(actual, value);
    }
})

RHSP_TEST(DeviceControl, SetInvalidChargingStatus, {
    WITH_HUB

    uint8_t values[] = {2, 5};

    for (auto value: values)
    {
        uint8_t nackCode;
        int result = rhsp_phoneChargeControl(hub, value, &nackCode);

        EXPECT_EQ(result, -51);
    }
})

RHSP_TEST(DeviceControl, SetFtdiControl, {
    WITH_HUB

    SKIP_IF_FIRMWARE_BELOW(1, 8, 0)

    uint8_t values[] = {0, 1};

    for (auto value: values)
    {
        RHSP_CHECK(rhsp_ftdiResetControl, value)

        uint8_t actual;
        RHSP_CHECK(rhsp_ftdiResetQuery, &actual)

        EXPECT_EQ(actual, value);
    }
})

RHSP_TEST(DeviceControl, SetInvalidFtdiControl, {
    WITH_HUB

    uint8_t nackCode;
    uint8_t values[] = {2, 5};

    for (auto value: values)
    {
        int result = rhsp_phoneChargeControl(hub, value, &nackCode);

        EXPECT_EQ(result, -51);
    }
})

RHSP_TEST(DeviceControl, ReadVersionString, {
    WITH_HUB

    char buffer[100];
    uint8_t length = 100;
    RHSP_CHECK(rhsp_readVersionString, &length, buffer)
    EXPECT_GT(length, 0);
})

RHSP_TEST(DeviceControl, ReadVersionStruct, {
    WITH_HUB

    RhspVersion version;
    RHSP_CHECK(rhsp_readVersion, &version)
})

RHSP_TEST(DeviceControl, ADC, {
    WITH_HUB

    uint8_t channels[] = {0, 1, 2, 3, 4};
    uint8_t modes[] = {0, 1};

    for (auto channel: channels)
    {
        for (auto mode: modes)
        {
            int16_t value;
            RHSP_CHECK(rhsp_getADC, channel, mode, &value)
        }
    }
})

RHSP_TEST(DeviceControl, AdcInvalidChannel, {
    WITH_HUB

    int channel = 15;

    uint8_t nackCode;
    int16_t value;
    int result = rhsp_getADC(hub, channel, 0, &value, &nackCode);

    ASSERT_EQ(result, -51);
})

RHSP_TEST(DeviceControl, AdcInvalidMode, {
    WITH_HUB

    int mode = 15;

    uint8_t nackCode;
    int16_t value;
    int result = rhsp_getADC(hub, 0, mode, &value, &nackCode);

    ASSERT_EQ(result, -52);
})
