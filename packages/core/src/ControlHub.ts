import { ExpansionHub } from "./ExpansionHub.js";
import { ParentRevHub } from "./RevHub.js";

export interface ControlHub extends ExpansionHub, ParentRevHub {
    addHubBySerialNumberAndAddress(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentRevHub>;
}
