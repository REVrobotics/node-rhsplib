import { NackError, setPrototypeOf } from "./NackError.js";

export class ParameterOutOfRangeError extends NackError {
    /**
     * Index of the parameter that is out of range. Zero-indexed
     */
    parameterIndex: number;

    constructor(parameterIndex: number) {
        super(parameterIndex, `Parameter ${parameterIndex} is out of range`);

        this.parameterIndex = parameterIndex;
        setPrototypeOf(this, ParameterOutOfRangeError.prototype);
    }
}
