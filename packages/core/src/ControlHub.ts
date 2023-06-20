import { ExpansionHub, ParentExpansionHub } from "./ExpansionHub.js";
import { ParentRevHub } from "./RevHub.js";
import { ModuleStatus } from "./ModuleStatus.js";

export interface ControlHub extends ExpansionHub, ParentRevHub {
    on(eventName: "error", listener: (error: Error) => void): this;
    on(eventName: "statusChanged", listener: (status: ModuleStatus) => void): this;
    on(
        eventName: "addressChanged",
        listener: (oldAddress: number, newAddress: number) => void,
    ): this;
    on(eventName: "sessionEnded", listener: () => void): this;

    addHubBySerialNumberAndAddress(
        serialNumber: string,
        moduleAddress: number,
    ): Promise<ParentExpansionHub>;
}
