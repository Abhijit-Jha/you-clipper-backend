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
exports.ytDpl = ytDpl;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const yt_dlp_wrap_1 = __importDefault(require("yt-dlp-wrap"));
const videoId_1 = require("../helper/videoId");
function ytDpl(_a) {
    return __awaiter(this, arguments, void 0, function* ({ youtubeURL }) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const platform = process.platform;
                const isWindows = platform === "win32";
                const binaryPath = `./bin/yt-dlp${isWindows ? ".exe" : ""}`;
                if (!(0, fs_1.existsSync)("./bin"))
                    (0, fs_1.mkdirSync)("./bin");
                yield yt_dlp_wrap_1.default.downloadFromGithub(binaryPath, "2025.05.22", platform);
                const ytDlpWrap = new yt_dlp_wrap_1.default(binaryPath);
                ytDlpWrap.setBinaryPath(binaryPath);
                const videoId = (0, videoId_1.extractVideoId)(youtubeURL);
                const uniqueId = "abhi";
                const outputDir = `./videos/${videoId}`;
                const baseFilename = `${videoId}-${uniqueId}`;
                if (!(0, fs_1.existsSync)(outputDir))
                    (0, fs_1.mkdirSync)(outputDir, { recursive: true });
                const videoPath = path_1.default.join(outputDir, `${baseFilename}-video.mp4`);
                const audioPath = path_1.default.join(outputDir, `${baseFilename}-audio.mp3`);
                // ✅ If both files exist already, skip downloading
                if ((0, fs_1.existsSync)(videoPath) && (0, fs_1.existsSync)(audioPath)) {
                    console.log("Video & audio already exist. Skipping download.");
                    return resolve({
                        videoPath,
                        audioPath,
                        videoId,
                        baseFilename,
                    });
                }
                // Download video-only
                const videoPromise = ytDlpWrap.execPromise([
                    youtubeURL,
                    "-f",
                    "bv",
                    "-o",
                    videoPath,
                    "--no-playlist",
                ]);
                // Download audio-only
                const audioPromise = ytDlpWrap.execPromise([
                    youtubeURL,
                    "-f",
                    "ba",
                    "-o",
                    audioPath,
                    "--no-playlist",
                ]);
                yield Promise.all([videoPromise, audioPromise]);
                console.log("Download finished");
                resolve({
                    videoPath,
                    audioPath,
                    videoId,
                    baseFilename,
                });
            }
            catch (e) {
                console.error("Error in ytDpl:", e);
                reject(e);
            }
        }));
    });
}
