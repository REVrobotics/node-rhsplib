
#include "gtest/gtest.h"
#include "rhsp/rhsp.h"
#include "Environment.h"
#include "utils.h"

#ifdef _WIN32
#define random() rand()
#endif

RHSP_TEST(Basic, GetModuleStatus, {
    RhspModuleStatus status;
    WITH_HUB

    //clear flags
    uint8_t nackCode;
    rhsp_getModuleStatus(hub, 1, &status, &nackCode);

    for (int i = 1; i >= 0; i--)
    {
        RHSP_CHECK(rhsp_getModuleStatus, i, &status)

        EXPECT_EQ(status.statusWord, 0);
        EXPECT_EQ(status.motorAlerts, 0);
    }
})

RHSP_TEST(Led, SetLedColor, {
    WITH_HUB

    SKIP_IF_FIRMWARE_BELOW(1, 7, 0) //unreliable on 1.6.0

    for (int i = 0; i < 10; i++)
    {
        rhsp_sendKeepAlive(hub, 0);

        auto r = (uint8_t) random();
        auto g = (uint8_t) random();
        auto b = (uint8_t) random();
        RHSP_CHECK(rhsp_setModuleLedColor, r, g, b)

        //The LEDs need time to actually set the values.
        delay(100);

        uint8_t rActual = 0;
        uint8_t gActual = 0;
        uint8_t bActual = 0;
        RHSP_CHECK(rhsp_getModuleLedColor, &rActual, &gActual, &bActual)

        EXPECT_EQ(r, rActual);
        EXPECT_EQ(g, gActual);
        EXPECT_EQ(b, bActual);
    }
})

RHSP_TEST(Led, SetLedPatternTest, {
    GTEST_SKIP_("Firmware bug makes this test fail.");
    WITH_HUB

    RhspLedPattern pattern;
    RHSP_CHECK(rhsp_getModuleLedPattern, &pattern)
})

RHSP_TEST(Basic, SetModuleAddress, {
    WITH_HUB
    WITH_SERIAL

    RhspDiscoveredAddresses addresses;
    memset(&addresses, 0, sizeof(RhspDiscoveredAddresses));

    int result = rhsp_discoverRevHubs(serial, &addresses);
    processResult(result, 0);

    //random new address in range [1, 254]
    uint8_t newAddress = ((uint8_t) random() % 253) + 1;
    //make sure the new address is not the same as the parent address
    if (newAddress == addresses.parentAddress)
    {
        if (newAddress == 254) newAddress--;
        else newAddress++;
    }

    printf("New address is %d\n", newAddress);

    EXPECT_NE(newAddress, addresses.parentAddress);

    rhsp_sendKeepAlive(hub, 0);
    RHSP_CHECK(rhsp_setNewModuleAddress, newAddress)

    result = rhsp_discoverRevHubs(serial, &addresses);
    processResult(result, 0);

    EXPECT_EQ(newAddress, addresses.parentAddress);
})

RHSP_TEST(Basic, SetInvalidModuleAddress, {
    WITH_HUB

    uint8_t values[] = {0, 255};

    for (auto address: values)
    {
        uint8_t nackCode;
        int result = rhsp_setNewModuleAddress(hub, address, &nackCode);

        ASSERT_EQ(result, -51);
    }
})
