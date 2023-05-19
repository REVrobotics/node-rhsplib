import {RevHubType} from "./RevHubType";
import {ExpansionHub} from "./ExpansionHub";

export interface RevHub {
    readonly moduleAddress: number
    type: RevHubType;

    isParent(): this is ParentRevHub;
    isExpansionHub(): this is ExpansionHub;

    /**
     * Listen for errors that do not happen as a result of a specific function call
     *
     * @param eventName
     * @param listener
     */
    on(eventName: "error", listener: (error: Error) => void): RevHub
}

export interface ParentRevHub extends RevHub {
    readonly children: ReadonlyArray<RevHub>;
    readonly serialNumber: string

    addChild(hub: RevHub): void;
    addChildByAddress(moduleAddress: number): Promise<RevHub>;
}
