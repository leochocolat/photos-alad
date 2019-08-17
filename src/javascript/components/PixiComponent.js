import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import * as PIXI from 'pixi.js'
import Stats from 'stats.js';
import Lerp from '../utils/Lerp.js';
// import CursorComponent from './CursorComponent';
import ScrollModule from '../modules/ScrollModule';
import data from '../../assets/data/data.json';


class PixiComponent {
    
    constructor() {
        _.bindAll(
            this,
            '_tickHandler',
            '_resizeHandler',
            '_mousemoveHandler',
            '_wheelHandler',
            '_wheelEndHandler'
        );

        this.ui = {
            canvas: document.querySelector('.js-canvas-component')
        }

        this.component = {};

        this._scrollDelta = {
            x: 0,
            y: 0
        }
        // this.component.cursor = new CursorComponent({ el: this.ui.canvas });

        this._settings = {
            scrollVelocity: 0.001,
            radius: 300
        }
        this._tweenObj = {
            scrollPosition: 0,
        }

        this._mousePosition = {
            x: 0,
            y: 0
        }

        this._setup();
    }

    _setup() {
        this._resize();
        this._build();
        this._setupEventListener();
    }

    _build() {
        this._app = new PIXI.Application({
            view: this.ui.canvas,
            width: this._width,
            height: this._height,
            transparent: true
        });

        this._canvas = this._app.view;
        this._container = new PIXI.Container();
        this._stage = this._app.stage;
        this._stage.addChild(this._container);

        this._createLayers();
        this._initAngles();
        this._initPositions();
    }

    _createLayers() {
        this._imagesLayer = new PIXI.Container();

        this._container.addChild(this._imagesLayer);
    }

    _initAngles() {
        const limit = 20;

        this._rotationAngles = [];

        for (let i = 0; i < limit; i++) {
            let value = i/limit;
            let angle = value * Math.PI * 2;
            this._rotationAngles.push(angle);
        }
    }

    _initPositions() {
        this._rectanglePositions = [];

        for (let i = 0; i < this._rotationAngles.length; i++) {
            let posX = (this._width/2) +  Math.cos(this._rotationAngles[i]) * this._settings.radius;
            let posY = (this._height/2) + Math.sin(this._rotationAngles[i]) * this._settings.radius;

            let rectanglePosition = {
                x: posX,
                y: posY
            }

            this._rectanglePositions.push(rectanglePosition);
        }
    }

    _createRectangles() {
        for (let i = 0; i < this._rectanglePositions.length; i++) {
            let container = new PIXI.Container(); 

            const width = 50;
            const height = 100;
            const color = '0x0000ff';

            let graphics = new PIXI.Graphics();
            graphics.beginFill(color);
            graphics.drawRect(0, 0, width, height);

            container.addChild(graphics);
            container.position.x = this._rectanglePositions[i].x;
            container.position.y = this._rectanglePositions[i].y;
            container.pivot.x = container.width/2;
            container.pivot.y = container.height/2;
            container.rotation = this._rotationAngles[i];
            this._imagesLayer.addChild(container);
        }
    }

    _updateAngles() {
        for (let i = 0; i < this._rotationAngles.length; i++) {
            this._rotationAngles[i] += this._scrollDelta.y * this._settings.scrollVelocity;
        }
    }

    _updatePositions() {
        for (let i = 0; i < this._rectanglePositions.length; i++) {
            let posX = (this._width/2) +  Math.cos(this._rotationAngles[i]) * this._settings.radius;
            let posY = (this._height/2) + Math.sin(this._rotationAngles[i]) * this._settings.radius;

            this._rectanglePositions[i].x = posX; 
            this._rectanglePositions[i].y = posY;
        }
    }

    _tick() {
        this._clearLayers();

        this._createRectangles();
        this._updateScrollPosition();
        this._updateAngles();
        this._updatePositions();

        this._app.render(this._stage);
    }


    _clearLayers() {
        this._clearLayer(this._imagesLayer);
    }

    _clearLayer(layer) {
        for (let i = 0; i < layer.children.length; i++) {
            layer.removeChild(layer.children[i]);
        }
    }

    _updateScrollPosition() {
        this._tweenObj.scrollPosition += this._scrollDelta.y * this._settings.scrollVelocity;
    }

    _setupEventListener() {
        TweenLite.ticker.addEventListener('tick', this._tickHandler);
        window.addEventListener('resize', this._resizeHandler);
        window.addEventListener('mousemove', this._mousemoveHandler);

        ScrollModule.addEventListener('wheel', this._wheelHandler);
        ScrollModule.addEventListener('wheel:end', this._wheelEndHandler);
    }

    _resize() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;
    }

    _tickHandler() {
        this._tick();
    }

    _resizeHandler() {
        this._resize();
    }

    _mousemoveHandler(event) {
        this._mousePosition = {
            x: event.clientX,
            y: event.clientY
        }
        // this.component.cursor.move(this._mousePosition);
    }

    _wheelHandler() {
        this._scrollDelta.x = ScrollModule.getWheelDelta().x;
        this._scrollDelta.y = ScrollModule.getWheelDelta().y;
    }
    
    _wheelEndHandler() {
        this._scrollDelta.x = ScrollModule.getWheelDelta().x;
        this._scrollDelta.y = ScrollModule.getWheelDelta().y;
    }


}

export default new PixiComponent();