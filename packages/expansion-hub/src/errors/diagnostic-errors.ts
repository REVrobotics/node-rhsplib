import {NackError, setPrototypeOf} from "./NackError.js";

export class CommandImplementationPendingError extends NackError {
    constructor() {
        super(253, "This command has not finished being implemented in this firmware version");
        setPrototypeOf(this, CommandImplementationPendingError.prototype);
    }
}

export class CommandRoutingError extends NackError {
    constructor() {
        super(254, "Command Routing Error");
        setPrototypeOf(this, CommandRoutingError.prototype);
    }
}

export class PacketTypeIDUnknownError extends NackError {
    constructor() {
        super(255, "Unknown Packet Type ID");
        setPrototypeOf(this, PacketTypeIDUnknownError.prototype);
    }
}
