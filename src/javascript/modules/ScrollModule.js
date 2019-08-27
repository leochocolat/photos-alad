import Module from '../core/Module';
import _ from 'underscore';
import Lerp from '../utils/Lerp.js';

import { addWheelListener } from 'wheel';
import { TweenLite } from 'gsap/TweenMax';

class ScrollModule extends Module {

    constructor(options = {}) {

        super(options);

        _.bindAll(
            this, 
            '_scrollHandler',
            '_getWheelResponse'
        );

        this._delta = {
            x: 0, 
            y: 0
        }
        
        this._setup();
    }
    
    _setup() {
        this._setupEventListener();
    }

    getWheelDelta() {
        return this._delta;
    }

    _clearTimeout() {
        if(this._timeout) {
            this._timeout.kill();
        }
    }

    _setTimeout() {
        this._timeout = TweenLite.delayedCall(0.1, () => {
            this.dispatchEvent('wheel:end', this._getWheelResponse);
        })
    }
    
    _getWheelResponse() {
        return {
            dalta: this._delta
        }
    }
    
    _setupEventListener() {
        addWheelListener(window, this._scrollHandler, { passive: false });
    }
    
    _scrollHandler(e) {
        e.preventDefault();
        
        this._clearTimeout();
        
        this._delta.x = e.deltaX;
        this._delta.y = e.deltaY;
        
        this.dispatchEvent('wheel', this._getWheelResponse);
        
        this._delta.x = 0;
        this._delta.y = 0;

        this._setTimeout();
    }
}

export default new ScrollModule();