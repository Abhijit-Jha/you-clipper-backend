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
// import { mkdirSync, existsSync } from 'fs';
const fs_1 = require("fs");
const yt_dlp_wrap_1 = __importDefault(require("yt-dlp-wrap"));
const combine_1 = require("./utils/combine");
const trim_1 = require("./utils/trim");
const getVideoQuality_1 = require("./utils/getVideoQuality");
// { youtubeURL}: { youtubeURL: string }
function ytDpl() {
    return __awaiter(this, void 0, void 0, function* () {
        const githubRelease = yield yt_dlp_wrap_1.default.getGithubReleases(1, 5);
        const platform = process.platform;
        const isWindows = process.platform === 'win32';
        const binaryPath = `./bin/yt-dlp${isWindows ? '.exe' : ''}`;
        console.log(platform);
        if (!(0, fs_1.existsSync)("./bin"))
            (0, fs_1.mkdirSync)("./bin");
        yield yt_dlp_wrap_1.default.downloadFromGithub(binaryPath, '2025.05.22', platform);
        const ytDlpWrap = new yt_dlp_wrap_1.default(binaryPath);
        ytDlpWrap.setBinaryPath(binaryPath);
        //ytdlp 
        let ytDlpEventEmitter = ytDlpWrap
            .exec([
            'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            "--no-playlist",
            '-f',
            'bv+ba/b',
            '-o',
            './videos/output.mp4', //change name
        ])
            .on('progress', (progress) => console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
            .on('ytDlpEvent', (eventType, eventData) => console.log(eventType, eventData))
            .on('error', (error) => console.error(error))
            .on('close', () => __awaiter(this, void 0, void 0, function* () {
            console.log('all done');
            //Now ffmeg will start his work to trim
            //Frontend pe kuch flag daldenge ki done bro ytdlp ka kaam hochuka hai now you can go and combine video
            yield (0, combine_1.combineVideo)();
            yield (0, trim_1.trimVideo)({
                startTime: "00:00:00",
                endTime: "00:00:20"
            });
            (0, getVideoQuality_1.qualityVideo)("360p", 'reels');
        }));
    });
}
ytDpl();
