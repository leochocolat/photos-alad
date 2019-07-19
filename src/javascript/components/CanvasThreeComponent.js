import _ from 'underscore';

import { TweenLite } from 'gsap/TweenLite';
import * as THREE from 'three';
import * as dat from 'dat.gui';
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
            '_resizeHandler'
        );

        this._settings = {
            interval: 20,
            controls: {
                enabled: true,
                zoomSpeed: 0.2,
                autoRotate: false
            },
            allowCameraAnimation: false,
            animationSpeed: 1
        }

        const gui = new dat.GUI();

        gui.add(this._settings, 'interval', 10, 50).step(1);
        gui.add(this._settings, 'allowCameraAnimation');
        gui.add(this._settings, 'animationSpeed', 1, 10,1).step(1);

        let controlsFolder = gui.addFolder('controls');
        controlsFolder.add(this._settings.controls, 'enabled');
        controlsFolder.add(this._settings.controls, 'zoomSpeed', 0.1, 1).step(0.1);
        controlsFolder.add(this._settings.controls, 'autoRotate');

        this._canvas = document.querySelector('.js-canvas-component');
        this._delta = 0;
        this._init();

    }

    _init() {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(100, this._width/this._height, 1, 10000);    
        this._camera.position.z = 300;
        this._camera.lookAt(0, 0, 200);
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas, 
            antialias: false,
            alpha: true
        });
        this._renderer.setClearColor(0xffffff, 0);
        this._setupEventListener();
        this._resize();
        this._loadTextures();
        this._setupLights();
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
            console.log()
            this._build();
        });

    }

    _build() {
        this._geometry = new THREE.PlaneGeometry(20, 25);

        for (let i = 0; i < data.length; i++) {
            let material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: this._textures[i]
            });
            let plane = new THREE.Mesh(this._geometry, material);
            plane.position.z = this._settings.interval * i;
            this._addMeshesToScene(plane);
        }

        console.log(this._scene);
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

        if (this._settings.allowCameraAnimation) {
            this._delta += this._settings.animationSpeed / 1000;
            this._camera.position.z = 200 * Math.sin(this._delta);
        }

        this._renderer.render(this._scene, this._camera);
    }

    _addMeshesToScene(mesh) {
        this._scene.add(mesh);
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
        this._controls.enabled = this._settings.controls.enabled;
        this._controls.zoomSpeed = this._settings.controls.zoomSpeed;
        this._controls.autoRotate = this._settings.controls.autoRotate;
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