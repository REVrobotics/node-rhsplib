export interface I2CReadStatus {
    i2cTransactionStatus: number;
    numBytesRead: number;
    bytes: number[];
}
