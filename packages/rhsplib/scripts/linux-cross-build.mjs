import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

if(process.platform !== "linux") {
  console.log("Skipping cross build. This is not Linux");
  process.exit(0);
}

// This file should be kept in sync with the latest build instructions from the RHSPlib README file.

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const rhsplibPath = path.join(scriptDirPath, "..", "RHSPlib");

const linuxX64BuildPath = path.join(rhsplibPath, "build-linuxX64");
const linuxArm64BuildPath = path.join(rhsplibPath, "build-linuxArm64");
const windowsBuildPath = path.join(rhsplibPath, "build-windows");

fs.mkdirSync(linuxX64BuildPath, { recursive: true });
fs.mkdirSync(linuxArm64BuildPath, { recursive: true });
fs.mkdirSync(windowsBuildPath, { recursive: true });

let commonConfigureOptions = ["-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=clang", "-DCMAKE_CXX_COMPILER=clang++" ];

let linuxArm64Args = [ "-DCMAKE_SYSTEM_NAME=Linux", "-DCMAKE_SYSTEM_PROCESSOR=aarch64" ];
let linuxX64Args = [ "-DCMAKE_SYSTEM_NAME=Linux", "-DCMAKE_SYSTEM_PROCESSOR=x86_64" ];
let windowsArgs = [ "-DCMAKE_SYSTEM_NAME=Windows", "-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc" ];

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
console.log("Build RHSPlib");
console.log();

console.log("LinuxX64");
fs.readdirSync(`${baseBuildPath}linuxX64`).forEach(file => {
  console.log(file);
});
console.log();

console.log("LinuxArm64");
fs.readdirSync(`${baseBuildPath}linuxArm64`).forEach(file => {
  console.log(file);
});
console.log();

console.log("Windows");
fs.readdirSync(`${baseBuildPath}windows`).forEach(file => {
  console.log(file);
});
console.log();

console.log("Prebuilding Linux X64");
await prebuildify(["--napi", "--platform=linux", "--arch=x86_64"], `${baseBuildPath}linuxX64`);
console.log("Prebuilding Linux Arm64");
await prebuildify(["--napi", "--platform=linux", "--arch=arm64"], `${baseBuildPath}linuxArm64`);
console.log("Prebuilding Windows");
await prebuildify(["--napi", "--platform=win32", "--arch=x64"], `${baseBuildPath}windows`);

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

async function prebuildify(args, cwd) {
  const prebuildify = spawn(`prebuildify`, args);
  prebuildify.stderr.pipe(process.stderr);
  prebuildify.stdout.pipe(process.stdout);

  await new Promise((resolve, reject) => {
    prebuildify.on("error", (e) => reject(e));
    prebuildify.on("exit", (code, signal) => {
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
