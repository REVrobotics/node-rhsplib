import { DistanceSensor } from "@rev-robotics/distance-sensor";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function distance(
    hub: ExpansionHub,
    channel: number,
    isContinuous: boolean,
) {
    console.log(`Channel number is ${channel}`);

    let sensor = new DistanceSensor(hub, channel);
    await sensor.setup();

    if (isContinuous) {
        sensor.startMeasuringDistance((distance: number) => {
            console.log(`Distance is ${distance}mm`);
        }, 10);
    } else {
        let distance = await sensor.getDistanceMillimeters();
        console.log(`Distance is ${distance}mm`);

        sensor.stop();
    }
}
