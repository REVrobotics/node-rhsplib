import {NackError, setPrototypeOf} from "./NackError.js";

export class GpioNotConfiguredForOutputError extends NackError {
    gpioIndex: number;
    constructor(gpioIndex: number) {
        super(gpioIndex+10, `GPIO ${gpioIndex} not configured for output`);

        this.gpioIndex = gpioIndex;
        setPrototypeOf(this, GpioNotConfiguredForOutputError.prototype);
    }
}

export class NoGpioPinsConfiguredForOutputError extends NackError {
    constructor() {
        super(18, "No GPIO pins configured for output");
        setPrototypeOf(this, NoGpioPinsConfiguredForOutputError.prototype);
    }
}

export class GpioNotConfiguredForInputError extends NackError {
    gpioIndex: number;
    constructor(gpioIndex: number) {
        super(gpioIndex+20, `GPIO ${gpioIndex} not configured for input`);

        this.gpioIndex = gpioIndex;
        setPrototypeOf(this, GpioNotConfiguredForInputError.prototype);
    }
}

export class NoGpioPinsConfiguredForInputError extends NackError {
    constructor() {
        super(28, "No GPIO pins configured for input");
        setPrototypeOf(this, NoGpioPinsConfiguredForInputError.prototype);
    }
}
