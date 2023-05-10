import {RevHubType} from "./RevHubType";
import {ExpansionHub} from "./ExpansionHub";

export interface RevHub {
    type: RevHubType;
    isParent(): this is ParentRevHub;
    isExpansionHub(): this is ExpansionHub;
}

export interface ParentRevHub extends RevHub {
    getChildren(): ReadonlyArray<RevHub>;
    addChild(hub: RevHub): void

    serialNumber: string
}
