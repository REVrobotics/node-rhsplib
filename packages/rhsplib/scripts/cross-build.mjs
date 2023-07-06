import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

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
let windowsArgs = [ "-DCMAKE_SYSTEM_NAME=Windows", "-DCMAKE_SYSTEM_PROCESSOR=x86_64" ];

await runCmakeWithArgs([...commonConfigureOptions, ...linuxX64Args, ".."], "build-linuxX64");
await runCmakeWithArgs([...commonConfigureOptions, ...linuxArm64Args, ".."], "build-linuxArm64");
await runCmakeWithArgs([...commonConfigureOptions, ...windowsArgs, ".."], "build-windows");

await prebuildify("--napi", "--target=linux-x64");
await prebuildify("--napi", "--target=linux-arm64");
await prebuildify("--napi", "--target=win-x64");

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

async function prebuildify(args) {
  const prebuildify = spawn(`prebuildify`, args, {
    cwd: cwd,
  });
  prebuildify.stderr.pipe(process.stderr);
  prebuildify.stdout.pipe(process.stdout);
}
