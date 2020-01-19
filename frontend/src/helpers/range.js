export default function range(start, stop, step = 1) {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    const items = []
    for (let item = start; item < stop; item += step) {
        items.push(item);
    }
    return items;
}
