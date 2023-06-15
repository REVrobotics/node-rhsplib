import { ExpansionHub, ParentExpansionHub } from "./ExpansionHub.js";
import { ParentRevHub } from "./RevHub.js";

export interface ControlHub extends ExpansionHub, ParentRevHub {
    addHubBySerialNumberAndAddress(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentExpansionHub>;
}
