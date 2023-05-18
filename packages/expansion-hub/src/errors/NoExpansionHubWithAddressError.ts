import {setPrototypeOf} from "./NackError";

export class NoExpansionHubWithAddressError extends Error {
    moduleAddress: number;
    constructor(moduleAddress: number) {
        super(`Unable to open hub with address ${moduleAddress}}`);
        setPrototypeOf(this, NoExpansionHubWithAddressError.prototype);

        this.moduleAddress = moduleAddress;
    }
}
