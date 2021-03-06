//IMPORTS
import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0, Power3} from 'gsap/TweenMax';
import ColorUtil from '../utils/ColorUtil';
// EXAMPLE
class ScrollCircleComponent {

  constructor() {

    _.bindAll(
      this,
      '_tickHandler'
    );

    this._tweenObject = {
      color: '#121212',
      cirlceProgress: 0
    }
  
    this.ui = {
      scollIndicator: document.querySelector('.js-scroll-indicator'),
      canvas: document.querySelector('.js-scroll-indicator-fill'),
      container: document.querySelector('.js-scroll-indicator-container')
    }

    this._canvas = this.ui.canvas;
    this._ctx = this._canvas.getContext('2d');

    this._delta = 0;

    this._setup();
  }

  _setup() {
    this._getStyle();
    this._resize();
    this._setupEventListeners();
  }

  _getStyle() {
    this._canvasPosition = {
      top: this.ui.canvas.getBoundingClientRect().top,
      left: this.ui.canvas.getBoundingClientRect().left
    }

    this._containerSize = {
      width: this.ui.container.getBoundingClientRect().width,
      height: this.ui.container.getBoundingClientRect().height
    }
  }

  setColor(color) {
    TweenLite.set(this._tweenObject, { color: color });
  }

  updateColor(color) {
    TweenLite.to(this._tweenObject, 0.5, { color: color });
  }

  progress(progress) {
    this._tweenObject.cirlceProgress = progress;
  }

  _drawArc() {
    let color = ColorUtil.HexaToRGB(this._tweenObject.color);

    this._ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`;
    this._ctx.beginPath();
    this._ctx.arc(this._width/2, this._height/2, this._cirlceWidth/2, 0, 2 * Math.PI);
    this._ctx.stroke();
    this._ctx.closePath();
  }
  
  _drawProgress() {  
    this._ctx.strokeStyle = this._tweenObject.color;
  
    this._ctx.beginPath();

    this._ctx.arc(this._width/2, this._height/2, this._cirlceWidth/2, 0, 2 * Math.PI * this._cirlceProgress);
    this._ctx.stroke();

    this._ctx.closePath();
  }

  _tick() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    this._delta += 0.02;
    this._cirlceProgress = Math.abs(Math.cos(this._delta));
    this._drawArc();
    this._drawProgress();
  }

  _resize() {
    this._width = this._containerSize.width;
    this._height = this._containerSize.height;

    this._cirlceWidth = this._width - 5;
    this._cirlceHeight = this._height - 5;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _setupEventListeners() {
    TweenLite.ticker.addEventListener('tick', this._tickHandler);
  }

  _tickHandler() {
    this._tick();
  }
}


export default ScrollCircleComponent;