import { setPrototypeOf } from "./set-prototype.js";
import { NackError } from "./NackError.js";

export class UnrecognizedNackError extends NackError {
    constructor(nackCode: number) {
        super(
            nackCode,
            `Received unrecognized NACK error code ${nackCode} from the REV Hub`,
        );
        setPrototypeOf(this, UnrecognizedNackError.prototype);
    }
}
