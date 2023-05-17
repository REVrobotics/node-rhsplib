import {ExpansionHub} from "@rev-robotics/expansion-hub";
import {
    readRegister,
    readRegisterMultipleBytes, readShort,
    writeRegister,
    writeRegisterMultipleBytes,
    writeShort
} from "./i2c-utils";

export class DistanceSensor {
    constructor(hub: ExpansionHub, channel: number) {
        this.hub = hub;
        this.channel = channel;
    }

    private readonly hub: ExpansionHub
    private readonly channel: number
    private address: number = 0x52/2;
    private spadCount = 0;
    private spadTypeIsAperture = false;

    async is2mDistanceSensor(): Promise<boolean> {
        if ((await this.readRegister(0xc0)) != 0xee) return false;
        if ((await this.readRegister(0xc1)) != 0xaa) return false;
        if ((await this.readRegister(0xc2)) != 0x10) return false;
        if ((await this.readRegister(0x61)) != 0x00) return false;
        else return true;
    }

    async initialize() {
        await this.writeRegister(0x88, 0x00);
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x00);

        let stopValue = await this.readRegister(0x91);

        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);

        let msgConfigControl = (await this.readRegister(0x60)) | 0x12;
        await this.writeRegister(0x60, msgConfigControl);

        await this.setSignalRateLimit(0.25);

        await this.writeRegister(0x01, 0xff);

        await this.getSpadInfo();

        let refSpadMap = await this.readMultipleBytes(0xb0, 6);

        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x4f, 0x00);
        await this.writeRegister(0x4e, 0x2c);
        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0xb6, 0xb4);

        let firstSpadToEnable = (this.spadTypeIsAperture) ? 12 : 0;
        let spadsEnabled = 0;

        for(let i = 0; i < 48; i++) {
            if(i < firstSpadToEnable || spadsEnabled == this.spadCount) {
                refSpadMap[i/8] &= ~(1 << (i%8));
            } else if(((refSpadMap[i/8] >> (i%8)) & 0x01) != 0) {
                spadsEnabled++;
            }
        }

        console.log(refSpadMap);

        //begin load tuning settings
        await this.writeMultipleBytes(0xb0, refSpadMap);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x00, 0x00);

        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x09, 0x00);
        await this.writeRegister(0x10, 0x00);
        await this.writeRegister(0x11, 0x00);

        await this.writeRegister(0x24, 0x01);
        await this.writeRegister(0x25, 0xFF);
        await this.writeRegister(0x75, 0x00);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x4E, 0x2C);
        await this.writeRegister(0x48, 0x00);
        await this.writeRegister(0x30, 0x20);

        await this.writeRegister(0xFF, 0x00);
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
        await this.writeRegister(0x66, 0xA0);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x22, 0x32);
        await this.writeRegister(0x47, 0x14);
        await this.writeRegister(0x49, 0xFF);
        await this.writeRegister(0x4A, 0x00);

        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x7A, 0x0A);
        await this.writeRegister(0x7B, 0x00);
        await this.writeRegister(0x78, 0x21);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x23, 0x34);
        await this.writeRegister(0x42, 0x00);
        await this.writeRegister(0x44, 0xFF);
        await this.writeRegister(0x45, 0x26);
        await this.writeRegister(0x46, 0x05);
        await this.writeRegister(0x40, 0x40);
        await this.writeRegister(0x0E, 0x06);
        await this.writeRegister(0x20, 0x1A);
        await this.writeRegister(0x43, 0x40);

        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x34, 0x03);
        await this.writeRegister(0x35, 0x44);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x31, 0x04);
        await this.writeRegister(0x4B, 0x09);
        await this.writeRegister(0x4C, 0x05);
        await this.writeRegister(0x4D, 0x04);

        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x44, 0x00);
        await this.writeRegister(0x45, 0x20);
        await this.writeRegister(0x47, 0x08);
        await this.writeRegister(0x48, 0x28);
        await this.writeRegister(0x67, 0x00);
        await this.writeRegister(0x70, 0x04);
        await this.writeRegister(0x71, 0x01);
        await this.writeRegister(0x72, 0xFE);
        await this.writeRegister(0x76, 0x00);
        await this.writeRegister(0x77, 0x00);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x0D, 0x01);

        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0x01, 0xF8);

        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x8E, 0x01);
        await this.writeRegister(0x00, 0x01);
        await this.writeRegister(0xFF, 0x00);
        await this.writeRegister(0x80, 0x00);
        // end load tuning settings

        await this.writeRegister(0x0a, 0x04);
        await this.writeRegister(0x84, await this.readRegister(0x84) & ~0x10); //active low
        await this.writeRegister(0x0b, 0x01);

        let measurementTimingBudget = this.getMeasurementTimingBudget();

        await this.writeRegister(0x01, 0xE8);

        //set measurement timing budget

        await this.writeRegister(0x01, 0x01);
        if(!await this.performCalibration(0x40)) return false;

        await this.writeRegister(0x01, 0x02);
        if(!await this.performCalibration(0x00)) return false;

        //Restore previous config
        await this.writeRegister(0x01, 0xE8);
    }

    private async performCalibration(input: number): Promise<boolean> {
        await this.writeRegister(0x00, 0x01 | input);

        await this.writeRegister(0x0B, 0x01);
        await this.writeRegister(0x00, 0x00);

        return true;
    }

    private async getMeasurementTimingBudget(): Promise<number> {
        let budget = 1910 + 960;

        let enables = await this.getSequenceStepEnables();
        let timeouts = await this.getSequenceStepTimeouts(enables);

        if(enables.tcc) {
            budget += timeouts.msrc_dss_tcc_us + 590;
        }

        if(enables.dss) {
            budget += 2*(timeouts.msrc_dss_tcc_us + 690);
        } else if(enables.msrc) {
            budget += timeouts.msrc_dss_tcc_us + 660;
        }

        if(enables.pre_range) {
            budget += timeouts.pre_range_us + 660;
        }

        if(enables.final_range) {
            budget += timeouts.final_range_us + 550;
        }

        return budget;
    }

    private async getSequenceStepTimeouts(enables: SequenceStepEnables): Promise<SequenceStepTimeouts> {
        let result = new SequenceStepTimeouts();
        result.pre_range_vcsel_period_pclks = this.decodeVcselPeriod(await this.readRegister(0x50));

        result.msrc_dss_tcc_mclks = await this.readRegister(0x46);
        result.msrc_dss_tcc_us = this.timeoutMclksToMicroseconds(result.msrc_dss_tcc_mclks,
            result.pre_range_vcsel_period_pclks);

        result.pre_range_mclks = this.decodeTimeout(await this.readShort(0x51));
        result.pre_range_us = this.timeoutMclksToMicroseconds(result.pre_range_mclks,
            result.pre_range_vcsel_period_pclks);

        result.final_range_vcsel_period_pclks = this.decodeVcselPeriod(await this.readRegister(0x70));

        result.final_range_mclks = this.decodeTimeout(await this.readShort(0x71));

        if(enables.pre_range) {
            result.final_range_mclks -= result.pre_range_mclks;
        }

        result.final_range_us = this.timeoutMclksToMicroseconds(result.final_range_mclks,
            result.final_range_vcsel_period_pclks);
        return result;
    }

    private decodeTimeout(value: number): number {
        return ((value & 0x00FF) << ((value & 0xFF00) >> 8)) + 1;
    }

    private decodeVcselPeriod(value: number) {
        return (value +1) << 1;
    }

    private timeoutMclksToMicroseconds(timeout_period_mclks: number, vcsel_period_pclks: number): number {
        let macroPeriod = this.calcMacroPeriod(vcsel_period_pclks);

        return ((timeout_period_mclks * macroPeriod) + (macroPeriod / 2)) / 1000
    }

    private calcMacroPeriod(vcsel_period_pclks: number): number {
        return (((2304 * (vcsel_period_pclks) * 1655) + 500) / 1000);
    }

    private async getSequenceStepEnables(): Promise<SequenceStepEnables> {
        let result = new SequenceStepEnables();

        let sequenceConfig = await this.readRegister(0x01);

        result.tcc = ((sequenceConfig >> 4) & 0x01) != 0;
        result.dss = ((sequenceConfig >> 3) & 0x01) != 0;
        result.msrc = ((sequenceConfig >> 2) & 0x01) != 0;
        result.pre_range = ((sequenceConfig >> 6) & 0x01) != 0;
        result.final_range = ((sequenceConfig >> 7) & 0x01) != 0;

        return result;
    }

    private async setSignalRateLimit(mcps: number): Promise<void> {
        await this.writeShort(0x44, (mcps * (1<<7)));
    }

    // Get reference SPAD (single photon avalanche diode) count and type
    // based on VL53L0X_get_info_from_device()
    private async getSpadInfo() {
        await this.writeRegister(0x80, 0x01);
        await this.writeRegister(0xFF, 0x01);
        await this.writeRegister(0x00, 0x00);
        await this.writeRegister(0xFF, 0x06);

        await this.writeRegister(0x83, await this.readRegister(0x83) | 0x04);
        await this.writeRegister(0xFF, 0x07);
        await this.writeRegister(0x81, 0x01);

        await this.writeRegister(0x80, 0x01);

        await this.writeRegister(0x94, 0x6b);
        await this.writeRegister(0x83, 0x00);

        // reference has a timeout mechanism, but it doesn't seem to be necessary

        await this.writeRegister(0x83, 0x01);
        let tmp = await this.readRegister(0x92);

        this.spadCount = tmp & 0x7f;
        this.spadTypeIsAperture = ((tmp >> 7) & 0x01) == 0;

        await this.writeRegister(0x81, 0x00);
        await this.writeRegister(0xff, 0x06);
        await this.writeRegister(0x83, await this.readRegister(0x83) & ~0x04);
        await this.writeRegister(0xff, 0x01);
        await this.writeRegister(0x00, 0x01);

        await this.writeRegister(0xff, 0x00);
        await this.writeRegister(0x80, 0x00);
    }

    private async readRegister(register: number): Promise<number> {
        return readRegister(this.hub, this.channel, this.address, register);
    }

    private async readMultipleBytes(register: number, n: number): Promise<number[]> {
        return readRegisterMultipleBytes(this.hub, this.channel, this.address, register, n);
    }

    private async writeMultipleBytes(register: number, values: number[]): Promise<void> {
        return writeRegisterMultipleBytes(this.hub, this.channel, this.address, register, values);
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

