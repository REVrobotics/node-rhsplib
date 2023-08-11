import { setPrototypeOf } from "./set-prototype.js";
import { NackError } from "./NackError.js";
import { NackCode } from "./nack-codes.js";

export class I2cControllerBusyError extends NackError {
    constructor() {
        super(NackCode.I2C_CONTROLLER_BUSY, "I2C Controller busy");
        setPrototypeOf(this, I2cControllerBusyError.prototype);
    }
}

export class I2cOperationInProgressError extends NackError {
    constructor() {
        super(NackCode.I2C_OPERATION_IN_PROGRESS, "I2C Operation in progress");
        setPrototypeOf(this, I2cOperationInProgressError.prototype);
    }
}

export class I2cNoResultsPendingError extends NackError {
    constructor() {
        super(NackCode.I2C_NO_RESULTS_PENDING, "No I2C results pending");
        setPrototypeOf(this, I2cNoResultsPendingError.prototype);
    }
}

export class I2cQueryMismatchError extends NackError {
    constructor() {
        super(NackCode.I2C_QUERY_MISMATCH, "I2C query mismatch");
        setPrototypeOf(this, I2cQueryMismatchError.prototype);
    }
}

export class I2cTimeoutSdaStuckError extends NackError {
    constructor() {
        super(NackCode.I2C_TIMEOUT_SDA_STUCK, "I2C SDA pin stuck");
        setPrototypeOf(this, I2cTimeoutSdaStuckError.prototype);
    }
}

export class I2cTimeoutSclStuckError extends NackError {
    constructor() {
        super(NackCode.I2C_TIMEOUT_SCL_STUCK, "I2C SCL pin stuck");
        setPrototypeOf(this, I2cTimeoutSclStuckError.prototype);
    }
}

export class I2cTimeoutError extends NackError {
    constructor() {
        super(NackCode.I2C_TIMEOUT, "I2C timeout");
        setPrototypeOf(this, I2cTimeoutError.prototype);
    }
}
