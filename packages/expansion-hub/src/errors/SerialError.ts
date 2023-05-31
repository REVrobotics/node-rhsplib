import { setPrototypeOf } from "./NackError.js";

/**
 * Indicates an error in the Serial connection.
 */
export class SerialError extends Error {
    serialNumber: string;
    constructor(serialNumber: string) {
        super(`Serial Port Error for ${serialNumber}`);

        this.serialNumber = serialNumber;
        setPrototypeOf(this, SerialError.prototype);
    }
}
