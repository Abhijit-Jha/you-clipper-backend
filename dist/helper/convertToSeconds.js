"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSeconds = convertToSeconds;
function convertToSeconds(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}
