export class DigitalState {
    static High = new DigitalState(true);
    static Low = new DigitalState(false);

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
