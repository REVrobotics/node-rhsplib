import {NackError} from "./NackError.js";

export class CommandImplementationPendingError extends NackError {
    constructor() {
        super(253);
    }
}

export class CommandRoutingError extends NackError {
    constructor() {
        super(254);
    }
}

export class PacketTypeIDUnknownError extends NackError {
    constructor() {
        super(255);
    }
}
