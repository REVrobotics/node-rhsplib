import { setPrototypeOf } from "./nack-errors/NackError.js";

export class RevHubError extends Error {
    constructor(message: string) {
        super(message);
        setPrototypeOf(this, RevHubError.prototype);
    }
}