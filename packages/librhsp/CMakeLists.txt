cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)
set (CMAKE_CXX_STANDARD 17)

add_subdirectory(librhsp)

project(noderhsp)

# Set some things up for cross-compiling on Linux using clang
if(SYSTEM STREQUAL "LinuxX64")
    add_compile_options("-target" "x86_64-pc-linux-gnu")
elseif(SYSTEM STREQUAL "LinuxArm64")
    add_compile_options("-target" "aarch64-pc-linux-gnu")
    add_link_options("-target" "aarch64-pc-linux-gnu" "-fuse-ld=/usr/bin/aarch64-linux-gnu-ld")
endif()

add_definitions(-DNAPI_VERSION=8) # Keep in sync with binding-options.cjs
add_definitions(-DNAPI_DISABLE_CPP_EXCEPTIONS)

set(SOURCES
    src/addon.cc
    src/RevHubWrapper.cc
    src/serialWrapper.cc
    src/RHSPlibWorker.cc
)

# Include the node-addon-api wrapper for Node-API
# TODO: Figure out why the build breaks without this, given that the CMake.js README
#       says that it will "add [node-addon-api] to the include search path automatically"
#       https://github.com/cmake-js/cmake-js/tree/6a2a50ba3d2e82a0ea80a8bb77cd2d3a03fb838c#node-api-and-node-addon-api
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )

string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

include_directories(${NODE_ADDON_API_DIR} ${CMAKE_JS_INC} ${CMAKE_CURRENT_SOURCE_DIR}/librhsp/include ${CMAKE_CURRENT_SOURCE_DIR}/src/)

add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${SOURCES} ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB} rhsp)

