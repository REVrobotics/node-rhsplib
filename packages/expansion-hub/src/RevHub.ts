import {RevHubType} from "./RevHubType";

export interface RevHub {
    type: RevHubType

    on(eventName: "error", listener: (error: Error) => void): RevHub
}
