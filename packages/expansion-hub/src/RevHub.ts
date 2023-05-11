import {RevHubType} from "./RevHubType";
import {ExpansionHub} from "./ExpansionHub";

export interface RevHub {
    type: RevHubType;
    isParent(): this is ParentRevHub;
    isExpansionHub(): this is ExpansionHub;

    readonly moduleAddress: number
}

export interface ParentRevHub extends RevHub {
    getChildren(): ReadonlyArray<RevHub>;
    addChild(hub: RevHub): void;
    addChildByAddress(moduleAddress: number): Promise<RevHub>;

    readonly serialNumber: string
}
