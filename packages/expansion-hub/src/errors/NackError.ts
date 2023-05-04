export class NackError extends Error {
    nackCode: number;
    constructor(nackCode: number) {
        super();

        this.nackCode = nackCode;
    }
}
