import { ClosedLoopControlAlgorithm } from "./ClosedLoopControlAlgorithm.js";

export interface PidCoefficients {
    p: number;
    i: number;
    d: number;

    algorithm: ClosedLoopControlAlgorithm.Pid;
}
