//
// Created by landry on 7/25/23.
//

#include "Environment.h"

RhspRevHub* RhspEnvironment::hub;
RhspSerial* RhspEnvironment::serial;

int main(int argc, char** argv)
{
    RhspConfig::serialPath = "/dev/ttyUSB0";
    for (int i = 0; i < argc; i++)
    {
        if (strcmp(argv[i], "--serial") == 0 && i + 1 < argc)
        {
            RhspConfig::serialPath = argv[i + 1];
            break;
        }
    }
    RhspConfig::motorChannel = 3;
    RhspConfig::servoChannel = 2;
    RhspConfig::outPin = 4;
    RhspConfig::inPin = 5;
    ::testing::Environment* env = testing::AddGlobalTestEnvironment(new RhspEnvironment());

    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}