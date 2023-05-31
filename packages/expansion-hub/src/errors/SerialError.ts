import { setPrototypeOf } from "./NackError.js";

/**
 * Indicates an error in the Serial connection.
 */
export class SerialError extends Error {
    constructor() {
        super();

        setPrototypeOf(this, SerialError.prototype);
    }
}
