import { setPrototypeOf } from "./set-prototype-of.js";
import { RevHubError } from "./RevHubError.js";

export class UnableToOpenSerialError extends RevHubError {
    constructor(serialPort: string) {
        super(`Unable to open serial port ${serialPort}`);

        setPrototypeOf(this, UnableToOpenSerialError.prototype);
    }
}

export class InvalidSerialArguments extends RevHubError {
    constructor(serialPort: string) {
        super(`Invalid arguments for serial port ${serialPort}`);

        setPrototypeOf(this, InvalidSerialArguments.prototype);
    }
}

export class SerialConfigurationError extends RevHubError {
    constructor(serialPort: string) {
        super(`Error configuring serial port ${serialPort}`);

        setPrototypeOf(this, SerialConfigurationError.prototype);
    }
}

export class SerialIoError extends RevHubError {
    constructor(serialPort: string) {
        super(`IO Error on serial port ${serialPort}`);

        setPrototypeOf(this, SerialIoError.prototype);
    }
}

export class GeneralSerialError extends RevHubError {
    serialNumber: string;
    constructor(serialNumber: string) {
        super(`Serial Port Error for ${serialNumber}`);

        this.serialNumber = serialNumber;
        setPrototypeOf(this, GeneralSerialError.prototype);
    }
}
