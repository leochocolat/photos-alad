//IMPORTS
import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';
// EXAMPLE
class CanvasComponent {

  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler',
      '_mousewheelHandler'
    );
    
    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this._settings = {
      scrollVelocity: 0.5
    }

    this._init();
  }

  _init() {
    this._resize();

    this._cursorPostion = {
      x: this._width/2,
      y: this._height/2
    }

    this._initRectanglePositions();
    this._setupEventListener();
  }

  _initRectanglePositions() {
    const number = 100;
    const width = 300;
    const height = 400;
    this._margin = 50;
    
    this._rectangles = [];
    for (let i = 0; i <= number; i++) {
      let rectangle = {
        width: width,
        height: height,
        position: {
          x: (width * i) - (width / 2) + i * this._margin,
          y: (this._height / 2) - (height / 2)
        }
      }
      this._rectangles.push(rectangle)
    }

  }

  _createCursor() {
    const radius = 20;

    this._ctx.fillStyle = 'transparent';
    this._ctx.strokeStyle = 'white';
    this._ctx.lineWidth = 1;

    this._ctx.beginPath();
    this._ctx.arc(this._cursorPostion.x, this._cursorPostion.y, radius, 0, 2 * Math.PI);
    this._ctx.stroke();
    this._ctx.fill();
    this._ctx.closePath();
  }

  _createRectangles() {
    
    this._gradient = this._ctx.createLinearGradient(0, 0, this._width, 0);
    this._gradient.addColorStop(0, '#7ff7ad');
    this._gradient.addColorStop(0.5, '#629df8');
    this._gradient.addColorStop(1, '#d32daf');

    for (let i = 0; i < this._rectangles.length; i++) {
      this._ctx.fillStyle = this._gradient;
      this._ctx.fillRect(this._rectangles[i].position.x, this._rectangles[0].position.y, this._rectangles[i].width, this._rectangles[i].height );
    }

  } 

  _updateRectanglesPositions() {
    if (!this._isScrolling) return;

    for (let i = 0; i < this._rectangles.length; i++) {
      this._rectangles[i].position.x += this._scrollVelocity;
    }
  }

  _scrollManager(e) {
      this._scrollVelocity = e.deltaY * this._settings.scrollVelocity;
  }

  _updateCursorPosition(e) {
      if(!this._mousePosition) return;

      this._cursorPostion = {
        x: Lerp.lerp(this._cursorPostion.x, this._mousePosition.x, 0.1),
        y: Lerp.lerp(this._cursorPostion.y, this._mousePosition.y, 0.1)
      };
  }


  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._createRectangles();

    this._createCursor();

    this._updateCursorPosition();

    this._updateRectanglesPositions();
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
    window.addEventListener('mousewheel', this._mousewheelHandler);
  }

  _tickHandler() {
    this._draw();
  }

  _resizeHandler() {
    this._resize();
  }

  _mousewheelHandler(e) {
    this._scrollManager(e);

    if (this._scrollTween) {
      this._scrollTween.kill();
    }
    
    this._isScrolling = true;
    
    clearTimeout(this._mouseWheelTimeout);
    this._mouseWheelTimeout = setTimeout(() => {
      this._scrollTween = TweenMax.to(this, 0.3, { _scrollVelocity: 0, ease: Power0.easeNone });
    }, 100);

  }

  _mousemoveHandler(e) {
    this._mousePosition = {
      x: e.clientX,
      y: e.clientY
    }
  }

}


export default new CanvasComponent();