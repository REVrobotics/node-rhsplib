import { setPrototypeOf } from "./set-prototype-of.js";

export class RevHubError extends Error {
    constructor(message: string) {
        super(message);
        setPrototypeOf(this, RevHubError.prototype);
    }
}
