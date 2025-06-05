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
exports.qualityVideo = qualityVideo;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const path_1 = __importDefault(require("path"));
const qualityMap_1 = require("../helper/qualityMap");
const aspectRatioMap_1 = require("../helper/aspectRatioMap");
const createFile_1 = require("./storage/createFile");
if (!ffmpeg_static_1.default) {
    throw new Error('❌ ffmpeg binary not found!');
}
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
// Utility: Converts "16:9" -> { w: 16, h: 9 }
function parseAspectRatio(ratio) {
    const [w, h] = ratio.split(':').map(Number);
    return { w, h };
}
function qualityVideo(resolution, aspectRatio, trimmedVideoPath, videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentPath = path_1.default.resolve();
        const inputPath = path_1.default.isAbsolute(trimmedVideoPath) ? trimmedVideoPath : path_1.default.join(currentPath, trimmedVideoPath);
        const outputPath = path_1.default.join(currentPath, 'videos', videoId, `${videoId}-${resolution}-${aspectRatio}.mp4`);
        const opPath = `${videoId}/${videoId}-${resolution}-${aspectRatio}.mp4`;
        if (!qualityMap_1.qualityMap[resolution]) {
            throw new Error(`❌ Resolution "${resolution}" is not supported.`);
        }
        if (!aspectRatioMap_1.aspectRatioMap[aspectRatio]) {
            throw new Error(`❌ Aspect ratio "${aspectRatio}" is not supported.`);
        }
        if (!fs_1.default.existsSync(inputPath)) {
            throw new Error(`❌ Input file not found at ${inputPath}`);
        }
        // Extract width and height from resolution
        const [targetWidth, targetHeight] = qualityMap_1.qualityMap[resolution].split('x').map(Number);
        const { w: arW, h: arH } = parseAspectRatio(aspectRatioMap_1.aspectRatioMap[aspectRatio]);
        // Compute aspect-correct crop values
        const targetAR = arW / arH;
        const scaledCropWidth = Math.floor(targetHeight * targetAR);
        const cropWidth = Math.min(scaledCropWidth, targetWidth);
        const cropHeight = Math.floor(cropWidth / targetAR);
        const cropX = Math.floor((targetWidth - cropWidth) / 2);
        const cropY = Math.floor((targetHeight - cropHeight) / 2);
        const vfFilter = `scale=${targetWidth}:${targetHeight},crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`;
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(inputPath)
                .outputOptions([`-vf ${vfFilter}`])
                .output(outputPath)
                .on('start', (cmd) => {
                console.log('🔧 FFmpeg started with command:', cmd);
            })
                .on('progress', (p) => {
                var _a;
                console.log(`⏳ Progress: ${(_a = p.percent) === null || _a === void 0 ? void 0 : _a.toFixed(2)}%`);
            })
                .on('end', () => {
                console.log('✅ Video processing done');
                // Run the async operation outside the event callback
                (() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const data = yield (0, createFile_1.uploadVideoToAppwrite)(outputPath);
                        resolve({
                            outputPath: opPath,
                            fileId: data.$id
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                }))();
            })
                .on('error', (err) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
                .run();
        });
    });
}
