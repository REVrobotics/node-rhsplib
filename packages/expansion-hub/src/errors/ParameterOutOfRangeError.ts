import { NackError, setPrototypeOf } from "./NackError.js";

export class ParameterOutOfRangeError extends NackError {
    /**
     * Index of the parameter that is out of range. Zero-indexed
     */
    parameterIndex: number;

    constructor(nackCode: number) {
        super(nackCode, `Parameter ${nackCode} is out of range`);

        this.parameterIndex = nackCode;
        setPrototypeOf(this, ParameterOutOfRangeError.prototype);
    }
}
