//IMPORTS
import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Stats from 'stats.js';
import Lerp from '../utils/Lerp.js';
import data from '../../assets/data/data.json';
// EXAMPLE
class CanvasComponent {

  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler',
      '_wheelHandler'
    );
    
    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this.ui = {
        section: document.querySelector('.js-section-canvas')
    }

    this._settings = {
      scrollVelocityFactor: 0.5,
      marginFactor: 0.5
    }

    this._tweenObject = {
        currentIndex: 0,
        index: 0
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
    // document.body.appendChild(this._stats.dom);

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
    let cirlceRadius = this._width/5;
    let limit = 70;

    this._rotationAngles = [];
    this._positions = [];

    this._origin = {
      x: this._container.right - this._getNumber(this._container.padding),
      y: this._container.top
    }

    for (let i = 0; i <= limit; i++) {
      let value = i/limit;
      let angle =  (value * (Math.PI / 10)) + (Math.PI / 2) ;
      this._rotationAngles.push(- angle);
    } 

    for (let i = 0; i < this._rotationAngles.length; i++) {
      let posX = this._origin.x +  Math.cos(this._rotationAngles[i]) * cirlceRadius;
      let posY = this._origin.y + Math.sin(this._rotationAngles[i]) * cirlceRadius + (cirlceRadius);

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
    const left = this._container.right - width - this._getNumber(this._container.padding);
    const top = this._container.top;
    const aspectRatio = this._images[this._tweenObject.index].width / this._images[this._tweenObject.index].height;
    const height = width / aspectRatio; 
    // this._ctx.drawImage(this._images[this._tweenObject.index], left, top, width, height);

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

    window.addEventListener('mousewheel', this._wheelHandler);
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
    if (this._scrollTween) {
      this._scrollTween.kill();
    }

    this._isScrolling = true;

    this._scrollManager(e);
    
    clearTimeout(this._mouseWheelTimeout);
    this._mouseWheelTimeout = setTimeout(() => {
      this._wheelEndHandler();
    }, 100);
  }

  _wheelEndHandler() {
    //Ease end of scroll
    //TODO: ADJUST TIMING WITH SCROLL VELOCITY
    this._scrollTween = TweenMax.to(this, 0.3, { _scrollVelocity: 0, ease: Power0.easeNone });
  }

  _mousemoveHandler(e) {
    this._mousePosition = {
      x: e.clientX,
      y: e.clientY
    }
  }
}

export default new CanvasComponent();