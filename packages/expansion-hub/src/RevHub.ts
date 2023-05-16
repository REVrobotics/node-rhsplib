import {RevHubType} from "./RevHubType";
import {ExpansionHub} from "./ExpansionHub";

export interface RevHub {
    type: RevHubType;
    isParent(): this is ParentRevHub;
    isExpansionHub(): this is ExpansionHub;

    readonly moduleAddress: number

    /**
     * Listen for errors that do not happen as a result of a specific function call
     *
     * @param eventName
     * @param listener
     */
    on(eventName: "error", listener: (error: Error) => void): RevHub
}

export interface ParentRevHub extends RevHub {
    getChildren(): ReadonlyArray<RevHub>;
    addChildByAddress(moduleAddress: number): Promise<RevHub>;

    readonly serialNumber: string
}
