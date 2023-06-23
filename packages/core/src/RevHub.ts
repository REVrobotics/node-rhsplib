import { RevHubType } from "./RevHubType.js";
import { ExpansionHub } from "./ExpansionHub.js";
import { ControlHub } from "./ControlHub.js";

export interface RevHub {
    readonly moduleAddress: number;
    type: RevHubType;

    isParent(): this is ParentRevHub;
    isExpansionHub(): this is ExpansionHub;
    isControlHub(): this is ControlHub;

    /**
     * Listen for errors that do not happen as a result of a specific function call
     *
     * @param eventName
     * @param listener
     */
    on(eventName: "error", listener: (error: Error) => void): RevHub;
}

export interface ParentRevHub extends RevHub {
    readonly children: ReadonlyArray<RevHub>;
    readonly serialNumber: string;

    addChildByAddress(moduleAddress: number): Promise<RevHub>;
}
