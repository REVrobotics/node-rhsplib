import { NackError, setPrototypeOf } from "./NackError.js";
import { NackCode } from "@rev-robotics/rev-hub-core";

export class CommandImplementationPendingError extends NackError {
    constructor() {
        super(
            NackCode.COMMAND_IMPLEMENTATION_PENDING,
            "This command has not finished being implemented in this firmware version",
        );
        setPrototypeOf(this, CommandImplementationPendingError.prototype);
    }
}

export class CommandRoutingError extends NackError {
    constructor() {
        super(
            NackCode.COMMAND_ROUTING_ERROR,
            "The firmware reported a Command Routing Error",
        );
        setPrototypeOf(this, CommandRoutingError.prototype);
    }
}

export class CommandNotSupportedError extends NackError {
    constructor() {
        super(
            NackCode.COMMAND_NOT_SUPPORTED,
            "Command is not supported. Unknown Packet Type ID",
        );
        setPrototypeOf(this, CommandNotSupportedError.prototype);
    }
}
