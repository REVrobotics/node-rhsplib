import {ExpansionHub} from "@rev-robotics/expansion-hub";
import { VL53L0X } from "./drivers/vl53l0x";

export class DistanceSensor {
    constructor(hub: ExpansionHub, channel: number) {
        this.device = new VL53L0X(hub, channel);
    }

    private readonly device: VL53L0X
    private timer?: NodeJS.Timer

    async setup() {
        await this.device.setup();
    }

    async getDistanceMillimeters(): Promise<number> {
        return await this.device.getDistanceMillimeters();
    }

    startMeasuringDistance(onDistanceRecorded: (_: number) => void,
                           interval: number) {
        this.stop();
        this.timer = setInterval(async () => {
            let distance = await this.getDistanceMillimeters();
            onDistanceRecorded(distance);
        }, interval);
    }

    stop() {
        if(this.timer) {
            clearInterval(this.timer);
        }
    }
}