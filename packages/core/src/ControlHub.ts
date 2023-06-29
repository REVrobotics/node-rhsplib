import { ExpansionHub } from "./ExpansionHub.js";
import { ParentRevHub } from "./RevHub.js";

export interface ControlHub extends ExpansionHub, ParentRevHub {
    addUsbConnectedHub(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentRevHub>;
}
