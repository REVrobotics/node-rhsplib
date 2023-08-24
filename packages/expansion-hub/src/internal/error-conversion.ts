import {RhspLibErrorCode} from "@rev-robotics/rhsplib";
import {RhspLibError} from "../errors/RhspLibError.js";
import {
    CommandNotSupportedError,
    GeneralSerialError, nackCodeToError,
    ParameterOutOfRangeError,
    TimeoutError
} from "@rev-robotics/rev-hub-core";

export async function convertErrorPromise<T>(serialNumber: string | undefined, block: () => Promise<T>): Promise<T> {
    try {
        return await block();
    } catch (e: any) {
        throw createError(e, serialNumber);
    }
}

export function convertErrorSync<T>(serialNumber: string | undefined, block: () => T): T {
    try {
        return block();
    } catch (e: any) {
        throw createError(e, serialNumber);
    }
}

function createError(e: any, serialNumber: string | undefined): any {
    if (e.errorCode == RhspLibErrorCode.GENERAL_ERROR) {
        return new RhspLibError("General librhsp error");
    } else if (e.errorCode == RhspLibErrorCode.MSG_NUMBER_MISMATCH) {
        return new RhspLibError("Message Number Mismatch");
    } else if (e.errorCode == RhspLibErrorCode.NOT_OPENED) {
        return new RhspLibError("Hub is not opened");
    } else if (e.errorCode == RhspLibErrorCode.COMMAND_NOT_SUPPORTED) {
        return new CommandNotSupportedError();
    } else if (e.errorCode == RhspLibErrorCode.UNEXPECTED_RESPONSE) {
        return new RhspLibError("Unexpected packet received");
    } else if (e.errorCode == RhspLibErrorCode.TIMEOUT) {
        return new TimeoutError();
    } else if (e.errorCode == RhspLibErrorCode.SERIAL_ERROR) {
        return new GeneralSerialError(
            serialNumber ?? "no serial number provided",
        );
    } else if (
        e.errorCode >= RhspLibErrorCode.ARG_OUT_OF_RANGE_END &&
        e.errorCode <= RhspLibErrorCode.ARG_OUT_OF_RANGE_START
    ) {
        let index = -e.errorCode + RhspLibErrorCode.ARG_OUT_OF_RANGE_START;
        return new ParameterOutOfRangeError(index);
    } else if (e.nackCode !== undefined) {
        return nackCodeToError(e.nackCode);
    } else {
        return e;
    }
}
