import { ExpansionHub } from "@rev-robotics/rev-hub-core";
import * as register from "../registers.js";
import { SYSTEM_SEQUENCE_CONFIG } from "../registers.js";
import {
    readRegister,
    readRegisterMultipleBytes,
    readShort,
    writeInt,
    writeRegister,
    writeRegisterMultipleBytes,
    writeShort,
} from "../i2c-utils.js";
import { DistanceSensorDriver } from "./DistanceSensorDriver.js";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export class VL53L0X implements DistanceSensorDriver {
    constructor(hub: ExpansionHub, channel: number) {
        this.hub = hub;
        this.channel = channel;
    }

    async setup(): Promise<void> {
        if (!(await this.is2mDistanceSensor())) {
            throw new Error(
                `I2C device on channel ${this.channel} is not a ` +
                    `valid 2m Distance sensor`,
            );
        }

        await this.initialize();
    }

    private readonly hub: ExpansionHub;
    private readonly channel: number;
    private address: number = 0x52 / 2;
    private spadCount = 0;
    private spadTypeIsAperture = false;
    private stopValue = 0;

    /**
     * This will zero out the sensor's stored stop variable for as long as
     * it's powered on. This {@link DistanceSensor} will have cached the stop
     * value as part of initialization, but no new {@link DistanceSensor}
     * instances will be able to initialize until the physical sensor is power
     * cycled.
     */
    async close() {
        await this.writeRegister(register.SYS_RANGE_START, 0x01); // VL53L0X_REG_SYSRANGE_MODE_SINGLESHOT

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);
        await this.writeRegister(0x91, 0x00);
        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xff, 0x00);
    }

    async is2mDistanceSensor(): Promise<boolean> {
        try {
            if ((await this.readRegister(0xc0)) != 0xee) return false;
            if ((await this.readRegister(0xc1)) != 0xaa) return false;
            if ((await this.readRegister(0xc2)) != 0x10) return false;
            if ((await this.readRegister(0x61)) != 0x00) return false;
            else return true;
        } catch {
            //if there's an I2C error, we don't have a working sensor.
            return false;
        }
    }

    async getDistanceMillimeters(): Promise<number> {
        try {
            let range = await this.readShort(register.RESULT_RANGE_STATUS + 10);
            await this.writeRegister(register.SYSTEM_INTERRUPT_CLEAR, 0x01);

            return range;
        } catch (e) {
            console.log("Got error:");
            console.log(e);
        }
        return -1;
    }

    async initData() {
        await this.writeRegister(0x88, 0x00);

        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);

        this.stopValue = await this.readRegister(0x91);

        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);
    }

    async loadTuningSettings() {
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x09, 0x00);
        await this.writeRegister(0x10, 0x00);
        await this.writeRegister(0x11, 0x00);

        await this.writeRegister(0x24, 0x01);
        await this.writeRegister(0x25, 0xff);
        await this.writeRegister(0x75, 0x00);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x4e, 0x2c);
        await this.writeRegister(0x48, 0x00);
        await this.writeRegister(0x30, 0x20);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x30, 0x09);
        await this.writeRegister(0x54, 0x00);
        await this.writeRegister(0x31, 0x04);
        await this.writeRegister(0x32, 0x03);
        await this.writeRegister(0x40, 0x83);
        await this.writeRegister(0x46, 0x25);
        await this.writeRegister(0x60, 0x00);
        await this.writeRegister(0x27, 0x00);
        await this.writeRegister(0x50, 0x06);
        await this.writeRegister(0x51, 0x00);
        await this.writeRegister(0x52, 0x96);
        await this.writeRegister(0x56, 0x08);
        await this.writeRegister(0x57, 0x30);
        await this.writeRegister(0x61, 0x00);
        await this.writeRegister(0x62, 0x00);
        await this.writeRegister(0x64, 0x00);
        await this.writeRegister(0x65, 0x00);
        await this.writeRegister(0x66, 0xa0);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x22, 0x32);
        await this.writeRegister(0x47, 0x14);
        await this.writeRegister(0x49, 0xff);
        await this.writeRegister(0x4a, 0x00);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x7a, 0x0a);
        await this.writeRegister(0x7b, 0x00);
        await this.writeRegister(0x78, 0x21);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x23, 0x34);
        await this.writeRegister(0x42, 0x00);
        await this.writeRegister(0x44, 0xff);
        await this.writeRegister(0x45, 0x26);
        await this.writeRegister(0x46, 0x05);
        await this.writeRegister(0x40, 0x40);
        await this.writeRegister(0x0e, 0x06);
        await this.writeRegister(0x20, 0x1a);
        await this.writeRegister(0x43, 0x40);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x34, 0x03);
        await this.writeRegister(0x35, 0x44);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x31, 0x04);
        await this.writeRegister(0x4b, 0x09);
        await this.writeRegister(0x4c, 0x05);
        await this.writeRegister(0x4d, 0x04);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x44, 0x00);
        await this.writeRegister(0x45, 0x20);
        await this.writeRegister(0x47, 0x08);
        await this.writeRegister(0x48, 0x28);
        await this.writeRegister(0x67, 0x00);
        await this.writeRegister(0x70, 0x04);
        await this.writeRegister(0x71, 0x01);
        await this.writeRegister(0x72, 0xfe);
        await this.writeRegister(0x76, 0x00);
        await this.writeRegister(0x77, 0x00);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x0d, 0x01);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0x01, 0xf8);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x8e, 0x01);
        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);
    }

    private async initialize() {
        //set I2C standard mode
        await this.initData();

        let msgConfigControl =
            (await this.readRegister(register.MSRC_CONFIG_CONTROL)) | 0x12;
        await this.writeRegister(register.MSRC_CONFIG_CONTROL, msgConfigControl);

        await this.setSignalRateLimit(0.25);

        await this.writeRegister(register.SYSTEM_SEQUENCE_CONFIG, 0xff);

        await this.getSpadInfo();

        let refSpadMap = await this.readMultipleBytes(
            register.GLOBAL_CONFIG_SPAD_ENABLES_REF_0,
            6,
        );

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(register.DYNAMIC_SPAD_REF_EN_START_OFFSET, 0x00);
        await this.writeRegister(register.DYNAMIC_SPAD_NUM_REQUESTED_REF_SPAD, 0x2c);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(register.GLOBAL_CONFIG_REF_EN_START_SELECT, 0xb4);

        let firstSpadToEnable = this.spadTypeIsAperture ? 12 : 0;
        let spadsEnabled = 0;

        for (let i = 0; i < 48; i++) {
            let mapIndex = Math.floor(i / 8);
            if (i < firstSpadToEnable || spadsEnabled == this.spadCount) {
                refSpadMap[mapIndex] &= ~(1 << i % 8); //disable this spad.
            } else if (((refSpadMap[mapIndex] >> i % 8) & 0x1) != 0) {
                spadsEnabled++;
            }
        }

        await this.writeMultipleBytes(
            register.GLOBAL_CONFIG_SPAD_ENABLES_REF_0,
            refSpadMap,
        );

        await this.loadTuningSettings();

        await this.writeRegister(register.SYSTEM_INTERRUPT_CONFIG_GPIO, 0x04);
        await this.writeRegister(
            register.GPIO_HV_MUX_ACTIVE_HIGH,
            (await this.readRegister(register.GPIO_HV_MUX_ACTIVE_HIGH)) & ~0x10,
        ); //active low
        await this.writeRegister(register.SYSTEM_INTERRUPT_CLEAR, 0x01);

        //Commented this code out because the sensor doesn't correctly output
        //if we set the timing measurement budget.
        // let measurementTimingBudget = await this.getMeasurementTimingBudget();
        // console.log(`Timing budget: ${measurementTimingBudget}`);

        await this.writeRegister(register.SYSTEM_SEQUENCE_CONFIG, 0xe8);

        //set measurement timing budget
        // await this.setMeasurementTimingBudget(measurementTimingBudget);

        await this.writeRegister(register.SYSTEM_SEQUENCE_CONFIG, 0x01);
        if (!(await this.performCalibration(0x40))) return false;

        await this.writeRegister(register.SYSTEM_SEQUENCE_CONFIG, 0x02);
        if (!(await this.performCalibration(0x00))) return false;

        //Restore previous config
        await this.writeRegister(register.SYSTEM_SEQUENCE_CONFIG, 0xe8);

        await this.startContinuous(0);
    }

    private async startContinuous(periodMs: number = 0) {
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);
        await this.writeRegister(0x91, this.stopValue);
        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);

        if (periodMs != 0) {
            let calibrateValue = await this.readShort(0xf8);
            if (calibrateValue != 0) {
                periodMs *= calibrateValue;
            }

            await this.writeInt(0x04, periodMs);
            await this.writeRegister(register.SYS_RANGE_START, 0x04);
        } else {
            await this.writeRegister(register.SYS_RANGE_START, 0x02);
        }
    }

    private async performCalibration(input: number): Promise<boolean> {
        await this.writeRegister(register.SYS_RANGE_START, 0x01 | input);

        await this.writeRegister(0x0b, 0x01);
        await this.writeRegister(register.SYS_RANGE_START, 0x00);

        return true;
    }

    private async setMeasurementTimingBudget(budget: number): Promise<boolean> {
        if (budget < 20000) return false;

        let usedBudget = 1320 + 960;

        let enables = await this.getSequenceStepEnables();
        let timeouts = await this.getSequenceStepTimeouts(enables);

        if (enables.tcc) {
            usedBudget += timeouts.msrc_dss_tcc_us + 590;
        }

        if (enables.dss) {
            usedBudget += 2 * (timeouts.msrc_dss_tcc_us + 690);
        } else if (enables.msrc) {
            usedBudget += timeouts.msrc_dss_tcc_us + 660;
        }

        if (enables.pre_range) {
            usedBudget += timeouts.pre_range_us + 660;
        }

        if (enables.final_range) {
            usedBudget += 550;

            if (usedBudget > budget) return false;

            let finalTimeout = budget - usedBudget;

            let finalTimeoutMclks = this.timeoutMclksToMicroseconds(
                finalTimeout,
                timeouts.final_range_vcsel_period_pclks,
            );

            if (enables.pre_range) {
                finalTimeoutMclks += timeouts.pre_range_mclks;
            }

            await this.writeShort(
                register.FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI,
                this.encodeTimeout(finalTimeoutMclks),
            );
        }

        return true;
    }

    private async getMeasurementTimingBudget(): Promise<number> {
        let budget = 1910 + 960;

        let enables = await this.getSequenceStepEnables();
        let timeouts = await this.getSequenceStepTimeouts(enables);

        if (enables.tcc) {
            budget += timeouts.msrc_dss_tcc_us + 590;
        }

        if (enables.dss) {
            budget += 2 * (timeouts.msrc_dss_tcc_us + 690);
        } else if (enables.msrc) {
            budget += timeouts.msrc_dss_tcc_us + 660;
        }

        if (enables.pre_range) {
            budget += timeouts.pre_range_us + 660;
        }

        if (enables.final_range) {
            budget += timeouts.final_range_us + 550;
        }

        return budget;
    }

    private async getSequenceStepTimeouts(
        enables: SequenceStepEnables,
    ): Promise<SequenceStepTimeouts> {
        let result = new SequenceStepTimeouts();
        result.pre_range_vcsel_period_pclks = this.decodeVcselPeriod(
            await this.readRegister(register.PRE_RANGE_CONFIG_VCSEL_PERIOD),
        );

        result.msrc_dss_tcc_mclks =
            (await this.readRegister(register.MSRC_CONFIG_TIMEOUT_MACROP)) + 1;
        result.msrc_dss_tcc_us = this.timeoutMclksToMicroseconds(
            result.msrc_dss_tcc_mclks,
            result.pre_range_vcsel_period_pclks,
        );

        result.pre_range_mclks = this.decodeTimeout(
            await this.readShort(register.PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI),
        );
        result.pre_range_us = this.timeoutMclksToMicroseconds(
            result.pre_range_mclks,
            result.pre_range_vcsel_period_pclks,
        );

        result.final_range_vcsel_period_pclks = this.decodeVcselPeriod(
            await this.readRegister(register.FINAL_RANGE_CONFIG_VCSEL_PERIOD),
        );

        result.final_range_mclks = this.decodeTimeout(
            await this.readShort(register.FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI),
        );

        if (enables.pre_range) {
            result.final_range_mclks -= result.pre_range_mclks;
        }

        result.final_range_us = this.timeoutMclksToMicroseconds(
            result.final_range_mclks,
            result.final_range_vcsel_period_pclks,
        );
        return result;
    }

    private encodeTimeout(mclks: number): number {
        if (mclks > 0) {
            let leastSignificantByte = mclks - 1;
            let mostSignificantByte = 0;

            while ((leastSignificantByte & 0xffffff00) > 0) {
                leastSignificantByte >>= 1;
                mostSignificantByte++;
            }

            return (mostSignificantByte << 8) | (leastSignificantByte & 0xff);
        } else {
            return 0;
        }
    }

    private decodeTimeout(value: number): number {
        return ((value & 0x00ff) << ((value & 0xff00) >> 8)) + 1;
    }

    private decodeVcselPeriod(value: number) {
        return (value + 1) << 1;
    }

    private timeoutMclksToMicroseconds(
        timeout_period_mclks: number,
        vcsel_period_pclks: number,
    ): number {
        let macroPeriod = this.calcMacroPeriod(vcsel_period_pclks);

        return (timeout_period_mclks * macroPeriod + macroPeriod / 2) / 1000;
    }

    private calcMacroPeriod(vcsel_period_pclks: number): number {
        return (2304 * vcsel_period_pclks * 1655 + 500) / 1000;
    }

    private async getSequenceStepEnables(): Promise<SequenceStepEnables> {
        let result = new SequenceStepEnables();

        let sequenceConfig = await this.readRegister(SYSTEM_SEQUENCE_CONFIG);

        result.tcc = ((sequenceConfig >> 4) & 0x1) != 0;
        result.dss = ((sequenceConfig >> 3) & 0x1) != 0;
        result.msrc = ((sequenceConfig >> 2) & 0x1) != 0;
        result.pre_range = ((sequenceConfig >> 6) & 0x1) != 0;
        result.final_range = ((sequenceConfig >> 7) & 0x1) != 0;

        return result;
    }

    private async setSignalRateLimit(mcps: number): Promise<void> {
        await this.writeShort(
            register.FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT,
            mcps * (1 << 7),
        );
    }

    private async getSignalRateLimit(): Promise<number> {
        return (
            (await this.readShort(register.FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT)) /
            (1 << 7)
        );
    }

    // Get reference SPAD (single photon avalanche diode) count and type
    // based on VL53L0X_get_info_from_device()
    private async getSpadInfo() {
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);

        await this.writeRegister(0xff, 0x06);
        await this.writeRegister(0x83, (await this.readRegister(0x83)) | 0x04);
        await this.writeRegister(0xff, 0x07);
        await this.writeRegister(0x81, 0x01);

        await this.writeRegister(0x80, 0x01);

        await this.writeRegister(0x94, 0x6b);
        await this.writeRegister(0x83, 0x00);

        //wait for the device to be ready
        while ((await this.readRegister(0x83)) == 0);

        await this.writeRegister(0x83, 0x01);
        let tmp = await this.readRegister(0x92);

        this.spadCount = tmp & 0x7f;
        this.spadTypeIsAperture = ((tmp >> 7) & 0x01) != 0;

        await this.writeRegister(0x81, 0x00);
        await this.writeRegister(0xff, 0x06);
        let value = await this.readRegister(0x83);
        await this.writeRegister(0x83, value & 0xfb);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x01);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);
    }

    private async readRegister(register: number): Promise<number> {
        return await readRegister(this.hub, this.channel, this.address, register);
    }

    private async readMultipleBytes(register: number, n: number): Promise<number[]> {
        return await readRegisterMultipleBytes(
            this.hub,
            this.channel,
            this.address,
            register,
            n,
        );
    }

    private async writeMultipleBytes(register: number, values: number[]): Promise<void> {
        return await writeRegisterMultipleBytes(
            this.hub,
            this.channel,
            this.address,
            register,
            values,
        );
    }

    private async writeRegister(register: number, value: number) {
        await writeRegister(this.hub, this.channel, this.address, register, value);
    }

    private async writeShort(register: number, value: number) {
        await writeShort(this.hub, this.channel, this.address, register, value);
    }

    private async readShort(register: number): Promise<number> {
        return await readShort(this.hub, this.channel, this.address, register);
    }

    private async writeInt(register: number, value: number) {
        await writeInt(this.hub, this.channel, this.address, register, value);
    }
}

class SequenceStepEnables {
    tcc = false;
    msrc = false;
    dss = false;
    pre_range = false;
    final_range = false;
}

class SequenceStepTimeouts {
    pre_range_vcsel_period_pclks = 0;
    final_range_vcsel_period_pclks = 0;
    msrc_dss_tcc_mclks = 0;
    pre_range_mclks = 0;
    final_range_mclks = 0;
    msrc_dss_tcc_us = 0;
    pre_range_us = 0;
    final_range_us = 0;
}
