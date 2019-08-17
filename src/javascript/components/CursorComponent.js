import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';

class CursorComponent {

    constructor(options) {

        _.bindAll(
            this,
            '_tickHandler'
        );

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

        this._setup();
    }

    _setup() {
        this._ctx = this.el.getContext('2d');
        this._setupEventListener();
    }

    move(position) {
        this._cursorPosition = position;
    }

    _createCursors() {
        const circleRadius = 20;
        const dotRadius = 2.5;

        this._ctx.strokeStyle = '#555555';
        
        //circle
        this._ctx.beginPath();
        this._ctx.arc(this._circlePosition.x, this._circlePosition.y, circleRadius, 0, 2 * Math.PI);
        this._ctx.stroke();

        //dot
        this._ctx.beginPath();
        this._ctx.arc(this._dotPosition.x, this._dotPosition.y, dotRadius, 0, 2 * Math.PI);
        this._ctx.fill();
    }

    _updateCursors() {
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

    _tick() {
        this._ctx.clearRect(0, 0, this.el.width, this.el.height);
        this._updateCursors();
        this._createCursors();
    }

    _setupEventListener() {
        TweenLite.ticker.addEventListener('tick', this._tickHandler);
    }

    _tickHandler() {
        this._tick();
    }



}

export default CursorComponent;
