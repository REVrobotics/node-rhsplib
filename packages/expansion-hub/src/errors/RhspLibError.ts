import { setPrototypeOf } from "@rev-robotics/rev-hub-core";

export class RhspLibError extends Error {
    constructor(message: string) {
        super(message);

        setPrototypeOf(this, RhspLibError.prototype);
    }
}
