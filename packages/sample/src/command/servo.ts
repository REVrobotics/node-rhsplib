import { openUsbControlHubsAndChildren } from "@rev-robotics/control-hub";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function runServo(channel: number, pulseWidth: number, framePeriod: number) {
    console.log("Opening hubs");
    const hubs = await openUsbControlHubsAndChildren();
    console.log("Hubs opened");
    let hub: ExpansionHub = hubs[0].children[1] as ExpansionHub;
    console.log(`Got hub: ${hub}`);

    await hub.setServoConfiguration(channel, framePeriod);
    await hub.setServoPulseWidth(channel, pulseWidth);
    await hub.setServoEnable(channel, true);

    console.log("Finished sending commands");

    setTimeout(() => {
        hub.close();
    }, 10000);
}
