import { setPrototypeOf } from "./nack-errors/NackError.js";

export class UnableToOpenSerialError extends Error {
    constructor(serialPort: string) {
        super(`Unable to open serial port ${serialPort}`);

        setPrototypeOf(this, UnableToOpenSerialError.prototype);
    }
}

export class InvalidSerialArguments extends Error {
    constructor(serialPort: string) {
        super(`Invalid arguments for serial port ${serialPort}`);

        setPrototypeOf(this, InvalidSerialArguments.prototype);
    }
}

export class SerialConfigurationError extends Error {
    constructor(serialPort: string) {
        super(`Error configuring serial port ${serialPort}`);

        setPrototypeOf(this, SerialConfigurationError.prototype);
    }
}

export class SerialIoError extends Error {
    constructor(serialPort: string) {
        super(`IO Error on serial port ${serialPort}`);

        setPrototypeOf(this, SerialIoError.prototype);
    }
}
