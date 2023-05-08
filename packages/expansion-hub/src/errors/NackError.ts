export class NackError extends Error {
    nackCode: number;
    constructor(nackCode: number, message: string = "Nack Error") {
        super(message);

        this.nackCode = nackCode;
    }
}
