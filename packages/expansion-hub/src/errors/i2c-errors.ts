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
        setPrototypeOf(this, I2cNoResultsPendingError.prototype);
    }
}

export class I2cQueryMismatchError extends NackError {
    constructor() {
        super(43);
        setPrototypeOf(this, I2cQueryMismatchError.prototype);
    }
}

export class I2cTimeoutSdaStuckError extends NackError {
    constructor() {
        super(44);
        setPrototypeOf(this, I2cTimeoutSdaStuckError.prototype);
    }
}

export class I2cTimeoutSclStuckError extends NackError {
    constructor() {
        super(45);
        setPrototypeOf(this, I2cTimeoutSclStuckError.prototype);
    }
}

export class I2cTimeoutError extends NackError {
    constructor() {
        super(46);
        setPrototypeOf(this, I2cTimeoutError.prototype);
    }
}
