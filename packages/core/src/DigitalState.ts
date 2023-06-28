export class DigitalState {
    static readonly HIGH = new DigitalState(true);
    static readonly LOW = new DigitalState(false);

    private readonly state: boolean;
    private constructor(state: boolean) {
        this.state = state;
    }
    isHigh(): boolean {
        return this.state;
    }

    isLow(): boolean {
        return !this.state;
    }

    toString(): string {
        return this.state ? "High" : "Low";
    }
}
