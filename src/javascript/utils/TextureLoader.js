import * as THREE from 'three';

class TextureLoader {

    loadTexture(image) {
        let texture;

        new Promise(resolve => {
            texture = new THREE.TextureLoader().load(image, resolve);
        }).then(() => {
            return texture;
        });
    }

}

export default new TextureLoader();