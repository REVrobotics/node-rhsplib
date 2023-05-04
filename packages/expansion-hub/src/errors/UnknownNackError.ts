import {NackError} from "./NackError.js";

export class UnknownNackError extends NackError {
    constructor(nackCode: number) {
        super(nackCode);
    }
}
