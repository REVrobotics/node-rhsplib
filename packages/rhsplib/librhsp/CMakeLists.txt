cmake_minimum_required(VERSION 3.7)

# Opt-in to new behaviors surrounding VERSION variables
cmake_policy(SET CMP0048 NEW)

message(STATUS "requested c-compiler:'${CMAKE_C_COMPILER}'")
project(rhsp VERSION 3.0.0 LANGUAGES C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)

# GoogleTest requires C++
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# FetchContent wants this
if (CMAKE_VERSION VERSION_GREATER_EQUAL "3.24.0")
    cmake_policy(SET CMP0135 NEW)
endif()

# Install GoogleTest
include(FetchContent)
FetchContent_Declare(
        googletest
        URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING
            "Choose the type of build, options are: None Debug Release RelWithDebInfo MinSizeRel."
            FORCE
            )
endif()

if(NOT MSVC)
    add_compile_options(
            "-Wall" "-pedantic"
            "$<$<CONFIG:DEBUG>:-O0;-g;>"
            "$<$<CONFIG:RELEASE>:-O2;>"
    )
endif()

set(LIB_SOURCES
        src/rhsp.c
        src/deviceControl.c
        src/i2c.c
        src/dio.c
        src/motor.c
        src/servo.c
        src/module.c
        src/command.c
        src/revhub.c
        src/packet.c
)

if(NOT CMAKE_CROSSCOMPILING)
    if(APPLE)
        list(APPEND LIB_SOURCES
                src/arch/mac/time.c
                src/arch/mac/serial.c
                )
    elseif(UNIX)
        list(APPEND LIB_SOURCES
                src/arch/linux/time.c
                src/arch/linux/serial.c
                )
    elseif(WIN32)
        set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)
        list(APPEND LIB_SOURCES
                src/arch/win/time.c
                src/arch/win/serial.c
                )
    else()
        message(FATAL_ERROR "Unsupported system detected:'${CMAKE_SYSTEM}'")
    endif()
endif()

add_library(rhsp ${LIB_SOURCES})
target_include_directories(rhsp PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        )

if(NOT WIN32) # test build fails on Windows right now
    enable_testing()

    add_executable(tests  ${LIB_SOURCES} test/src/discoverytest.cpp test/src/Environment.cpp test/src/RhspConfig.cpp
            test/src/motortest.cpp test/src/utils.cpp test/src/basictest.cpp
            test/src/devicecontroltest.cpp
            test/src/diotest.cpp
            test/src/pwmservotest.cpp
            test/src/i2ctest.cpp)
    target_link_libraries(tests GTest::gtest)
    target_include_directories(tests PUBLIC $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include> ./test/include)

    include(GoogleTest)
    gtest_discover_tests(tests)
endif ()
