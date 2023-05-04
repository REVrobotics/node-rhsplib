import {NackError} from "./NackError.js";

export class ParameterOutOfRangeError extends NackError {
    parameterIndex: number;
    constructor(parameterIndex: number) {
        super(parameterIndex);

        this.parameterIndex = parameterIndex;
    }
}
