import { setPrototypeOf } from "./set-prototype.js";

export class TimeoutError extends Error {
    constructor() {
        super();

        setPrototypeOf(this, TimeoutError.prototype);
    }
}
