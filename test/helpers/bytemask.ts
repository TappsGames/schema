export function applyByteMask(bytes: number[]) {
    for (let ii = bytes.length-1; ii >= 0; ii--) {
        bytes[ii] = bytes[ii] & 0xFF;
    }
    return bytes;
}
