import {RevHubType} from "./RevHubType";

export interface RevHub {
    type: RevHubType

    on(eventName: string | symbol, listener: (...args: any[]) => void): RevHub
}
