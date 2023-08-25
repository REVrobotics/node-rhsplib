import { RevHubError } from "./RevHubError.js";

export class HubNotRespondingError extends RevHubError {
    constructor(message: string) {
        super(message);
    }
}
