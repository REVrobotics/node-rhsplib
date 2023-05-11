import {RevHubType} from "./RevHubType";

export interface RevHub {
    type: RevHubType

    /**
     * Listen for errors that do not happen as a result of a specific function call
     *
     * @param eventName
     * @param listener
     */
    on(eventName: "error", listener: (error: Error) => void): RevHub
}
