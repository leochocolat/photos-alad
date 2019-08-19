import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import * as PIXI from 'pixi.js'
import Stats from 'stats.js';
import Lerp from '../utils/Lerp.js';
// import CursorComponent from './CursorComponent';
import ScrollModule from '../modules/ScrollModule';
import data from '../../assets/data/introImages.json';


class PixiComponent {
    
    constructor() {
        _.bindAll(
            this,
            '_tickHandler',
            '_resizeHandler',
            '_mousemoveHandler',
            '_wheelHandler',
            '_wheelEndHandler',
            '_onLoadHandler'
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

        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);

        this._setup();
    }

    _setup() {
        this._resize();
        this._build();
    }

    _build() {
        this._app = new PIXI.Application({
            view: this.ui.canvas,
            width: this._width,
            height: this._height,
            transparent: true,
            antialias: true
        });

        this._canvas = this._app.view;
        this._container = new PIXI.Container();
        this._stage = this._app.stage;
        this._stage.addChild(this._container);

        this._loadAssets();
    }

    _loadAssets() {
        const path = '../../assets/images/';
        this._loader = new PIXI.loaders.Loader();

        for (let i = 0; i < data.length; i++) {
            this._loader.add(data[i].fileName, `${path}${data[i].fileName}`);
        }

        this._loader.load(this._onLoadHandler);
    }
    
    _start() {
        
        this._initAngles();
        this._initPositions();
        this._initSprites();

        this._createLayers();

        this._createSprites();

        this._setupEventListener();
    }

    _initAngles() {
        const limit = data.length;

        this._rotationAngles = [];

        for (let i = 0; i < limit; i++) {
            let value = i/limit;
            let angle = value * (Math.PI * 2);
            this._rotationAngles.push(angle);
        }
    }

    _initPositions() {
        this._positions = [];
        for (let i = 0; i < this._rotationAngles.length; i++) {
            let posX = this._center.x +  Math.cos(this._rotationAngles[i]) * this._settings.radius;
            let posY = this._center.y + Math.sin(this._rotationAngles[i]) * this._settings.radius;

            let position = {
                x: posX,
                y: posY
            }

            this._positions.push(position);
        }
    }

    _initSprites() {
        let width = 320;
        
        this._sprites = [];

        for (let i = 0; i < data.length; i++) {
            let sprite = new PIXI.Sprite(this._loader.resources[data[i].fileName].texture);

            let ratio = sprite.width / sprite.height;
            
            sprite.width = width;
            sprite.height = width / ratio;
            this._sprites.push(sprite);
        }
    }

    _createSprites() {
        for (let i = 0; i < this._sprites.length; i++) {
            
            let container = new PIXI.Container();
            container.addChild(this._sprites[i]);

            container.position.x = this._positions[i].x;
            container.position.y = this._positions[i].y;
            container.pivot.x = container.width/2;
            container.pivot.y = container.height/2;
            container.rotation = this._rotationAngles[i] + (Math.PI/2);

            this._imagesLayer.addChild(container);
        }
    }

    _createLayers() {
        this._imagesLayer = new PIXI.Container();

        this._container.addChild(this._imagesLayer);
    }

    _updateAngles() {
        for (let i = 0; i < this._rotationAngles.length; i++) {
            this._rotationAngles[i] += this._scrollDelta.y * this._settings.scrollVelocity;
        }
    }

    _updatePositions() {
        for (let i = 0; i < this._positions.length; i++) {
            let posX = this._center.x + Math.cos(this._rotationAngles[i]) * this._settings.radius;
            let posY = this._center.y + Math.sin(this._rotationAngles[i]) * this._settings.radius;

            this._positions[i].x = posX; 
            this._positions[i].y = posY;
        }
    }

    _tick() {
        this._clearLayers();

        this._createSprites();

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

        this._center = {
            x: this._width / 2,
            y: this._height * 1.1,
        }
    }

    _tickHandler() {
        this._stats.begin();//STATS

        this._tick();

        this._stats.end();//STATS
    }

    _onLoadHandler(loader, resources) {
        this._start();
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