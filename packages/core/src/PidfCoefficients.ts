import { ClosedLoopControlAlgorithm } from "./ClosedLoopControlAlgorithm.js";

export interface PidfCoefficients {
    p: number;
    i: number;
    d: number;
    f: number;

    algorithm: ClosedLoopControlAlgorithm.Pidf;
}
