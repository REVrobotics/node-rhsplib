import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function injectLog(hub: ExpansionHub, hint: string) {
    await hub.injectDataLogHint(hint);
    hub.close();
}
