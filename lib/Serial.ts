import {SerialFlowControl, SerialParity} from "./binding.js";

export interface Serial {
    open(serialPortName: string, baudrate: number, databits: number, parity: SerialParity, stopbits: number, flowControl: SerialFlowControl): Promise<void>;
    close(): void;
    read(numBytesToRead: number): Promise<number[]>;
    write(bytes: number[]): Promise<void>;
}