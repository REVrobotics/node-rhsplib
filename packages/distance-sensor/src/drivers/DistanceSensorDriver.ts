export interface DistanceSensorDriver {
    getDistanceMillimeters(): Promise<number>;
    setup(): Promise<void>;
}
