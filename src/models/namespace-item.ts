export default class NamespaceItem {
    private _value: string;
    public get value(): string {
        return this._value;
    }
    public set value(v: string) {
        this._value = v;
    }

    private _isFromFilePath: boolean;
    public get isFromFilePath(): boolean {
        return this._isFromFilePath;
    }
    public set isFromFilePath(v: boolean) {
        this._isFromFilePath = v;
    }

    /**
     *
     */
    constructor(isFromFilePath: boolean, value: string) {
        this._isFromFilePath = isFromFilePath;
        this._value = value;
    }
}
