//IMPORTS
import _ from 'underscore';

import * as dat from 'dat.gui';

import {TimelineLite, TweenLite} from 'gsap/TweenMax';

import ScrollModule from '../modules/ScrollModule';

// EXAMPLE
class AnimationTest {

    constructor() {
        _.bindAll(
            this,
            '_tickHandler',
            '_resizeHandler',
            '_mousemoveHandler',
            '_wheelHandler',
            '_updateIndex',
            '_initPositions',
            '_onTweenUpdateHandler',
            '_onTweenCompleteHandler',
            '_clickHandler'
        );
        
        this._canvas = document.querySelector('.js-canvas-component');
        this._ctx = this._canvas.getContext('2d');

        this.ui = {
            section: document.querySelector('.js-section-canvas'),
        }

        this._scrollDelta = {
            x: 0,
            y: 0
        }

        this._isScrollEnabled = true;

        this._delta = 0;

        this._settings = {
            duration: 1,
            imagesAmount: 10,
            imageScale: .1,
            radiusFactor: 1.5
        }

        const gui = new dat.GUI({ closed: true });
        gui.add(this._settings, 'duration', 1, 10).step(1);

        this._tweenObject = {
            index: 0,
            angleIndex: 0,
            startAngle: [{ value: Math.PI/2 }, { value: 0 }],
            arcAngle: [{ value: 0 }, { value: Math.PI/10 }],
            tweenProgress: 0
        }

        this._init();
    }

    _init() {
        this._resize();

        this._initPositions();
        this._setupEventListener();
        this._setupTweens();
    }

    _initPositions() {
        this._circleRadius = this._width/5 * this._settings.radiusFactor;
        let limit = this._settings.imagesAmount;

        this._origin = {
            x: this._width/2,
            y: this._height/1.5
        }

        this._rotationAngles = [];
        this._positions = [];

        for (let j = 0; j < this._tweenObject.startAngle.length; j++) {
            let angles = [];
            let positions = [];

            for (let i = 0; i <= limit; i++) {
                let value = i/limit;
                let angle =  (value * this._tweenObject.arcAngle[j].value) + this._tweenObject.startAngle[j].value;
                angles.push(- angle);
            } 
            
            
            for (let i = 0; i < angles.length; i++) {
                let posX = this._origin.x +  Math.cos(angles[i]) * this._circleRadius;
                let posY = this._origin.y + Math.sin(angles[i]) * this._circleRadius;
                let position = { x: posX, y: posY }
                
                positions.push(position);
            }

            this._rotationAngles.push(angles);
            this._positions.push(positions); 
        }
    }

    _createImages() {
        const width = this._width * this._settings.imageScale;
        const height = width * 1.1; 

        let gradient1 = this._ctx.createLinearGradient(0, 0, 0, height);
        gradient1.addColorStop(0, "red");
        gradient1.addColorStop(1, "orange");

        let gradient2 = this._ctx.createLinearGradient(0, 0, 0, height);
        gradient2.addColorStop(0, "blue");
        gradient2.addColorStop(1, "purple");

        let activeIndex = this._tweenObject.angleIndex;
        let nextIndex = this._mod(this._tweenObject.angleIndex + 1, this._positions.length);

        for (let i = 0; i < this._positions[activeIndex].length; i++) {
            this._ctx.fillStyle = gradient1;
            this._ctx.setTransform(1, 0, 0, 1, this._positions[activeIndex][i].x, this._positions[activeIndex][i].y); 
            this._ctx.rotate(this._rotationAngles[activeIndex][i] + (Math.PI/2));
            this._ctx.fillRect(0, 0, width, height);
            this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        for (let i = 0; i < this._positions[nextIndex].length; i++) {
            this._ctx.fillStyle = gradient2;
            this._ctx.setTransform(1, 0, 0, 1, this._positions[nextIndex][i].x, this._positions[nextIndex][i].y); 
            this._ctx.rotate(this._rotationAngles[nextIndex][i] + (Math.PI/2));
            this._ctx.fillRect(0, 0, width, height);
            this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    /*
        TWEENS
    */
    _setupTweens() {
        this._timeline = new TimelineLite({
            paused: false,
            onUpdate: this._onTweenUpdateHandler,
            onComplete: this._onTweenCompleteHandler,
        });

        let activeIndex = this._tweenObject.angleIndex;
        let nextIndex = this._mod(this._tweenObject.angleIndex + 1, this._positions.length);

        this._timeline.fromTo(this._tweenObject.arcAngle[activeIndex], this._settings.duration, { value: 0 }, { value: Math.PI/2 }, 0);
        this._timeline.to(this._tweenObject.arcAngle[activeIndex], this._settings.duration, { value: 0 }, 1);
        this._timeline.fromTo(this._tweenObject.startAngle[activeIndex], this._settings.duration, { value: Math.PI/2 }, { value: Math.PI }, 1);

        this._timeline.fromTo(this._tweenObject.startAngle[nextIndex], this._settings.duration, { value: 0 }, { value: Math.PI/2 }, 1);
        this._timeline.fromTo(this._tweenObject.arcAngle[nextIndex], this._settings.duration, { value: Math.PI/10 }, { value: 0 }, 1);
    }


    /*
        UPDATE FUNCTIONS
    */
    _updatePositions() {
        let limit = this._settings.imagesAmount;

        this._rotationAngles = [];
        this._positions = [];

        for (let j = 0; j < this._tweenObject.startAngle.length; j++) {
            let angles = [];
            let positions = [];

            for (let i = 0; i <= limit; i++) {
                let value = i/limit;
                let angle = (value * this._tweenObject.arcAngle[j].value) + this._tweenObject.startAngle[j].value;
                angles.push(- angle); 
            } 
            
            for (let i = 0; i < angles.length; i++) {
                let posX = this._origin.x +  Math.cos(angles[i]) * this._circleRadius;
                let posY = this._origin.y + Math.sin(angles[i]) * this._circleRadius;
                let position = { x: posX, y: posY }
                
                positions.push(position);
            }

            this._rotationAngles.push(angles);
            this._positions.push(positions); 
        }
    }

    _updateIndex() {
        let index = this._tweenObject.index + 1;
        this._tweenObject.angleIndex = this._mod(index, 2);
    }

    /*
        TRIGGERS
    */


    /*
        TICKER/RESIZE
    */
    _draw() {
        this._ctx.clearRect(0, 0, this._width, this._height);

        this._createImages();

        this._updatePositions();

        this._delta += 0.001;
    }

    _resize() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;

        this._canvas.width = this._width;
        this._canvas.height = this._height;
    }

    _setupEventListener() {
        TweenLite.ticker.addEventListener('tick', this._tickHandler);

        window.addEventListener('resize', this._resizeHandler);
        window.addEventListener('mousemove', this._mousemoveHandler);

        window.addEventListener('click', this._clickHandler);

        ScrollModule.addEventListener('wheel', this._wheelHandler);
        ScrollModule.addEventListener('wheel:end', this._wheelEndHandler);
    }

    /*
        HANDLER
    */
    _tickHandler() {    
        this._draw();
    }

    _resizeHandler() {
        this._resize();
        this._initPositions();
    }

    _wheelHandler(e) {
        this._scrollDelta.x = ScrollModule.getWheelDelta().x;
        this._scrollDelta.y = ScrollModule.getWheelDelta().y;

        if (this._scrollDelta.y > this._settings.wheelSensibility && this._isScrollEnabled == true) {
            this._setupTweens();
        } else if (this._scrollDelta.y <  - this._settings.wheelSensibility && this._isScrollEnabled == true) {

        }
    }

    _wheelEndHandler() {
        this._scrollDelta.x = ScrollModule.getWheelDelta().x;
        this._scrollDelta.y = ScrollModule.getWheelDelta().y;
    }

    _mousemoveHandler(e) {
        this._mousePosition = {
            x: e.clientX,
            y: e.clientY
        }
    }

    _clickHandler() {
        this._setupTweens();
    }

    _onTweenUpdateHandler() {

    }

    _onTweenCompleteHandler() {
        this._updateIndex();
    }

    /*
        UTILS
    */
    _mod(n, m) {
        return ((n % m) + m) % m;
    }
}

export default new AnimationTest();