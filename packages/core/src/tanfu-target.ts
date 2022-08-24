export default class TanfuTarget {
    private _tId: string = '';
    public get tId() {
        return this._tId
    }
    constructor(tId: string) {
        this._tId = tId
    }
}