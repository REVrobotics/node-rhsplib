import {NackError, setPrototypeOf} from "./NackError.js";

export class I2cMasterBusyError extends NackError {
    constructor() {
        super(40);
        setPrototypeOf(this, I2cMasterBusyError.prototype);
    }
}

export class I2cOperationInProgressError extends NackError {
    constructor() {
        super(41);
        setPrototypeOf(this, I2cOperationInProgressError.prototype);
    }
}

export class I2cNoResultsPendingError extends NackError {
    constructor() {
        super(42);
    }
}

export class I2cQueryMismatchError extends NackError {
    constructor() {
        super(43);
    }
}

export class I2cTimeoutSdaStuckError extends NackError {
    constructor() {
        super(44);
    }
}

export class I2cTimeoutSclStuckError extends NackError {
    constructor() {
        super(45);
    }
}

export class I2cTimeoutError extends NackError {
    constructor() {
        super(46);
    }
}
