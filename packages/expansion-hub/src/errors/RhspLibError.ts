import {RevHubError, setPrototypeOf} from "@rev-robotics/rev-hub-core";

export class RhspLibError extends RevHubError {
    constructor(message: string) {
        super(message);

        setPrototypeOf(this, RhspLibError.prototype);
    }
}
