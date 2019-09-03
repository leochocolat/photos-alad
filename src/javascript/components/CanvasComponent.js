//IMPORTS
import _ from 'underscore';

import Stats from 'stats.js';
import * as dat from 'dat.gui';

import {TimelineLite, TweenLite} from 'gsap/TweenMax';

import data from '../../assets/data/introImages.json';
import CursorComponent from './CursorComponent';
import ScrollModule from '../modules/ScrollModule';
import GestureManager from '../modules/GestureManager';
import ScrollCirlceComponent from './ScrollCirlceComponent';

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
      '_onTweenUpdateHandler',
      '_initPositions',
      '_gestureHandler',
      '_gestureEndHandler'
    );
    
    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this.ui = {
      section: document.querySelector('.js-section-canvas'),
      color: document.querySelectorAll('.js-color-secondary'),
      background: document.querySelectorAll('.js-bg-secondary')
    }

    this.component = {};
    this.component.cursor = new CursorComponent({ el: this._canvas });
    this.component.scrollIndicator = new ScrollCirlceComponent();

    this._scrollDelta = {
      x: 0,
      y: 0
    }

    this._gestureDelta = {
      x: 0,
      y: 0
    }

    this._mousePosition = {
      x: 0,
      y: 0
    }

    this._isScrollEnabled = true;

    this._settings = {
      imagesAmount: 10,
      wheelSensibility: 20,
      radiusFactor: 9,
      imageScale: 0.31
    }

    const gui = new dat.GUI({ closed: true });
    gui.add(this._settings, 'wheelSensibility', 1, 100).step(1);
    gui.add(this._settings, 'imagesAmount', 5, 200).step(1).onChange(this._initPositions);;
    gui.add(this._settings, 'radiusFactor', -10, 10).step(0.5).onChange(this._initPositions);
    gui.add(this._settings, 'imageScale', 0.01, 5).step(0.01);

    this._tweenObject = {
        currentIndex: 0,
        index: 0,
        nextIndex: 1,
        tweenProgress: 0,
        angles: [
          {
            startAngle: Math.PI/2, 
            arcAngle: 0
          },
          {
            startAngle: 0, 
            arcAngle: Math.PI/10,
          }
        ]
    }

    this._colors = [
      {
        primary: '#faf3e1',
        secondary: '#121212'
      },
      {
        primary: '#121212',
        secondary: '#faf3e1'
      },
      {
        primary: '#faf3e1',
        secondary: '#121212'
      },
      {
        primary: '#121212',
        secondary: '#faf3e1'
      },
      {
        primary: '#faf3e1',
        secondary: '#121212'
      },
      {
        primary: '#121212',
        secondary: '#faf3e1'
      },
    ];

    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);

    this._init();
  }

  _init() {
    this._resize();
    this._getSectionPosition();
    this._setColor();
    this.component.scrollIndicator.setColor(this._colors[0].secondary);
    this.component.cursor.setColor(this._colors[0].secondary);

    this._initPositions();

    this._loadImages();
  }

  _start() {
    this._setupTween();
    this._setupEventListener();
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

  _setColor() {
    TweenLite.set(this._canvas.style, { backgroundColor: this._colors[this._tweenObject.index].primary });
    TweenLite.set(this.ui.color, { color: this._colors[this._tweenObject.index].secondary });
    TweenLite.set(this.ui.background, { backgroundColor: this._colors[this._tweenObject.index].secondary });
  }

  _initPositions() {
    this._circleRadius = this._width/5 * this._settings.radiusFactor;
    let limit = this._settings.imagesAmount;

    this._origin = {
      x: this._container.right - this._getNumber(this._container.padding),
      y: this._container.top
    }

    let slideNumber = 2;

    this._slides = [];

    for (let n = 0; n < slideNumber; n++) {
      let angles = [];
      let positions = [];

      for (let i = 0; i <= limit; i++) {
        let value = i/limit;
        let angle = (value * this._tweenObject.angles[n].arcAngle) + this._tweenObject.angles[n].startAngle;
        angles.push(- angle);
      } 

      for (let i = 0; i < angles.length; i++) {
        let posX = this._origin.x +  Math.cos(angles[i]) * this._circleRadius;
        let posY = this._origin.y + Math.sin(angles[i]) * this._circleRadius + this._circleRadius;
      
        let position = { x: posX, y: posY }
        positions.push(position);
      }

      this._slides.push({ angles: angles, positions: positions })
    }
  }

  _createImages() {
    const width = this._width * this._settings.imageScale;

    //current Index
    const aspectRatio1 = this._images[this._tweenObject.index].width / this._images[this._tweenObject.index].height;
    const height1 = width / aspectRatio1;

    for (let i = 0; i < this._slides[0].positions.length; i++) {
      this._ctx.setTransform(1, 0, 0, 1, this._slides[0].positions[i].x, this._slides[0].positions[i].y + height1); 
      this._ctx.rotate(this._slides[0].angles[i] + (Math.PI/2));
      this._ctx.drawImage(this._images[this._tweenObject.index], - width, - height1, width, height1);
      this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    //next Index
    const aspectRatio2 = this._images[this._tweenObject.nextIndex].width / this._images[this._tweenObject.nextIndex].height;
    const height2 = width / aspectRatio2;

    for (let i = 0; i < this._slides[1].positions.length; i++) {
      this._ctx.setTransform(1, 0, 0, 1, this._slides[1].positions[i].x, this._slides[1].positions[i].y + height2); 
      this._ctx.rotate(this._slides[1].angles[i] + (Math.PI/2));
      this._ctx.drawImage(this._images[this._tweenObject.nextIndex], - width, - height2, width, height2);
      this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  /*
    TWEENS : TODO TIMING
  */
  _setupTween() {
    const duration = 1;

    this._timeline = new TimelineLite({ paused: true });

    this._timeline.fromTo(this._tweenObject.angles[0], duration, {arcAngle: 0}, {arcAngle: Math.PI/2, ease: Power3.easeIn}, 0);
    this._timeline.fromTo(this._tweenObject.angles[0], duration, {startAngle: Math.PI/2}, {startAngle: Math.PI, ease: Power2.easeInOut}, duration/2);
    this._timeline.fromTo(this._tweenObject.angles[1], duration*1.5, {startAngle: 0}, {startAngle: Math.PI/2, ease: Power2.easeInOut}, 0);
    this._timeline.fromTo(this._tweenObject.angles[1], duration*1.5, {arcAngle: Math.PI/10}, {arcAngle: 0, ease: Power2.easeInOut}, 0);
  }

  _closeImage() {
    let duration = 2.5;

    let timeline = new TimelineLite({
      onUpdate: this._onTweenUpdateHandler,
      onComplete: this._onCloseCompleteHandler
    });

    timeline.to(this._tweenObject, duration, { tweenProgress: 1, ease: Power0.easeNone })
  }

  /*
    UPDATE FUNCTIONS
  */
  _updateColor() {
    const duration = 0.5; 
    const delay = 0;

    TweenLite.to(this._canvas.style, duration, { backgroundColor: this._colors[this._tweenObject.index].primary, delay: delay });
    TweenLite.to(this.ui.color, duration, { color: this._colors[this._tweenObject.index].secondary, delay: delay });
    TweenLite.to(this.ui.background, duration, { backgroundColor: this._colors[this._tweenObject.index].secondary, delay: delay });

    setTimeout(() => {
      this.component.scrollIndicator.updateColor(this._colors[this._tweenObject.index].secondary);
      this.component.cursor.updateColor(this._colors[this._tweenObject.index].secondary);
    }, delay * 1000);
  }

  _updatePositions() {
    let limit = this._settings.imagesAmount;

    let slideNumber = 2;

    this._slides = [];

    for (let n = 0; n < slideNumber; n++) {
      let angles = [];
      let positions = [];

      for (let i = 0; i <= limit; i++) {
        let value = i/limit;
        let angle = (value * this._tweenObject.angles[n].arcAngle) + this._tweenObject.angles[n].startAngle;
        angles.push(- angle);
      } 

      for (let i = 0; i < angles.length; i++) {
        let posX = this._origin.x +  Math.cos(angles[i]) * this._circleRadius;
        let posY = this._origin.y + Math.sin(angles[i]) * this._circleRadius + this._circleRadius;
      
        let position = { x: posX, y: posY }
        positions.push(position);
      }

      this._slides.push({ angles: angles, positions: positions })
    }
  }

  _updateIndex() {
    let index = this._tweenObject.index + 1;
    this._tweenObject.index = this._mod(index, data.length);
    this._tweenObject.nextIndex = this._mod(index + 1, data.length);
  }

  /*
    TRIGGERs
  */
  _next() {
    this._closeImage();
  }

  _previous() {
    
  }

  /*
    TICKER/RESIZE
  */
  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    this._createImages();
    this.component.cursor.createCursors();
    this.component.cursor.updateCursors();

    this._updatePositions();
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

    ScrollModule.addEventListener('wheel', this._wheelHandler);
    ScrollModule.addEventListener('wheel:end', this._wheelEndHandler);

    GestureManager.addEventListener('gesture', this._gestureHandler);
    GestureManager.addEventListener('gesture:end', this._gestureEndHandler);
  }

  /*
    HANDLER
  */
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
    }
  }
  
  _wheelEndHandler() {
    this._scrollDelta.x = ScrollModule.getWheelDelta().x;
    this._scrollDelta.y = ScrollModule.getWheelDelta().y;
  }

  _gestureHandler() {
    this._gestureDelta.x = GestureManager.getGesture().x;
    this._gestureDelta.y = GestureManager.getGesture().y;

    this._tweenObject.tweenProgress = - this._gestureDelta.x * 0.001;
    this._timeline.progress(this._tweenObject.tweenProgress);
  }

  _gestureEndHandler() {
    if ( this._gestureDelta.x < 100 ) {
      this._next()
    }
    if ( this._gestureDelta.x > 100 ) {
      this._previous()
    }
  }

  _mousemoveHandler(e) {
    this._mousePosition = {
      x: e.clientX,
      y: e.clientY
    }
    this.component.cursor.move(this._mousePosition);
  }

  _onTweenUpdateHandler() {
    this._timeline.progress(this._tweenObject.tweenProgress);
    this.component.cursor.progress(this._timeline.progress());
  }
  
  _onCloseCompleteHandler() {
    this._tweenObject.tweenProgress = 0;
    this._timeline.progress(this._tweenObject.tweenProgress);
    this._updateIndex();
    this._updateColor();
    this._isScrollEnabled = true;
  }

  /*
    UTILS
  */
 _getSectionPosition() {
  this._container = {
    left: this.ui.section.getBoundingClientRect().left,
    top: this.ui.section.getBoundingClientRect().top,
    right: this.ui.section.getBoundingClientRect().right,
    bottom: this.ui.section.getBoundingClientRect().bottom,
    padding: window.getComputedStyle(this.ui.section).paddingLeft
  }
}

  _mod(n, m) {
    return ((n % m) + m) % m;
  }

  _getNumber(string) {
    return parseInt(string.substring(0, string.length - 2))
  }
}

export default new CanvasComponent();