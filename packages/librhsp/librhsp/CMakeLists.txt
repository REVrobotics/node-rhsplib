cmake_minimum_required(VERSION 3.7)

message(STATUS "requested c-compiler:'${CMAKE_C_COMPILER}'")
project(rhsp VERSION 1.0 LANGUAGES C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)

# GoogleTest requires C++
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

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

if(CMAKE_CROSSCOMPILING)
    if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
        if(CMAKE_SYSTEM_PROCESSOR STREQUAL "aarch64")
            list(APPEND LIB_SOURCES
                src/arch/linux/time.c
                src/arch/linux/serial.c
            )
            add_compile_options("-target" "aarch64-pc-linux-gnu")
            add_link_options("-target" "aarch64-pc-linux-gnu" "-fuse-ld=/usr/bin/aarch64-linux-gnu-ld")
        elseif(CMAKE_SYSTEM_PROCESSOR STREQUAL "x86_64")
            list(APPEND LIB_SOURCES
                src/arch/linux/time.c
                src/arch/linux/serial.c
            )
            add_compile_options("-target" "x86_64-pc-linux-gnu")
        else()
            message(FATAL_ERROR "Unsupported architecture for Linux cross-compilation:'${CMAKE_SYSTEM_PROCESSOR}'")
        endif()
    elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
        list(APPEND LIB_SOURCES
            src/arch/win/time.c
            src/arch/win/serial.c
        )
        set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)
    elseif(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
        list(APPEND LIB_SOURCES
            src/arch/mac/time.c
            src/arch/mac/serial.c
        )
        if(CMAKE_SYSTEM_PROCESSOR STREQUAL "x86_64")
            add_compile_options("-target" "x86_64-pc-linux-gnu")
        elseif(CMAKE_SYSTEM_PROCESSOR STREQUAL "arm64")
            add_compile_options("-target" "aarch64-pc-linux-gnu")
        else()
            message(FATAL_ERROR "Unsupported architecture for Darwin cross-compilation:'${CMAKE_SYSTEM_PROCESSOR}'")
        endif()
    else()
        message(FATAL_ERROR "Unsupported system for cross-compilation:'${CMAKE_SYSTEM_NAME}'")
    endif()
else()
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
target_include_directories(rhsp PUBLIC include/)
