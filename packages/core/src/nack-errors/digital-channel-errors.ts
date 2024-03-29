import { setPrototypeOf } from "../general-errors/set-prototype-of.js";
import { NackError } from "./NackError.js";
import { NackCode } from "./NackCode.js";

export class DigitalChannelNotConfiguredForOutputError extends NackError {
    digitalChannel: number;
    constructor(nackCode: number) {
        super(
            nackCode,
            `digital channel ${
                nackCode - NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_START
            } not configured for output`,
        );

        this.digitalChannel =
            nackCode - NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_OUTPUT_START;
        setPrototypeOf(this, DigitalChannelNotConfiguredForOutputError.prototype);
    }
}

export class NoDigitalChannelsConfiguredForOutputError extends NackError {
    constructor() {
        super(
            NackCode.NO_DIGITAL_CHANNELS_CONFIGURED_FOR_OUTPUT,
            "No digital channels configured for output",
        );
        setPrototypeOf(this, NoDigitalChannelsConfiguredForOutputError.prototype);
    }
}

export class DigitalChannelNotConfiguredForInputError extends NackError {
    digitalChannel: number;
    constructor(nackCode: number) {
        super(
            nackCode,
            `digital channel ${
                nackCode - NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_START
            } not configured for input`,
        );

        this.digitalChannel =
            nackCode - NackCode.DIGITAL_CHANNEL_NOT_CONFIGURED_FOR_INPUT_START;
        setPrototypeOf(this, DigitalChannelNotConfiguredForInputError.prototype);
    }
}

export class NoDigitalChannelsConfiguredForInputError extends NackError {
    constructor() {
        super(
            NackCode.NO_DIGITAL_CHANNELS_CONFIGURED_FOR_INPUT,
            "No digital channels configured for input",
        );
        setPrototypeOf(this, NoDigitalChannelsConfiguredForInputError.prototype);
    }
}
