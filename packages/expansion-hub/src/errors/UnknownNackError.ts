import {NackError, setPrototypeOf} from "./NackError.js";

export class UnknownNackError extends NackError {
    constructor(nackCode: number) {
        super(nackCode, `Unknown NACK with code ${nackCode}`);
        setPrototypeOf(this, UnknownNackError.prototype);
    }
}
