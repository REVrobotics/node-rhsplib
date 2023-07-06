cmake_minimum_required(VERSION 3.7)

message(STATUS "requested c-compiler:'${CMAKE_C_COMPILER}'")
project(RHSPlib VERSION 1.0 LANGUAGES C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS ON)

option(BUILD_SHARED_LIBS "Build using shared libraries" ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS OFF)

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

set(LIB_HEADERS
    RHSPlib_compiler.h
    RHSPlib_device_control.h
    RHSPlib.h
    RHSPlib_i2c.h
    RHSPlib_dio.h
    RHSPlib_motor.h
    RHSPlib_pwm.h
    RHSPlib_servo.h
    arch/includes/RHSPlib_serial.h
    arch/includes/RHSPlib_time.h
)
set(LIB_SOURCES
    RHSPlib.c
    RHSPlib_device_control.c
    RHSPlib_i2c.c
    RHSPlib_dio.c
    RHSPlib_motor.c
    RHSPlib_pwm.c
    RHSPlib_servo.c
)

if(NOT CMAKE_CROSSCOMPILING)
    if(APPLE)
        list(APPEND LIB_SOURCES
            arch/mac/RHSPlib_time.c
            arch/mac/RHSPlib_serial.c
        )
    elseif(UNIX)
        list(APPEND LIB_SOURCES
            arch/linux/RHSPlib_time.c
            arch/linux/RHSPlib_serial.c
        )
    elseif(WIN32)
	set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)
        list(APPEND LIB_SOURCES
            arch/win/RHSPlib_time.c
            arch/win/RHSPlib_serial.c
        )
    else()
        message(FATAL_ERROR "Unsupported system detected:'${CMAKE_SYSTEM}'")
    endif()
endif()

add_library(RHSPlib ${LIB_SOURCES} ${LIB_HEADERS})
target_include_directories(RHSPlib PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/arch/includes>
)
