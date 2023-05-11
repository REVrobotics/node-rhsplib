import {RevHubType} from "./RevHubType";

export interface RevHub {
    type: RevHubType

    on(eventName: "error", listener: (...args: any[]) => void): RevHub
}
