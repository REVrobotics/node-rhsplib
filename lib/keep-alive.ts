import {RevHub} from "./RevHub.js";

export function startKeepAlive(hub: RevHub, interval: number): void {
    setInterval(async () => {
        console.log("Sending Keep Alive");
        await hub.sendKeepAlive();
    }, interval);
}
