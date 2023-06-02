import { setPrototypeOf } from "./NackError.js";

export class RhspLibError extends Error {
    constructor(message: string) {
        super(message);

        setPrototypeOf(this, RhspLibError.prototype);
    }
}
