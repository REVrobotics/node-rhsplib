import { NackError, setPrototypeOf } from "./NackError.js";

export class CommandImplementationPendingError extends NackError {
    constructor() {
        super(
            253,
            "This command has not finished being implemented in this firmware version",
        );
        setPrototypeOf(this, CommandImplementationPendingError.prototype);
    }
}

export class CommandRoutingError extends NackError {
    constructor() {
        super(254, "The firmware reported a Command Routing Error");
        setPrototypeOf(this, CommandRoutingError.prototype);
    }
}

export class CommandNotSupportedError extends NackError {
    constructor() {
        super(255, "Command is not supported. Unknown Packet Type ID");
        setPrototypeOf(this, CommandNotSupportedError.prototype);
    }
}
