import {NackError, setPrototypeOf} from "./NackError.js";

export class ParameterOutOfRangeError extends NackError {
    parameterIndex: number;
    constructor(parameterIndex: number) {
        super(parameterIndex, `Parameter ${parameterIndex} is out of range`);

        this.parameterIndex = parameterIndex;
        setPrototypeOf(this, ParameterOutOfRangeError.prototype);
    }
}
