import {RevHubError} from "./RevHubError";

export const {
    setPrototypeOf = function (obj: any, proto: any) {
        obj.__proto__ = proto;
        return obj;
    },
} = Object;

export class NackError extends RevHubError {
    nackCode: number;
    constructor(nackCode: number, message: string = "Nack Error") {
        super(message);

        this.nackCode = nackCode;
        setPrototypeOf(this, NackError.prototype);
    }
}
