export interface BulkInputData {
    digitalInputs: number;
    motor0position_enc: number;
    motor1position_enc: number;
    motor2position_enc: number;
    motor3position_enc: number;
    motorStatus: number;
    motor0velocity_cps: number;
    motor1velocity_cps: number;
    motor2velocity_cps: number;
    motor3velocity_cps: number;
    analog0_mV: number;
    analog1_mV: number;
    analog2_mV: number;
    analog3_mV: number;
    attentionRequired: number;
}
