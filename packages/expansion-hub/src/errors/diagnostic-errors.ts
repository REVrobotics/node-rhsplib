import {NackError, setPrototypeOf} from "./NackError.js";

export class CommandImplementationPendingError extends NackError {
    constructor() {
        super(253);
        setPrototypeOf(this, CommandImplementationPendingError.prototype);
    }
}

export class CommandRoutingError extends NackError {
    constructor() {
        super(254);
        setPrototypeOf(this, CommandRoutingError.prototype);
    }
}

export class PacketTypeIDUnknownError extends NackError {
    constructor() {
        super(255);
        setPrototypeOf(this, PacketTypeIDUnknownError.prototype);
    }
}
