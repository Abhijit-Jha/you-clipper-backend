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
exports.combineVideo = combineVideo;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const path_1 = __importDefault(require("path"));
// Safety check for ffmpeg binary
if (!ffmpeg_static_1.default) {
    throw new Error('❌ ffmpeg binary not found!');
}
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
function combineVideo() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentPath = path_1.default.resolve();
        const audioPath = path_1.default.join(currentPath, 'videos', 'output.f258.m4a');
        const videoPath = path_1.default.join(currentPath, 'videos', 'output.f401.mp4');
        const outputPath = path_1.default.join(currentPath, 'videos', 'combined.mp4');
        // ✅ Check if input files exist
        if (!fs_1.default.existsSync(audioPath))
            throw new Error('❌ Audio file not found');
        if (!fs_1.default.existsSync(videoPath))
            throw new Error('❌ Video file not found');
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)()
                .input(videoPath)
                .input(audioPath)
                .outputOptions(['-c:v copy', '-c:a aac']) // video copied, audio safely encoded
                .on('start', commandLine => {
                console.log('🎬 FFmpeg started:', commandLine);
            })
                .on('end', () => {
                console.log('✅ Combined video + audio into:', outputPath);
                resolve(true);
            })
                .on('error', (err) => {
                console.error('❌ FFmpeg error:', err.message);
                reject(err);
            })
                .save(outputPath);
        });
    });
}
