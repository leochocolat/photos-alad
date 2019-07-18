import _ from 'underscore';

import { TweenLite } from 'gsap/TweenLite';
import * as THREE from 'three';
// import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//utils
class CanvasThreeComponent {

    constructor() {
        _.bindAll(
            this,
            '_tickHandler',
            '_resizeHandler'
        );

        this._canvas = document.querySelector('.js-canvas-component');
    
        this._init();
    }

    _init() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, this._width/this._height, 1, 10000); 
        this._camera.position.y = 10;//Look Down   
        this._camera.lookAt(0, 0, 0);
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas, 
            antialias: true,
        });
        this._setupEventListener();
        this._resize();
        // this._loadTexture();
        this._build();
        this._setupLights();
        this._setupControls();
        
        console.log('NOISE');
    }

    // _loadTexture() {
    //     this._image = 'assets/img/noise.jpg';
    //     return new Promise(resolve => {
    //         this._texture = new THREE.TextureLoader().load(this._image, resolve);
    //     }).then(() => {
    //         this._build();
    //     });
    // },

    _build() {
        this._material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
        });

        this._geometry = new THREE.PlaneGeometry(20, 20);

        this._plane = new THREE.Mesh(this._geometry, this._material);
        this._plane.emissive = new THREE.Color(0x0000ff);
        this._plane.emissiveIntensity = 1;
        this._plane.position.set(0, 0, 0);
        this._plane.rotation.x = -1.55;

        this._addMeshesToScene();
    }

    _setupLights() {
        this._frontLight = new THREE.DirectionalLight(0xffffff, 1);
        this._frontLight.position.set(0, 0, 1000);
        this._backLight = new THREE.DirectionalLight(0xffffff, 1);
        this._backLight.position.set(0, 0, -1000);
        this._leftLight = new THREE.DirectionalLight(0xffffff, 1);
        this._leftLight.position.set(-1000, 0, 0);
        this._rightLight = new THREE.DirectionalLight(0xffffff, 1);
        this._rightLight.position.set(1000, 0, 0);
        this._bottomLight = new THREE.DirectionalLight(0xffffff, 1);
        this._bottomLight.position.set(0, -1000, 0);
        this._topLight = new THREE.DirectionalLight(0xffffff, 1);
        this._topLight.position.set(0, 1000, 0);

        this._addLightsToScene();
    }

    _draw() {
        this._renderer.render(this._scene, this._camera);
    }

    _addMeshesToScene() {
        this._scene.add(this._plane);
    }

    _addLightsToScene() {
        this._scene.add(this._frontLight);
        this._scene.add(this._backLight);
        this._scene.add(this._leftLight);
        this._scene.add(this._rightLight);
        this._scene.add(this._bottomLight);
        this._scene.add(this._topLight);
    }

    _setupControls() {
        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    }

    _tick() {
        this._draw();
        this._controls.update();
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
    }

    _tickHandler() {
        this._tick();
    }

    _resizeHandler() {
        this._resize();
    }

}

export default new CanvasThreeComponent();