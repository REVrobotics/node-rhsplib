import path from "node:path";
import * as fs from "fs";
import { spawn } from "child_process";
import { platform } from "os";
import { fileURLToPath } from "url";

// This file should be kept in sync with the latest build instructions from the RHSPlib README file.

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const rhsplibPath = path.join(scriptDirPath, "..", "RHSPlib");
const buildPath = path.join(rhsplibPath, "build-windows");

fs.mkdirSync(buildPath, { recursive: true });

let configureOptions = [];
let buildOptions = [];

if(process.env.CI === "true") {
    process.exit(0);
}

if (platform() === "win32") {
    buildOptions = ["--config", "Release"];
} else if (platform() === "linux") {
    configureOptions = ["-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_C_COMPILER=clang", "-DCMAKE_CXX_COMPILER=clang++"];
}

console.log("Configuring CMake\n");
await runCmakeWithArgs([...configureOptions, ".."]);
console.log("\nBuilding RHSPlib\n");
await runCmakeWithArgs(["--build", ".", ...buildOptions]);

console.log("\nSuccessfully built RHSPlib");

async function runCmakeWithArgs(args) {
    const cmake = spawn("cmake", args, {
        cwd: buildPath,
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
