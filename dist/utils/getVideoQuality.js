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
// Safety check for ffmpeg binary
if (!ffmpeg_static_1.default) {
    throw new Error('❌ ffmpeg binary not found!');
}
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
var Resolution;
(function (Resolution) {
    Resolution[Resolution["P1080"] = 1080] = "P1080";
    Resolution[Resolution["P720"] = 720] = "P720";
    Resolution[Resolution["P480"] = 480] = "P480";
    Resolution[Resolution["P360"] = 360] = "P360";
    Resolution[Resolution["P144"] = 144] = "P144";
})(Resolution || (Resolution = {}));
function qualityVideo(resolution, aspectRatio) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentPath = path_1.default.resolve();
        const inputPath = path_1.default.join(currentPath, 'videos', 'trimmedVideo.mp4'); // include extension
        const outputPath = path_1.default.join(currentPath, 'videos', `final-${resolution}.mp4`);
        // Check if resolution is valid
        if (!qualityMap_1.qualityMap[resolution]) {
            throw new Error(`❌ Resolution "${resolution}" is not supported.`);
        }
        // Check if input file exists
        if (!fs_1.default.existsSync(inputPath)) {
            throw new Error(`❌ Input file not found at ${inputPath}`);
        }
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(inputPath)
                //does not confirms
                // .size(qualityMap[resolution])
                // .outputOptions('-aspect', aspectRatioMap[aspectRatio])
                //Force fully doing it
                .outputOptions([
                `-vf scale=${qualityMap_1.qualityMap[resolution]}`, // Forces frame resize
                `-aspect ${aspectRatioMap_1.aspectRatioMap[aspectRatio]}` // Sets display aspect
            ])
                .output(outputPath)
                .on('progress', (p) => {
                var _a;
                console.log(`Progress: ${(_a = p.percent) === null || _a === void 0 ? void 0 : _a.toFixed(2)}%, Size: ${p.targetSize}KB, FPS: ${p.currentFps}`);
            })
                .on('start', (command) => {
                console.log('Started ffmpeg with command:', command);
            })
                .on('end', () => {
                console.log('✅ Video processing done');
                resolve(outputPath);
            })
                .on('error', (err) => {
                console.error('❌ ffmpeg error:', err.message);
                reject(err);
            })
                .run();
        });
    });
}
