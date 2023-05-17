import {ExpansionHub} from "@rev-robotics/expansion-hub";

export async function readRegister(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
): Promise<number> {
    await hub.writeI2CSingleByte(channel, address, register);
    await hub.readI2CSingleByte(channel, address);

    return (await hub.getI2CReadStatus(channel)).bytes[0];
}

export async function readRegisterMultipleBytes(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    n: number
): Promise<number[]> {
    await hub.writeI2CSingleByte(channel, address, register);
    await hub.readI2CMultipleBytes(channel, address, n);

    return (await hub.getI2CReadStatus(channel)).bytes;
}

export async function writeRegisterMultipleBytes(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    values: number[]
): Promise<void> {
    await hub.writeI2CSingleByte(channel, address, register);
    await hub.writeI2CMultipleBytes(channel, address, values);
}

export async function writeRegister(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    value: number,
) {
    await hub.writeI2CMultipleBytes(channel, address, [register, value]);
}

export async function writeShort(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    value: number,
) {
    await hub.writeI2CMultipleBytes(channel, address, [register, ...shortToByteArray(value)]);
}

export async function readShort(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number
) {
    await hub.writeI2CSingleByte(channel, address, register);

    await hub.readI2CMultipleBytes(channel, address, 2);

    let bytes = (await hub.getI2CReadStatus(channel)).bytes

    return (bytes[0] << 8) | bytes[1];
}

export async function writeInt(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    value: number,
) {
    await hub.writeI2CMultipleBytes(channel, address, [register, ...intToByteArray(value)]);
}

function shortToByteArray(value: number) {
    const byteArray = [0, 0];

    byteArray[0] = (value & 0xFF00) >> 8;
    byteArray[1] = value & 0xFF;

    return byteArray;
}

function intToByteArray(value: number): number[] {
    const byteArray = [0, 0, 0, 0];

    byteArray[0] = (value & 0xFF000000) >> 24;
    byteArray[1] = (value & 0xFF0000) >> 16;
    byteArray[2] = (value & 0xFF00) >> 8;
    byteArray[3] = value & 0xFF;

    return byteArray;
}
