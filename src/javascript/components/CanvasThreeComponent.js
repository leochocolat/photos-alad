import _ from 'underscore';

import {TweenMax, TimelineLite, TweenLite, Power0} from 'gsap/TweenMax';
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
            '_wheelHandler'
        );

        this._settings = {
            interval: 30,
            controls: {
                enabled: false,
                zoomSpeed: 0.2,
                autoRotate: false
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
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(100, this._width/this._height, 1, 10000);    
        this._camera.position.z = 30;
        this._camera.position.x = -11;
        this._camera.lookAt(0, 0, 0);
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas, 
            antialias: true,
            alpha: true
        });
        this._renderer.setClearColor(0xffffff, 0);
        this._setupEventListener();
        this._resize();
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

    _build() {
        this._planes = [];
        this._geometry = new THREE.PlaneGeometry(20, 25);

        for (let i = 0; i < data.length; i++) {
            let material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: this._textures[i]
            });
            let plane = new THREE.Mesh(this._geometry, material);
            plane.position.x = this._settings.interval * i;
            this._planes.push(plane);
            this._addMeshesToScene(plane);
        }
    }

    _updateScrollPosition() {
        if (!this._isScrolling) return;

        for (let i = 0; i < this._scene.children.length; i++) {
            if (this._scene.children[i].type) {
                this._scene.children[i].rotation.z += this._scrollVelocity * 0.1;
                this._scene.children[i].position.x += this._scrollVelocity;
            }
        }
        
        // this._scene.position.x += this._scrollVelocity;
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

        this._renderer.render(this._scene, this._camera);
    }

    _addMeshesToScene(mesh) {
        this._scene.add(mesh);
        console.log(this._scene);
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
        this._controls.update();
        

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

    _tickHandler() {
        this._tick();
    }

    _resizeHandler() {
        this._resize();
    }

}

export default new CanvasThreeComponent();