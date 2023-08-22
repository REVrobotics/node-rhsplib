// These MUST be ordered so that their numeric values match the values specified in the REV Hub Serial Protocol spec
export enum MotorMode {
    /**
     * This mode controls the motor's speed by setting the PWM duty cycle.
     * It does not require an encoder.
     */
    OPEN_LOOP,
    /**
     * This mode uses the encoder to regulate the velocity of the motor.
     * This mode requires an encoder to be connected.
     */
    REGULATED_VELOCITY,
    /**
     * This mode uses an encoder to regulate the position of the motor.
     * This mode requires an encoder to be connected.
     */
    REGULATED_POSITION,
}
