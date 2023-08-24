import { RevHubError } from "../general-errors/RevHubError.js";
import { setPrototypeOf } from "../general-errors/set-prototype-of.js";

export class NackError extends RevHubError {
    nackCode: number;
    constructor(nackCode: number, message: string) {
        super(message);

        this.nackCode = nackCode;
        setPrototypeOf(this, NackError.prototype);
    }
}
