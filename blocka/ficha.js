export default class Ficha {
    constructor(x, y, w, h, ang, fija) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._ang = ang;
        this._fija = false;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get w() {
        return this._w;
    }

    get h() {
        return this._h;
    }

    get ang() {
        return this._ang;
    }
    get fija(){
        return this._fija;
    }

    set ang(value) {
        this._ang = value;
    }

    fijar() {
        this._fija=true;
    }
}