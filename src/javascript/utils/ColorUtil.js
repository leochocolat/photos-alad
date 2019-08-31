class ColorUtil {

    constructor() {

    }

    HexaToRGB(hexa) {
    
        let rgb = {
            r: parseInt((this._cutHex(hexa)).substring(0,2),16),
            g: parseInt((this._cutHex(hexa)).substring(2,4),16),
            b: parseInt((this._cutHex(hexa)).substring(4,6),16)
        }
        return rgb;
    }

    _cutHex(hexa) {
        return (hexa.charAt(0)=="#") ? hexa.substring(1,7):hexa
    }

}


export default new ColorUtil();