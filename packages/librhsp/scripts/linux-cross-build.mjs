import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

if(process.platform !== "linux") {
  console.log("Skipping cross build. This is not Linux");
  process.exit(0);
}

// This file should be kept in sync with the latest build instructions from the librhsp README file.

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const rhsplibPath = path.join(scriptDirPath, "..", "librhsp");

const linuxX64BuildPath = path.join(rhsplibPath, "build-linuxX64");
const linuxArm64BuildPath = path.join(rhsplibPath, "build-linuxArm64");
const windowsBuildPath = path.join(rhsplibPath, "build-windows");

fs.mkdirSync(linuxX64BuildPath, { recursive: true });
fs.mkdirSync(linuxArm64BuildPath, { recursive: true });
fs.mkdirSync(windowsBuildPath, { recursive: true });

let commonConfigureOptions = ["-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=clang", "-DCMAKE_CXX_COMPILER=clang++" ];

let linuxArm64Args = [ "-DCMAKE_SYSTEM_NAME=Linux", "-DCMAKE_SYSTEM_PROCESSOR=aarch64" ];
let linuxX64Args = [ "-DCMAKE_SYSTEM_NAME=Linux", "-DCMAKE_SYSTEM_PROCESSOR=x86_64" ];
let windowsArgs = [ "-DCMAKE_SYSTEM_NAME=Windows", "-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc", "-DCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++" ];

let baseBuildPath = path.join(rhsplibPath, "build-");

console.log("Building Linux X64");
await runCmakeWithArgs([...commonConfigureOptions, ...linuxX64Args, ".."], `${baseBuildPath}linuxX64`);
await runCmakeWithArgs(["--build", "."], `${baseBuildPath}linuxX64`);
console.log("Building Linux Arm64");
await runCmakeWithArgs([...commonConfigureOptions, ...linuxArm64Args, ".."], `${baseBuildPath}linuxArm64`);
await runCmakeWithArgs(["--build", "."], `${baseBuildPath}linuxArm64`);
console.log("Building Windows");
await runCmakeWithArgs([...windowsArgs, ".."], `${baseBuildPath}windows`);
await runCmakeWithArgs(["--build", "."], `${baseBuildPath}windows`);
console.log("Build librhsp");
console.log();

let cmakeJsArgs = [ "compile", "--config", "Release" ]
let cmakeJsWindowsArgs = [ "--CDCMAKE_SYSTEM_NAME=Windows", "--CDCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc-posix", "--CDCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++-posix" ]
let cmakeJsLinuxArgs = [ "--prefer-make=true", "--prefer-clang=true", "--CDCMAKE_SYSTEM_NAME=Linux" ]

let prebuiltsFolder = path.join(rhsplibPath, "prebuilts")

fs.mkdirSync(baseBuildPath + "js-linuxX64", { recursive: true })
fs.mkdirSync(baseBuildPath + "js-linuxArm64", { recursive: true })
fs.mkdirSync(baseBuildPath + "js-windowsX64", { recursive: true })
fs.mkdirSync(path.join(prebuiltsFolder, "linux-x64"), { recursive: true })
fs.mkdirSync(path.join(prebuiltsFolder, "linux-arm64"), { recursive: true })
fs.mkdirSync(path.join(prebuiltsFolder, "windows-x64"), { recursive: true })

await runCmakeJs([...cmakeJsArgs, ...cmakeJsLinuxArgs, "--CDSYSTEM=LinuxX64"], baseBuildPath + "js-linuxX64")
await runCmakeJs([...cmakeJsArgs, ...cmakeJsLinuxArgs, "--CDSYSTEM=LinuxArm64"], baseBuildPath + "js-linuxArm64")
//await runCmakeJs([...cmakeJsArgs, ...cmakeJsWindowsArgs, "--CDSYSTEM=Windows"], baseBuildPath + "js-windowsX64")

fs.copyFileSync("build-js-linuxArm64/rhsp.node", path.join(prebuiltsFolder, "linux-arm64/rhsp.node"))
fs.copyFileSync("build-js-linuxX64/rhsp.node", path.join(prebuiltsFolder, "linux-x64/rhsp.node"))
fs.copyFileSync("build-linuxArm64/librhsp.so", path.join(prebuiltsFolder, "linux-arm64/librhsp.so"))
fs.copyFileSync("build-linuxX64/librhsp.so", path.join(prebuiltsFolder, "linux-x64/librhsp.so"))

async function runCmakeWithArgs(args, cwd) {
  const cmake = spawn("cmake", args, {
    cwd: cwd,
  });
  cmake.stderr.pipe(process.stderr);
  cmake.stdout.pipe(process.stdout);
  await new Promise((resolve, reject) => {
    cmake.on("error", (e) => reject(e));
    cmake.on("exit", (code, signal) => {
      if (signal != null) {
        reject(new Error(`CMake execution was terminated by signal ${signal}`));
      } else if (code === 0) {
        resolve();
      } else {
        reject(`CMake exited with code ${code}`);
      }
    });
  });
}

async function runCmakeJs(args, outDir) {
  fs.rmSync("build/", { recursive: true, force: true })
  console.log("Running CMake js")
  const cmakejs = spawn("cmake-js", args, {});
  cmakejs.stderr.pipe(process.stderr);
  cmakejs.stdout.pipe(process.stdout);
  await new Promise((resolve, reject) => {
    cmakejs.on("error", (e) => reject(e));
    cmakejs.on("exit", (code, signal) => {
      if (signal != null) {
        reject(new Error(`CMake execution was terminated by signal ${signal}`));
      } else if (code === 0) {
        resolve();
      } else {
        reject(`CMake exited with code ${code}`);
      }
    });
  });

  fs.copyFileSync("build/Release/rhsp.node", path.join(outDir, "rhsp.node"))
}
