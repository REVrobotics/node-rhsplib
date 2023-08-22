//
// Created by landry on 7/25/23.
//

#ifndef RHSP_ENVIRONMENT_H
#define RHSP_ENVIRONMENT_H

#include <gtest/gtest.h>
#include "rhsp/rhsp.h"
#include "RhspConfig.h"

class RhspEnvironment : public ::testing::Environment {
public:
    ~RhspEnvironment() override = default;

    static RhspRevHub* hub;
    static RhspSerial* serial;

    static void prepareTest()
    {
        RhspModuleStatus status;
        rhsp_getModuleStatus(hub, 1, &status, nullptr);
        rhsp_sendKeepAlive(hub, nullptr);
    }

    static void endTest()
    {
        rhsp_sendFailSafe(hub, nullptr);
    }

    static void initializeHub(const char* serialPath)
    {

        if(!serial) {
            serial = new RhspSerial();
            rhsp_serialInit(serial);

            rhsp_serialOpen(serial, serialPath, 460800, 8, RHSP_SERIAL_PARITY_NONE, 1, RHSP_SERIAL_FLOW_CONTROL_NONE);
        }

        RhspDiscoveredAddresses addresses;
        memset(&addresses, 0, sizeof(RhspDiscoveredAddresses));
        int discoveryResult = rhsp_discoverRevHubs(serial, &addresses);

        ASSERT_EQ(RHSP_RESULT_OK, discoveryResult) << "Unable to find hub!";

        hub = rhsp_allocRevHub(serial, addresses.parentAddress);
        rhsp_sendKeepAlive(hub, nullptr);
    }

    // Override this to define how to set up the environment.
    void SetUp() override
    {
        printf("Setting up tests\n");
        initializeHub(RhspConfig::serialPath);
    }

    // Override this to define how to tear down the environment.
    void TearDown() override
    {
        rhsp_serialClose(serial);
    }
};


#endif //RHSP_ENVIRONMENT_H
