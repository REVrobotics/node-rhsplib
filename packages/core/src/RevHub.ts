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
    close(): void;
}

export interface ParentRevHub extends RevHub {
    /**
     * This only contains directly-connected children (all devices in an RS-485
     * daisy chain count as directly-connected). If any devices in this array
     * are themselves parents (call {@link RevHub.isParent}), their children
     * will not be included, and you will need to access their
     * {@link ParentRevHub.children} property.
     */
    readonly children: ReadonlyArray<RevHub>;
    readonly serialNumber: string;

    addChildByAddress(moduleAddress: number): Promise<RevHub>;
}
