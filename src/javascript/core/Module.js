import { EventDispatcher } from '../events/index.js';
import { UID } from '../utils/index.js';

class Module extends EventDispatcher {

    constructor(...args) {
        super(...args);
        this._uid = UID.get();
    }

}

export default Module;