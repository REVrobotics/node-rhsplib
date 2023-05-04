import {NackError} from "./NackError.js";

export class GpioNotConfiguredForOutputError extends NackError {
    gpioIndex: number;
    constructor(gpioIndex: number) {
        super(gpioIndex-10);

        this.gpioIndex = gpioIndex;
    }
}

export class NoGpioPinsConfiguredForOutputError extends NackError {
    constructor() {
        super(18);
    }
}

export class GpioNotConfiguredForInputError extends NackError {
    gpioIndex: number;
    constructor(gpioIndex: number) {
        super(gpioIndex-20);

        this.gpioIndex = gpioIndex;
    }
}

export class NoGpioPinsConfiguredForInputError extends NackError {
    constructor() {
        super(28);
    }
}
