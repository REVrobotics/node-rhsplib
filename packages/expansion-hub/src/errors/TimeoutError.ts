import { setPrototypeOf } from "./NackError.js";

export class TimeoutError extends Error {
    constructor() {
        super();

        setPrototypeOf(this, TimeoutError.prototype);
    }
}
