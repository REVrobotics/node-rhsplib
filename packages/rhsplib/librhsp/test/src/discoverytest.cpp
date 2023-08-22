#include <gtest/gtest.h>
#include "Environment.h"
#include "utils.h"
#include "rhsp/revhub.h"

// Demonstrate some basic assertions.
RHSP_TEST(Discovery, DiscoverRevHub, {
    WITH_SERIAL

    RhspDiscoveredAddresses addresses;
    memset(&addresses, 0, sizeof(RhspDiscoveredAddresses));
    int result = rhsp_discoverRevHubs(serial, &addresses);
    processResult(result, 0);

    EXPECT_GT(addresses.parentAddress, 0);
})

RHSP_TEST(Discovery, ChildHubAddresses, {
    WITH_SERIAL
    RhspRevHub* hub;
    uint8_t nackCode;

    RhspDiscoveredAddresses addresses;
    memset(&addresses, 0, sizeof(RhspDiscoveredAddresses));
    int result = rhsp_discoverRevHubs(serial, &addresses);
    processResult(result, 0);

    if(addresses.numberOfChildModules == 0) {
        GTEST_SKIP_("No child hub found");
    }

    int parentAddress = addresses.parentAddress;

    RhspRevHub* parentHub = RhspEnvironment::hub;
    hub = parentHub;

    SKIP_IF_FIRMWARE_BELOW(1, 7, 0);

    if(parentAddress == 1 || parentAddress == 254) {
        RHSP_CHECK(rhsp_setNewModuleAddress, 2)
    }

    RhspRevHub* childHub = rhsp_allocRevHub(serial, addresses.childAddresses[0]);

    RhspDiscoveredAddresses newAddresses;
    hub = childHub;
    RHSP_CHECK(rhsp_setNewModuleAddress, 1)
    rhsp_discoverRevHubs(serial, &newAddresses);
    EXPECT_EQ(newAddresses.numberOfChildModules, 1);
    EXPECT_EQ(newAddresses.childAddresses[0], 1);

    RHSP_CHECK(rhsp_setNewModuleAddress, 254)
    rhsp_discoverRevHubs(serial, &newAddresses);
    EXPECT_EQ(newAddresses.numberOfChildModules, 1);
    EXPECT_EQ(newAddresses.childAddresses[0], 254);

    RHSP_CHECK(rhsp_setNewModuleAddress, addresses.childAddresses[0])
})
