import { NackError, setPrototypeOf } from "./NackError.js";

export class DigitalChannelNotConfiguredForOutputError extends NackError {
    digitalChannel: number;
    constructor(digitalChannel: number) {
        super(
            digitalChannel + 10,
            `digital channel ${digitalChannel} not configured for output`,
        );

        this.digitalChannel = digitalChannel;
        setPrototypeOf(this, DigitalChannelNotConfiguredForOutputError.prototype);
    }
}

export class NoDigitalChannelsConfiguredForOutputError extends NackError {
    constructor() {
        super(18, "No digital channels configured for output");
        setPrototypeOf(this, NoDigitalChannelsConfiguredForOutputError.prototype);
    }
}

export class DigitalChannelNotConfiguredForInputError extends NackError {
    digitalChannel: number;
    constructor(digitalChannel: number) {
        super(
            digitalChannel + 20,
            `digital channel ${digitalChannel} not configured for input`,
        );

        this.digitalChannel = digitalChannel;
        setPrototypeOf(this, DigitalChannelNotConfiguredForInputError.prototype);
    }
}

export class NoDigitalChannelsConfiguredForInputError extends NackError {
    constructor() {
        super(28, "No digital channels configured for input");
        setPrototypeOf(this, NoDigitalChannelsConfiguredForInputError.prototype);
    }
}
