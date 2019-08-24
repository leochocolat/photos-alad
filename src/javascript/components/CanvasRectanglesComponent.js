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

    this._settings = {
      scrollVelocityFactor: 0.5,
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
    this._initPositions();
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

  _initPositions() {
    const number = 6;
    const width = 300;
    const height = 400;
    const margin = 50;
    
    this._rectangles = [];
    this._imgCollection = [];

    this._rotationAngles = []; 
    let limit = 10;

    for (let i = 0; i < limit; i++) {
      let value = i/limit;
      let angle = value * Math.PI * 2;
      this._rotationAngles.push(angle);
    }

    for (let i = 0; i <= number; i++) {
      let rectangle = {
        width: width,
        height: height,
        position: {
          x: (width * i) - (width / 2) +  i * margin,
          y: (this._height / 2) - (height / 2)
        }
      }
      let aspectRatio = this._images[i].width / this._images[i].height
      let img = {
        width: width,
        height: width / aspectRatio,
        position: {
          x: (width * i) - (width / 2) +  i * margin,
          y: (this._height / 2) - ((width / aspectRatio) / 2)
        }
      }
      this._rectangles.push(rectangle);
      this._imgCollection.push(img);
    }
  }

  //WORKING EXAMPLE DESTINATION-IN
  _testGCP() {
    this._gradient = this._ctx.createLinearGradient(0, 0, this._width, 0);
    this._gradient.addColorStop(0, '#7ff7ad');
    this._gradient.addColorStop(0.5, '#629df8');
    this._gradient.addColorStop(1, '#d32daf');

    this._ctx.fillStyle = this._gradient;
    this._ctx.fillRect(this._rectangles[2].position.x, this._rectangles[0].position.y, this._rectangles[2].width, this._rectangles[2].height );

    this._ctx.fillStyle = 'black';
    this._ctx.beginPath();
    this._ctx.arc(this._rectangles[2].position.x + 100, this._rectangles[0].position.y + 100, 100, 0 ,2 * Math.PI );
    this._ctx.fill();
    this._ctx.closePath();

    this._ctx.globalCompositeOperation = 'source-over';
  }
  
  _createStuff() {
    this._gradient = this._ctx.createLinearGradient(0, 0, this._width, 0);
    this._gradient.addColorStop(0, '#7ff7ad');
    this._gradient.addColorStop(0.5, '#629df8');
    this._gradient.addColorStop(1, '#d32daf');
    
    for (let i = 0; i < this._rectangles.length; i++) {
      // draw clip
      this._ctx.beginPath();
      this._ctx.fillStyle = this._gradient;
      this._ctx.fillRect(this._rectangles[i].position.x, this._rectangles[0].position.y, this._rectangles[i].width, this._rectangles[i].height );
      this._ctx.closePath();

      //draw image
      this._ctx.beginPath();
      this._ctx.drawImage(this._images[i], this._imgCollection[i].position.x, this._imgCollection[0].position.y, this._imgCollection[i].width, this._imgCollection[i].height);
      this._ctx.closePath();  
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
  

  _createActiveRectangle() {
    if(!this._activeRectangle) return;

    const index = this._activeRectangle;

    this._ctx.beginPath();
    this._ctx.strokeStyle = 'transparent';
    this._ctx.rect(this._rectangles[index].position.x, this._rectangles[index].position.y, this._rectangles[index].width, this._rectangles[index].height);
    this._ctx.stroke();
    this._ctx.closePath();
  }

  _updatePositions() {
    if (!this._isScrolling) return;

    for (let i = 0; i < this._rectangles.length; i++) {
      this._rectangles[i].position.x += this._scrollVelocity;
      this._imgCollection[i].position.x += this._scrollVelocity;
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
    
    this._createStuff();

    this._createCursor();
    this._updateCursorPosition();
    
    this._updatePositions();

    this._createActiveRectangle();
  }

  _resize() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _hitDetection(e) {
    const posX = e.clientX;
    const posY = e.clientY;

    for (let i = 0; i < this._rectangles.length; i++) {
      if ( posX > this._rectangles[i].position.x && posX < this._rectangles[i].position.x + this._rectangles[i].width && posY > this._rectangles[i].position.y && posY < this._rectangles[i].position.y + this._rectangles[i].height ) {
        this._activeRectangle = i;
      }
    }
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
    this._hitDetection(e);
  }
}

export default new CanvasComponent();