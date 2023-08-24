import { setPrototypeOf } from "./set-prototype-of.js";

export class TimeoutError extends Error {
    constructor() {
        super();

        setPrototypeOf(this, TimeoutError.prototype);
    }
}
