import { setPrototypeOf } from "./set-prototype-of.js";
import { RevHubError } from "./RevHubError.js";

export class TimeoutError extends RevHubError {
    constructor() {
        super("");

        setPrototypeOf(this, TimeoutError.prototype);
    }
}
