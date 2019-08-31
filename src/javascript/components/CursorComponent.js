import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Lerp from '../utils/Lerp';
import ColorUtil from '../utils/ColorUtil';

class CursorComponent {

    constructor(options) {

        this.el = options.el;

        this._cursorPosition = {
            x: 0,
            y: 0
        }

        this._dotPosition = {
            x: 0,
            y: 0
        }

        this._circlePosition = {
            x: 0,
            y: 0
        }

        this._tweenObject = {
            color: '#121212'
        }

        this._cirlceProgress = 0;
        this._rotateFactor = 0;

        this._setup();
    }

    _setup() {
        this._ctx = this.el.getContext('2d');
    }

    setColor(color) {
        TweenLite.set(this._tweenObject, { color: color });
    }
    
    updateColor(color) {
        TweenLite.to(this._tweenObject, 0.5, { color: color });
    }

    move(position) {
        this._cursorPosition = position;
    }

    progress(progress) {
        this._cirlceProgress = progress;
    }

    rotate(progress) {
        this._rotateFactor = progress;
    }

    createCursors() {
        const circleRadius = 20;
        const dotRadius = 1.5;
        let color = ColorUtil.HexaToRGB(this._tweenObject.color);
        
        this._ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`;
        this._ctx.fillStyle = this._tweenObject.color;
        
        //circle
        this._ctx.beginPath();
        this._ctx.arc(this._circlePosition.x, this._circlePosition.y, circleRadius, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.closePath();
        
        //circle fill
        this._ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
        this._ctx.beginPath();

        this._ctx.setTransform(1, 0, 0, 1, this._circlePosition.x, this._circlePosition.y); 
        this._ctx.rotate( - Math.PI/2 + (this._rotateFactor * 2 * Math.PI));
        this._ctx.arc(0, 0, circleRadius, 0, 2 * Math.PI * this._cirlceProgress);
        this._ctx.setTransform(1, 0, 0, 1, 0, 0);

        this._ctx.stroke();
        this._ctx.closePath();

        //dot
        this._ctx.beginPath();
        this._ctx.arc(this._dotPosition.x, this._dotPosition.y, dotRadius, 0, 2 * Math.PI);
        this._ctx.fill();
        this._ctx.closePath();
    }
    
    updateCursors() {
        //dot
        this._circlePosition = {
            x: Lerp.lerp(this._cursorPosition.x, this._circlePosition.x, 0.9),
            y: Lerp.lerp(this._cursorPosition.y, this._circlePosition.y, 0.9),
        }
        
        //circle
        this._dotPosition = {
            x: Lerp.lerp(this._cursorPosition.x, this._dotPosition.x, 0.2),
            y: Lerp.lerp(this._cursorPosition.y, this._dotPosition.y, 0.2),
        };
    }

}

export default CursorComponent;
