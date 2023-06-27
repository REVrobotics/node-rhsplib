import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function readRegister(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
): Promise<number> {
    return (await hub.readI2CRegister(channel, address, 1, register))[0];
}

export async function readRegisterMultipleBytes(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    n: number,
): Promise<number[]> {
    return await hub.readI2CRegister(channel, address, n, register);
}

export async function writeRegisterMultipleBytes(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    values: number[],
): Promise<void> {
    await hub.writeI2CMultipleBytes(channel, address, [register, ...values]);
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
    await writeRegisterMultipleBytes(
        hub,
        channel,
        address,
        register,
        shortToByteArray(value),
    );
}

export async function readShort(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
) {
    let bytes = await readRegisterMultipleBytes(hub, channel, address, register, 2);

    return (bytes[0] << 8) | bytes[1];
}

export async function writeInt(
    hub: ExpansionHub,
    channel: number,
    address: number,
    register: number,
    value: number,
) {
    await hub.writeI2CMultipleBytes(channel, address, [
        register,
        ...intToByteArray(value),
    ]);
}

function shortToByteArray(value: number) {
    const byteArray = [0, 0];

    byteArray[0] = (value >> 8) & 0xff;
    byteArray[1] = value & 0xff;

    return byteArray;
}

function intToByteArray(value: number): number[] {
    const byteArray = [0, 0, 0, 0];

    byteArray[0] = (value >> 24) & 0xff;
    byteArray[1] = (value >> 16) & 0xff;
    byteArray[2] = (value >> 8) & 0xff;
    byteArray[3] = value & 0xff;

    return byteArray;
}
