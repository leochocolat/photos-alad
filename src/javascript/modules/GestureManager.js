import Module from '../core/Module';
import _ from 'underscore';
import Hammer from 'hammerjs';
import { TweenLite } from 'gsap/TweenMax';

class GestureManager extends Module  {

    constructor(options = {}) {

        super(options);

        _.bindAll(
            this, 
            '_panHandler',
            '_panEndHandler'
        );

        this._gesture = new Hammer(document.body);

        this._dragDelta = {
            x: 0,
            y: 0
        };

        this._setup();
    }

    _setup() {
        this._setupEventListener();
    }

    getGesture() {
        return this._dragDelta;
    }

    _getGestureResponse() {
        return this._dragDelta;
    }

    _setupEventListener() {
        this._gesture.on('pan', this._panHandler);
        this._gesture.on('panend', this._panEndHandler);
    }

    _panHandler(e) {
        e.preventDefault();

        this._dragDelta.x = e.deltaX;
        this._dragDelta.y = e.deltaY;

        this.dispatchEvent('gesture', this._getGestureResponse);

    }

    _panEndHandler(e) {
        this._dragDelta.x = e.deltaX;
        this._dragDelta.y = e.deltaY;

        this.dispatchEvent('gesture:end', this._getGestureResponse);
    }
}

export default new GestureManager();