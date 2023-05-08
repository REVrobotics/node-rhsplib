import {NackError, setPrototypeOf} from "./NackError.js";

export class BatteryTooLowError extends NackError {
    constructor(nackCode: number) {
        super(nackCode);
        setPrototypeOf(this, BatteryTooLowError.prototype);
    }
}
