import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import { VL53L0X } from "./drivers/vl53l0x.js";
import { DistanceSensorDriver } from "./drivers/DistanceSensorDriver.js";

export class DistanceSensor {
    /**
     *
     * @param hub the ExpansionHub or ControlHub that this sensor is physically
     * connected to.
     * @param channel the I2C channel this sensor is plugged into.
     */
    constructor(hub: ExpansionHub, channel: number) {
        this.device = new VL53L0X(hub, channel);
    }

    private readonly device: DistanceSensorDriver;
    private timer?: NodeJS.Timer;
    private isInitialized = false;

    /**
     * Initializes the device
     */
    async setup() {
        await this.device.setup();
        this.isInitialized = true;
    }

    /**
     * Measure the current distance in millimeters.
     */
    async getDistanceMillimeters(): Promise<number> {
        if (!this.isInitialized) {
            throw new Error(
                "Distance Sensor is not initialized. Please call setup() first.",
            );
        }
        return await this.device.getDistanceMillimeters();
    }

    /**
     * Begin recording distance continuously.
     * @param onDistanceRecorded callback for when a distance is measured in mm.
     * @param interval interval at which to start measurement.
     */
    startMeasuringDistance(
        onDistanceRecorded: (millimeters: number) => void,
        interval: number,
    ) {
        if (!this.isInitialized) {
            throw new Error(
                "Distance Sensor is not initialized. Please call setup() first.",
            );
        }
        this.stop();
        this.timer = setInterval(async () => {
            let distance = await this.getDistanceMillimeters();
            onDistanceRecorded(distance);
        }, interval);
    }

    /**
     * Stops calling the measurement callback if one is defined.
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
