//IMPORTS
import _ from 'underscore';

import Stats from 'stats.js';
import * as dat from 'dat.gui';

import {TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';

import data from '../../assets/data/introImages.json';
import CursorComponent from './CursorComponent';
import ScrollModule from '../modules/ScrollModule';

// EXAMPLE
class CanvasComponent {

  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler',
      '_wheelHandler',
      '_updateIndex',
      '_onCloseCompleteHandler',
      '_onOpenCompleteHandler'
    );
    
    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this.ui = {
      section: document.querySelector('.js-section-canvas')
    }

    this.component = {};
    this.component.cursor = new CursorComponent({ el: this._canvas });

    this._settings = {
      imagesAmount: 10,
      wheelSensibility: 20
    }

    const gui = new dat.GUI({
      closed: true
    });

    gui.add(this._settings, 'imagesAmount', 5, 500).step(1);
    gui.add(this._settings, 'wheelSensibility', 1, 100).step(1);

    this._scrollDelta = {
      x: 0,
      y: 0
    }

    this._isScrollEnabled = true;

    this._tweenObject = {
        currentIndex: 0,
        index: 0,
        startAngle: Math.PI/2, 
        arcAngle: 0
    }

    this._colors = [
        {
            primary: '#faf3e1',
            secondary: '#121212'
        },
        {
            primary: '',
            secondary: ''
        },
        {
            primary: '',
            secondary: ''
        },
        {
            primary: '',
            secondary: ''
        }
    ];

    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);

    this._delta = 0;

    this._init();
  }

  _init() {
    this._resize();
    this._getSectionPosition();
    this._setColor();
    this._initPositions();

    this._loadImages();
  }

  _setColor() {
    this._canvas.style.backgroundColor = this._colors[this._tweenObject.index].primary;
    document.body.style.color = this._colors[this._tweenObject.index].secondary;
  }

  _initPositions() {
    this._circleRadius = this._width/5;
    let limit = this._settings.imagesAmount;

    this._rotationAngles = [];
    this._positions = [];

    this._origin = {
      x: this._container.right - this._getNumber(this._container.padding),
      y: this._container.top
    }

    this._startAngle = Math.PI / 2;
    this._arcAngle = 0;

    for (let i = 0; i <= limit; i++) {
      let value = i/limit;
      let angle =  (value * this._arcAngle) + this._startAngle;
      this._rotationAngles.push(- angle); 
    } 

    for (let i = 0; i < this._rotationAngles.length; i++) {
      let posX = this._origin.x +  Math.cos(this._rotationAngles[i]) * this._circleRadius;
      let posY = this._origin.y + Math.sin(this._rotationAngles[i]) * this._circleRadius + this._circleRadius;
    
      let position = { x: posX, y: posY }

      this._positions.push(position);
    }
  }

  _createCircleRuler() {
    let cirlceRadius = this._width/4;

    this._ctx.strokeStyle = 'black';
    
    this._ctx.beginPath();
    this._ctx.arc(this._origin.x, this._origin.y, cirlceRadius, 0, Math.PI * 2);
    this._ctx.stroke();
    this._ctx.closePath();
    
    this._ctx.fillStyle = 'red';

    this._ctx.beginPath();
    this._ctx.arc(this._origin.x, this._origin.y, 5, 0, Math.PI * 2);
    this._ctx.fill();
    this._ctx.closePath();
  }

  _next() {
    this._closeImage();
  }

  _previous() {
    console.log('TODO: Previous Animation');
  }

  _closeImage() {
    const duration = 1.5;

    this._timelineClose = new TimelineMax({
      paused: false,
      onComplete: this._onCloseCompleteHandler
    });

    this._timelineClose.to(this._tweenObject, duration, {arcAngle: Math.PI/2, ease: Power3.easeIn}, 0);
    this._timelineClose.to(this._tweenObject, duration, {startAngle: Math.PI, ease: Power2.easeInOut}, duration/2);
  }

  _onCloseCompleteHandler() {
    this._updateIndex();
    this._openImage();
  }

  _openImage() {
    const duration = 1.5;

    this._timelineOpen = new TimelineMax({
      onComplete: this._onOpenCompleteHandler
    });

    this._timelineOpen.fromTo(this._tweenObject, duration, {startAngle: 0, arcAngle: 0}, {startAngle: Math.PI/2, ease: Power2.easeInOut}, 0);
  }

  _onOpenCompleteHandler() {
    this._isScrollEnabled = true;
  }

  _updatePositions() {
    let limit = this._settings.imagesAmount;

    this._origin = {
      x: this._container.right - this._getNumber(this._container.padding),
      y: this._container.top
    }

    this._startAngle = this._tweenObject.startAngle;
    this._arcAngle = this._tweenObject.arcAngle; 

    for (let i = 0; i <= limit; i++) {
      let value = i/limit;
      let angle =  (value * this._arcAngle) + this._startAngle;
      this._rotationAngles[i] = - angle; 
    } 

    for (let i = 0; i < this._rotationAngles.length; i++) {
      let posX = this._origin.x +  Math.cos(this._rotationAngles[i]) * this._circleRadius;
      let posY = this._origin.y + Math.sin(this._rotationAngles[i]) * this._circleRadius + this._circleRadius;
    
      let position = { x: posX, y: posY }

      this._positions[i] = position;
    }
  }

  _updateIndex() {
    this._tweenObject.index += 1;
  }

  _loadImages() {
    let path = './assets/images/';
    let promises = [];
    let img;
    
    for (let i = 0; i < data.length; i++) {
      let url = `${path}${data[i].fileName}`;
      img = new Image();
      img.src = url;
      let promise = new Promise((resolve, reject) => {
        img.addEventListener('load', resolve(img));
        img.addEventListener('error', () => {
          reject(new Error(`Failed to load image's URL: ${url}`));
        });
      });
      promises.push(promise);
    }

    Promise.all(promises).then(result => {
      this._images = result;  
      this._start();
    });
  }

  _start() {
    this._setupEventListener();
  }

  _createImages() {
    const width = this._width/3.1;
    const aspectRatio = this._images[this._tweenObject.index].width / this._images[this._tweenObject.index].height;
    const height = width / aspectRatio; 

    for (let i = 0; i < this._positions.length; i++) {
      this._ctx.setTransform(1, 0, 0, 1, this._positions[i].x, this._positions[i].y + height); 
      this._ctx.rotate(this._rotationAngles[i] + (Math.PI/2));
      this._ctx.drawImage(this._images[this._tweenObject.index], - width, - height, width, height);
      this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

  }

  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    this._createImages();
    // this._createCircleRuler();

    this._updatePositions();

    this._delta += 0.001;
  }

  _resize() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _getSectionPosition() {
    this._container = {
      left: this.ui.section.getBoundingClientRect().left,
      top: this.ui.section.getBoundingClientRect().top,
      right: this.ui.section.getBoundingClientRect().right,
      bottom: this.ui.section.getBoundingClientRect().bottom,
      padding: window.getComputedStyle(this.ui.section).paddingLeft
    }
  }

  _scrollManager(e) {
    this._scrollVelocity = e.deltaY * this._settings.scrollVelocityFactor;
  }

  _getNumber(string) {
    return parseInt(string.substring(0, string.length - 2))
  }

  _setupEventListener() {
    TweenLite.ticker.addEventListener('tick', this._tickHandler);

    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('mousemove', this._mousemoveHandler);

    ScrollModule.addEventListener('wheel', this._wheelHandler);
    ScrollModule.addEventListener('wheel:end', this._wheelEndHandler);
  }

  _tickHandler() {
    this._stats.begin();//STATS
    
    this._draw();
    
    this._stats.end();//STATS
  }

  _resizeHandler() {
    this._resize();
    this._getSectionPosition();
    this._initPositions();
  }

  _wheelHandler(e) {
    this._scrollDelta.x = ScrollModule.getWheelDelta().x;
    this._scrollDelta.y = ScrollModule.getWheelDelta().y;

    if (this._scrollDelta.y > this._settings.wheelSensibility && this._isScrollEnabled == true) {
      this._next();
      this._isScrollEnabled = false;
    } else if (this._scrollDelta.y <  - this._settings.wheelSensibility && this._isScrollEnabled == true) {
      this._previous();
      this._isScrollEnabled = false;
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
    this.component.cursor.move(this._mousePosition);
  }
}

export default new CanvasComponent();