# C library for REV Hub Serial Protocol

# Building with CMake

For all platforms, create a `build` folder at the top level if one does not exist, and `cd` into it.

## For Linux
### GCC
Build tree configuration

`cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=gcc ..`

Build using make

`cmake --build .`

## For Windows
### MSVC
Build tree configuration

`cmake ..`

Build using msbuild

`cmake --build . --config Release`

### MinGW64
Build tree configuration

`cmake -DCMAKE_C_COMPILER="c:/mingw-w64/x86_64-8.1.0-win32-seh-rt_v6-rev0/mingw64/bin/gcc.exe" -G "MinGW Makefiles" ..`

Build using make

`cmake --build .`
