import { openUsbControlHubsAndChildren } from "@rev-robotics/control-hub";

export async function runServo(channel: number, pulseWidth: number, framePeriod: number) {
    const hubs = await openUsbControlHubsAndChildren();

    for (let hub of hubs) {
        await hub.setServoConfiguration(channel, framePeriod);
        await hub.setServoPulseWidth(channel, pulseWidth);
        await hub.setServoEnable(channel, true);

        setTimeout(() => {
            hub.close();
        }, 10000);
    }
}
