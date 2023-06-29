import { AngularVelocity } from "./AngularVelocity.js";
import { Quaternion } from "./Quaternion.js";

export class ImuData {
    angularVelocity: AngularVelocity;
    quaternion: Quaternion;

    constructor(angularVelocity: AngularVelocity, quaternion: Quaternion) {
        this.angularVelocity = angularVelocity;
        this.quaternion = quaternion;
    }
}
