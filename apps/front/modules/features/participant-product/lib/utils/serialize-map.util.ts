export function serializeMap<T>(map: Map<number, T>): Record<string, T> {
    const obj: Record<string, T> = {};
    for (const [key, value] of map.entries()) {
        obj[key.toString()] = value;
    }
    return obj;
}

export function deserializeMap<T>(obj: Record<string, T>): Map<number, T> {
    const map = new Map<number, T>();
    for (const key in obj) {
        const value = obj[key];
        if (value !== undefined) {
            map.set(Number(key), value);
        }
    }
    return map;
}
