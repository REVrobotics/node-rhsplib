import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

if(process.platform !== "darwin") {
  console.log("Skipping cross build. This is not Darwin");
  process.exit(0);
}

// This file should be kept in sync with the latest build instructions from the librhsp README file.

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const rhsplibPath = path.join(scriptDirPath, "..", "librhsp");

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

let prebuiltsFolder = path.join(rhsplibPath, "prebuilts")

fs.mkdirSync(baseBuildPath + "js-darwinX64", { recursive: true })
fs.mkdirSync(baseBuildPath + "js-darwinArm64", { recursive: true })
fs.mkdirSync(path.join(prebuiltsFolder, "darwin-x64"), { recursive: true })
fs.mkdirSync(path.join(prebuiltsFolder, "darwin-arm64"), { recursive: true })

let cmakeJsArgs = [ "compile", "--config", "Release", "--CDCMAKE_SYSTEM_NAME=Darwin", "--prefer-clang=true" ]

console.log("Prebuildifying")
await runCmakeJs([...cmakeJsArgs, "--arch=x86_64", "--CDCMAKE_SYSTEM_PROCESSOR=x86_64", "--CDSYSTEM=DarwinX64"], baseBuildPath + "js-darwinX64");
await runCmakeJs([...cmakeJsArgs, "--arch=arm64", "--CDCMAKE_SYSTEM_PROCESSOR=arm64", "--CDSYSTEM=DarwinArm64"], baseBuildPath + "js-darwinArm64");

fs.copyFileSync(baseBuildPath + "js-darwinX64/rhsp.node", path.join(prebuiltsFolder, "darwin-x64/rhsp.node"))
fs.copyFileSync(baseBuildPath + "js-darwinArm64/rhsp.node", path.join(prebuiltsFolder, "darwin-arm64/rhsp.node"))

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
