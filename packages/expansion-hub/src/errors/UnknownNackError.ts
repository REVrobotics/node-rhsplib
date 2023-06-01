import {NackError, setPrototypeOf} from "./NackError.js";

export class UnknownNackError extends NackError {
    constructor(nackCode: number) {
        super(nackCode, `Received NACK error code ${nackCode} from the REV Hub`);
        setPrototypeOf(this, UnknownNackError.prototype);
    }
}
