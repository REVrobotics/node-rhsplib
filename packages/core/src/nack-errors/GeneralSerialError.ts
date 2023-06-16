import { setPrototypeOf } from "./set-prototype.js";

/**
 * Indicates an error in the Serial connection.
 */
export class GeneralSerialError extends Error {
    serialNumber: string;
    constructor(serialNumber: string) {
        super(`Serial Port Error for ${serialNumber}`);

        this.serialNumber = serialNumber;
        setPrototypeOf(this, GeneralSerialError.prototype);
    }
}
