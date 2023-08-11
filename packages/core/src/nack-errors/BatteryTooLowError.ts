import { NackError } from "./NackError.js";
import { setPrototypeOf } from "./set-prototype.js";

export class BatteryTooLowError extends NackError {
    constructor(nackCode: number, message: string) {
        super(nackCode, message);
        setPrototypeOf(this, BatteryTooLowError.prototype);
    }
}
