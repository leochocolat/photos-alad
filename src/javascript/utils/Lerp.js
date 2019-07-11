class Lerp {
    lerp(start, end, value) {
        return (1 - value) * start+ value * end;
    }
}

export default new Lerp();