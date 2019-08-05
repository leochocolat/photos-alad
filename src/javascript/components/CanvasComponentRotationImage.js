//IMPORTS
import _ from 'underscore';
import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
import Stats from 'stats.js';
import Lerp from '../utils/Lerp.js';
import data from '../../assets/data/introImages.json';
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

    this._settings = {
      scrollVelocityFactor: 0.001,
      marginFactor: 0.5
    }

    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);

    this._init();
  }

  _init() {
    this._resize();

    this._cursorPostion = {
      x: this._width/2,
      y: this._height/2
    }

    this._loadImages();
  }
  
  _start() {
    this._initAngles();
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

  _initAngles() {
      this._rotationAngles = []; 
      let limit = data.length;
      for (let i = 0; i < limit; i++) {
        let value = i/limit;
        let angle = value * Math.PI * 2;
        this._rotationAngles.push(angle);
      }
  }

  _drawCircle() {    
    let limit = 10;
    let radius = 300;
    let width = 350;
    
    for (let i = 0; i < data.length; i++) {
      let posX = (Math.cos(this._rotationAngles[i]) * radius/1) + (this._width/2);
      let posY = (Math.sin(this._rotationAngles[i]) * radius/1) + (this._height/0.9);

      let aspectRatio = this._images[i].width / this._images[i].height
      let img = {
        width: width,
        height: width / aspectRatio,
      }
      
      this._ctx.setTransform(1, 0, 0, 1, posX, posY); 

      this._ctx.rotate(Math.cos(this._rotationAngles[i]));

      this._ctx.drawImage(this._images[i], -img.width/2, -img.height/2, img.width, img.height);

      this._ctx.setTransform(1, 0, 0, 1, 0, 0);

    }
  }


  _createCursor() {
    const radius = 20;

    this._ctx.strokeStyle = 'white';
    this._ctx.fillStyle = 'transparent';
    this._ctx.lineWidth = 1;

    this._ctx.beginPath();
    this._ctx.arc(this._cursorPostion.x, this._cursorPostion.y, radius, 0, 2 * Math.PI);
    this._ctx.stroke();
    this._ctx.fill();
    this._ctx.closePath();
  }

  _updatePositions() {
    if (!this._isScrolling) return;

    for (let i = 0; i < this._rotationAngles.length; i++) {
      this._rotationAngles[i] += this._scrollVelocity;
    }
  }

  _scrollManager(e) {
      this._scrollVelocity = e.deltaY * this._settings.scrollVelocityFactor;
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
    
    this._drawCircle();

    this._createCursor();
    this._updateCursorPosition();
    
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

    window.addEventListener('mousewheel', this._wheelHandler);
  }

  _tickHandler() {
    this._stats.begin();//STATS
    
    this._draw();
    
    this._stats.end();//STATS
  }

  _resizeHandler() {
    this._resize();
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