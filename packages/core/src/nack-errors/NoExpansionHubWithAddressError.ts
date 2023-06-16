import { setPrototypeOf } from "./set-prototype.js";

export class NoExpansionHubWithAddressError extends Error {
    moduleAddress: number;
    serialNumber: string;
    constructor(serialNumber: string, moduleAddress: number) {
        super(
            `Unable to open hub with address ${moduleAddress} connected ` +
                `via parent hub with serial number ${serialNumber}`,
        );
        setPrototypeOf(this, NoExpansionHubWithAddressError.prototype);

        this.moduleAddress = moduleAddress;
        this.serialNumber = serialNumber;
    }
}
