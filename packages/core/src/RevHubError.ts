import { setPrototypeOf } from "./nack-errors/set-prototype.js";

export class RevHubError extends Error {
    constructor(message: string) {
        super(message);
        setPrototypeOf(this, RevHubError.prototype);
    }
}
