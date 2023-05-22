import { openConnectedExpansionHubs } from "@rev-robotics/expansion-hub";
import { DistanceSensor } from "@rev-robotics/distance-sensor";

export async function distance(channel: number) {
    console.log(`Channel number is ${channel}`);

    let hubs = await openConnectedExpansionHubs();
    let hub = hubs[0];

    let sensor = new DistanceSensor(hub, channel);
    await sensor.setup();

    sensor.startMeasuringDistance((distance) => {
        console.log(`Distance is ${distance}mm`);
    }, 1000);

    setTimeout(async () => {
        sensor.stop();
        hub.close();
    }, 20000);
}
