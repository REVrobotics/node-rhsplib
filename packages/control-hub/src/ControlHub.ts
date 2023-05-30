import { ExpansionHub, ParentRevHub } from "@rev-robotics/expansion-hub";

export interface ParentControlHub extends ParentRevHub, ControlHub {
    readonly serialNumber: string;
}

export interface ControlHub extends ExpansionHub {}
