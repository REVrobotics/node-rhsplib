import {SerialFlowControl, SerialParity} from "../binding.js";
import {Serial} from "../Serial.js";

import * as path from "path";

import { createRequire } from "node:module";
import {fileURLToPath} from "url";

const scriptDirPath = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const nodeGypBuild = require('node-gyp-build');

const addon = nodeGypBuild(path.join(scriptDirPath, '..', '..', '..'));

declare class SerialInternal implements Serial {
    constructor();
    close(): void;

    open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): Promise<void>;

    read(numBytesToRead: number): Promise<number[]>;

    write(bytes: number[]): Promise<void>;
}

export async function openSerial(serialPortPath: string): Promise<Serial> {
    let serial = new (addon.SerialInternal as typeof SerialInternal)();
    let i = 0;
    while(i < 100) {
        console.log(`Trying to open ${i}`);
        i++;
        try {
            await serial.open(serialPortPath,
                460800,
                8,
                SerialParity.None,
                1,
                SerialFlowControl.None);
            console.log("Successful open");
            break;
        } catch {}
    }
    return serial;
}
