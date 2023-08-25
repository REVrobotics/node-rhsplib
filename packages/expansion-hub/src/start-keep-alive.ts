import { ExpansionHubInternal } from "./internal/ExpansionHub.js";
import { convertErrorPromise } from "./internal/error-conversion.js";

/**
 * Starts a keep alive task for a given hub.
 * @param hub hub to start the keep alive for
 * @param intervalMs interval in ms between each keep alive
 */
export function startKeepAlive(hub: ExpansionHubInternal, intervalMs: number) {
    if (hub.keepAliveTimer) {
        //stop existing keep alive timer, so we can start a new one.
        clearInterval(hub.keepAliveTimer);
    }
    hub.keepAliveTimer = setInterval(() => {
        convertErrorPromise(hub.serialNumber, async (): Promise<void> => {
            await hub.sendKeepAlive();
        }).catch((e: any) => {
            hub.emitError(e);
        });
    }, intervalMs);
}
