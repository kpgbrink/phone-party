


export class ValueWithDefault<T> {
    value: T;
    constructor(public defaultValue: T) {
        this.value = defaultValue;
        this.defaultValue = defaultValue;
    }

    public setToDefault(): void {
        this.value = this.defaultValue;
    }
}