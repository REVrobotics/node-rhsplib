import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

if(process.platform !== "darwin") {
  console.log("Skipping cross build. This is not Darwin");
  process.exit(0);
}

// This file should be kept in sync with the latest build instructions from the RHSPlib README file.

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const rhsplibPath = path.join(scriptDirPath, "..", "RHSPlib");

const darwinX64BuildPath = path.join(rhsplibPath, "build-darwinX64");
const darwinArm64BuildPath = path.join(rhsplibPath, "build-darwinArm64");

fs.mkdirSync(darwinX64BuildPath, { recursive: true });
fs.mkdirSync(darwinArm64BuildPath, { recursive: true });

const darwinX64Options = ["-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=clang", "-DCMAKE_CXX_COMPILER=clang++", "-DCMAKE_SYSTEM_PROCESSOR=x86_64" ];
const darwinArm64Options = ["-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=clang", "-DCMAKE_CXX_COMPILER=clang++", "-DCMAKE_SYSTEM_PROCESSOR=arm64" ];

let baseBuildPath = path.join(rhsplibPath, "build-");

console.log("Building Darwin X64")
await runCmakeWithArgs([...darwinX64Options, ".."], `${baseBuildPath}darwinX64`);
await runCmakeWithArgs(["--build", "."], `${baseBuildPath}darwinX64`);

console.log("Building Darwin Arm64")
await runCmakeWithArgs([...darwinArm64Options, ".."], `${baseBuildPath}darwinArm64`);
await runCmakeWithArgs(["--build", "."], `${baseBuildPath}darwinArm64`);

console.log("Prebuildifying")
await prebuildify(["--napi", "--platform=darwin", "--arch=x86_64"]);
await prebuildify(["--napi", "--platform=darwin", "--arch=arm64"]);

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
