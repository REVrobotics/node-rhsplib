import {RevHub} from "./RevHub";

/**
 * Starts a keep alive task for a given hub.
 * @param hub hub to start the keep alive for
 * @param interval interval in ms between each keep alive
 */
export function startKeepAlive(hub: RevHub, interval: number) {
    if(hub.keepAliveTimer) {
        //stop existing keep alive timer, so we can start a new one.
        clearInterval(hub.keepAliveTimer);
    }
    hub.keepAliveTimer = setInterval(async () => {
        await hub.sendKeepAlive();
    }, interval);
}
