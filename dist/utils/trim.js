"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimVideo = trimVideo;
const promises_1 = __importDefault(require("fs/promises"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const convertToSeconds_1 = require("../helper/convertToSeconds");
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
if (ffmpeg_static_1.default)
    fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
function trimVideo(_a) {
    return __awaiter(this, arguments, void 0, function* ({ startTime, endTime, combinedVideoPath, videoId }) {
        const startTimeInSec = (0, convertToSeconds_1.convertToSeconds)(startTime);
        const endTimeInSec = (0, convertToSeconds_1.convertToSeconds)(endTime);
        const duration = endTimeInSec - startTimeInSec;
        const currentPath = path_1.default.resolve();
        console.log(combinedVideoPath, "Is the path recieced from frontend"); //videos/57ATmXx-uUk/combined-57ATmXx-uUk.mp4
        const inputPath = path_1.default.isAbsolute(combinedVideoPath)
            ? combinedVideoPath
            : path_1.default.join(currentPath, combinedVideoPath);
        const outputPath = path_1.default.join(currentPath, 'videos', videoId, `${videoId}-s${startTimeInSec}-e${endTimeInSec}-trimmed.mp4`);
        const opPath = `videos/${videoId}/${videoId}-s${startTimeInSec}-e${endTimeInSec}-trimmed.mp4`;
        // Check if output file exists
        try {
            yield promises_1.default.access(outputPath);
            // If no error, file exists
            console.log('⚠️ Output file already exists:', outputPath);
            // You can choose to either:
            // - return the path directly
            // - delete the old file before processing
            // - or reject with an error
            // Here, let's just return the path to avoid re-processing
            return outputPath;
        }
        catch (_b) {
            // File doesn't exist, proceed with trimming
        }
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(inputPath)
                .setStartTime(startTime)
                .setDuration(duration)
                .output(outputPath)
                .on('end', () => {
                console.log('✅ Trimming completed!');
                resolve(opPath);
            })
                .on('error', (err) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
                .run();
        });
    });
}
