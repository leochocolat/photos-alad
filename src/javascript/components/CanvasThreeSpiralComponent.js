import _ from 'underscore';

import {TweenMax, TimelineLite, TweenLite, Power0, Power3} from 'gsap/TweenMax';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// data
import data from '../../assets/data/data.json'; 
import TextureLoader from '../utils/TextureLoader.js';

//utils
class CanvasThreeComponent {

    constructor() {
        _.bindAll(
            this,
            '_tickHandler',
            '_resizeHandler',
            '_setupControls',
            '_init',
            '_wheelHandler',
            '_mousemoveHandler'
        );

        this._settings = {
            interval: 30,
            controls: {
                enabled: false,
                zoomSpeed: 0.2,
                autoRotate: false
            },
            camera: {
                position: {
                    x: 0,
                    y: 0,
                    z: 40
                }
            },
            allowCameraAnimation: false,
            animationSpeed: 1,
            scrollVelocityFactor: 0.04
        }

        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);

        const gui = new dat.GUI();

        gui.add(this._settings, 'allowCameraAnimation');
        gui.add(this._settings, 'animationSpeed', 1, 10,1).step(1);
        gui.add(this._settings, 'scrollVelocityFactor', 0.01, 0.20).step(0.001);
        gui.add(this._settings.controls, 'enabled').onChange(this._setupControls);
        gui.add(this._settings.controls, 'zoomSpeed', 0.1, 1).step(0.1).onChange(this._setupControls);
        gui.add(this._settings.controls, 'autoRotate').onChange(this._setupControls);


        this._canvas = document.querySelector('.js-canvas-component');
        this._delta = 0;
        this._init();
    }

    _init() {
        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this._INTERSECTED;
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(50, this._width/this._height, 1, 10000);    
        this._camera.position.x = this._settings.camera.position.x;
        this._camera.position.y = this._settings.camera.position.y;
        this._camera.position.z = this._settings.camera.position.z;
        this._camera.lookAt(0, 0, 0);
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas, 
            antialias: true,
            alpha: true
        });
        this._renderer.setClearColor(0xffffff, 0);
        this._setupEventListener();
        this._resize();
        this._initAngles();
        this._initPositions();
        this._loadTextures();
        this._setupControls();
    }


    _loadTextures() {
        let path = './assets/images/';
        let promises = [];
        let texture;
        
        for (let i = 0; i < data.length; i++) {
            let image = `${path}${data[i].fileName}`;
            let promise = 
            new Promise(resolve => {
                texture = new THREE.TextureLoader().load(image, resolve);
            });
            promises.push(promise);
        }

        Promise.all(promises).then(result => {
            this._textures = result;
            this._build();
        });
    }

    _initAngles() {
        this._rotationAngles = []; 
        let limit = data.length;
        for (let i = 0; i < limit; i++) {
          let value = i/limit;
          let angle = value * Math.PI * 10;
          this._rotationAngles.push(angle);
        }
    }

    _initPositions() {
        const radius = 20;

        this._positions = [];

        for (let i = 0; i < data.length; i++) {
            let pos = {
                x: (Math.cos(this._rotationAngles[i]) * radius/1),
                y: (Math.sin(this._rotationAngles[i]) * radius/1)
            } 
            this._positions.push(pos);
        }
    }

    _build() {
        this._planes = [];
        this._geometry = new THREE.PlaneGeometry(20, 25);

        for (let i = 0; i < data.length; i++) {
            let material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: this._textures[i],
                transparent: true,
                opacity: 0
            });
            
            let plane = new THREE.Mesh(this._geometry, material);
            plane.position.x = this._positions[i].x;
            plane.position.y = this._positions[i].y;
            plane.position.z = - i * 10;
            this._planes.push(plane);

            this._transitionIn(material);

            this._addMeshesToScene(plane);
        }

    }

    _transitionIn(material) {
        TweenLite.to(material, 1, {opacity: 1, ease: Power3.easeInOut});
    }

    _updateScrollPosition() {
        if (!this._isScrolling) return;
        
        this._camera.position.z += this._scrollVelocity * 0.1;
        this._scene.rotation.z += this._scrollVelocity * 0.01;

    }

    _findIntersections() {
        this._raycaster.setFromCamera(this._mouse, this._camera);
        let intersect = this._raycaster.intersectObjects(this._scene.children);

        if (intersect.length > 0) {
        }

    }

    _draw() {
        if (this._settings.controls.autoRotate) {
            console.log(this._camera.position);
        }
        if (this._settings.allowCameraAnimation) {
            this._delta += this._settings.animationSpeed / 1000;
            this._camera.position.z = 200 * Math.cos(this._delta);
        }

        this._updateScrollPosition();

        this._findIntersections();

        this._renderer.render(this._scene, this._camera);
    }

    _addMeshesToScene(mesh) {
        this._scene.add(mesh);
    }

    _setupControls() {
        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.enabled = this._settings.controls.enabled;
        this._controls.zoomSpeed = this._settings.controls.zoomSpeed;
        this._controls.autoRotate = this._settings.controls.autoRotate;
    }

    _tick() {
        this._stats.begin();
        

        this._draw();
        // this._controls.update();
        

        this._stats.end();
    }

    _resize() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._camera.aspect = this._width/this._height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height); 
    }

    _setupEventListener() {
        window.addEventListener('resize', this._resizeHandler);

        TweenLite.ticker.addEventListener('tick', this._tickHandler);

        window.addEventListener('mousewheel', this._wheelHandler);

        document.addEventListener('mousemove', this._mousemoveHandler);
    }

    _scrollManager(e) {
        this._scrollVelocity = e.deltaY * this._settings.scrollVelocityFactor;
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
        //TODO: ADJUST TIMING WITH SCROLL VELOCITY
        this._scrollTween = TweenMax.to(this, 0.3, { _scrollVelocity: 0, ease: Power0.easeNone });
    }

    _mousemoveHandler(e) {
        this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    }

    _tickHandler() {
        this._tick();
    }

    _resizeHandler() {
        this._resize();
    }

}

export default new CanvasThreeComponent();