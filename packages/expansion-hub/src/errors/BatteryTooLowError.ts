import {NackError, setPrototypeOf} from "./NackError.js";

export class BatteryTooLowError extends NackError {
    constructor(nackCode: number, message: string) {
        super(nackCode, message);
        setPrototypeOf(this, BatteryTooLowError.prototype);
    }
}
