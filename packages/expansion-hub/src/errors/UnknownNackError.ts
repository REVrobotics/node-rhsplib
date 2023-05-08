import {NackError, setPrototypeOf} from "./NackError.js";

export class UnknownNackError extends NackError {
    constructor(nackCode: number) {
        super(nackCode);
        setPrototypeOf(this, UnknownNackError.prototype);
    }
}
