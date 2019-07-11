//IMPORTS
import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite} from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';
// EXAMPLE
class CanvasComponent {

  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler'
    );

    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this._init();
  }

  _init() {
    this._resize();

    this._ballPosition = {
      x: this._width/2,
      y: this._height/2
    }

    this._setupEventListener();
  }

  _resize() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._createBall();
    this._updatePositions();
  }

  _createBall() {
    this._ctx.fillStyle = 'transparent';
    this._ctx.strokeStyle = "black";
    this._ctx.lineWidth = 2;

    this._ctx.beginPath();
    this._ctx.arc(this._ballPosition.x, this._ballPosition.y, 50, 0, 2 * Math.PI);
    this._ctx.stroke();
    this._ctx.fill();
  }

  _updatePositions(e) {
      if(!this._mousePosition) return;

      this._ballPosition = {
        x: Lerp.lerp(this._ballPosition.x, this._mousePosition.x, 0.1),
        y: Lerp.lerp(this._ballPosition.y, this._mousePosition.y, 0.1)
      };
  }

  _setupEventListener() {
    TweenLite.ticker.addEventListener('tick', this._tickHandler);

    window.addEventListener('resize', this._resizeHandler);

    window.addEventListener('mousemove', this._mousemoveHandler);
  }

  _tickHandler() {
    this._draw();
  }

  _resizeHandler() {
    this._resize();
  }

  _mousemoveHandler(e) {
    this._mousePosition = {
      x: e.clientX,
      y: e.clientY
    }
  }

}


export default new CanvasComponent();