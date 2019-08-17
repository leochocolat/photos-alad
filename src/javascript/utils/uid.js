let uidcounter = 0;

class UID {
    static get() {
        return 'm' + ++uidcounter;
    }
}

export default UID;