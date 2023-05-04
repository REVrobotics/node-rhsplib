import {NackError} from "./NackError.js";

export class BatteryTooLowError extends NackError {
    constructor(nackCode: number) {
        super(nackCode);
    }
}
