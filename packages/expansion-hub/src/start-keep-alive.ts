import {ExpansionHubInternal} from "./internal/ExpansionHub";

/**
 * Starts a keep alive task for a given hub.
 * @param hub hub to start the keep alive for
 * @param interval interval in ms between each keep alive
 */
export function startKeepAlive(hub: ExpansionHubInternal, interval: number) {
    if(hub.keepAliveTimer) {
        //stop existing keep alive timer, so we can start a new one.
        clearInterval(hub.keepAliveTimer);
    }
    hub.keepAliveTimer = setInterval(() => {
        hub.sendKeepAlive().catch((e: any) => {
            hub.emitter.emit("error", e);
        });
    }, interval);
}
