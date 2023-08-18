// https://github.com/cmake-js/cmake-js/issues/200
// To build cross-build for Windows, we need a
// node.lib file with the proper symbols.
// By creating a node.def file listing the
// symbols we need, we can run dlltool to
// create node.lib

import * as headers from "node-api-headers"
import * as fs from "fs";
import { spawn } from "child_process";

// https://github.com/cmake-js/cmake-js/blob/6a2a50ba3d2e82a0ea80a8bb77cd2d3a03fb838c/lib/cMake.js#L293
async function generateNodelibDef(targetFile) {
  try {
    // Compile a Set of all the symbols that could be exported
    const allSymbols = new Set()
    for (const ver of Object.values(headers.symbols)) {
      for (const sym of ver.node_api_symbols) {
        allSymbols.add(sym)
      }
      for (const sym of ver.js_native_api_symbols) {
        allSymbols.add(sym)
      }
    }

    // Write a 'def' file for NODE.EXE
    const allSymbolsArr = Array.from(allSymbols)
    fs.writeFileSync(targetFile, 'NAME NODE.EXE\nEXPORTS\n' + allSymbolsArr.join('\n'));

    return targetFile
  } catch(e) {
    // It most likely wasn't found
    console.log(e);
    throw new Error(`Failed to generate def for node.lib`)
  }
}

async function compileDef(defFile, outFile) {
  let args = [ "-d", defFile, "-l", outFile, "-m", "i386:x86-64" ]
  let dlltool = spawn("llvm-dlltool", args)
  dlltool.stderr.pipe(process.stderr);
  dlltool.stdout.pipe(process.stdout);
  await new Promise((resolve, reject) => {
    dlltool.on("error", (e) => reject(e));
    dlltool.on("exit", (code, signal) => {
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

if(!fs.existsSync("./build-def")) {
  fs.mkdirSync("./build-def");
}
await generateNodelibDef("./build-def/node.def");
await compileDef("./build-def/node.def", "./build-def/node.lib")
