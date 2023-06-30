import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import { runServo } from "./servo.js";

export async function sendFailSafe(hub: ExpansionHub, close: () => void): Promise<void> {
    await runServo(hub, 0, 1000, 4000);

    setTimeout(() => {
        hub.sendFailSafe();
        setTimeout(() => {
            close();
        }, 2000);
    }, 2000);
}
