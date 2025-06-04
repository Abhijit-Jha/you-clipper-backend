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
exports.videoRouter = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const queue_1 = require("../../utils/queue/queue");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.videoRouter = express_1.default.Router();
exports.videoRouter.use((0, cors_1.default)());
exports.videoRouter.use(express_1.default.json());
exports.videoRouter.get('/test', (req, res) => {
    res.json({ user: req.user });
});
exports.videoRouter.post('/startDownload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { youtubeURL } = req.body;
    if (!youtubeURL) {
        res.status(400).json({ error: 'youtubeURL missing' });
    }
    try {
        const job = yield queue_1.downloadQueue.add('start-download', { youtubeURL });
        res.json({ jobId: job.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
}));
//Frontend will poll this
exports.videoRouter.get('/downloadStatus/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield queue_1.downloadQueue.getJob(req.params.jobId);
    if (!job)
        res.status(404).json({ error: 'Job not found' });
    const state = yield job.getState(); // e.g. 'waiting', 'active', 'completed', 'failed'
    const progress = job.progress;
    res.json({ id: job.id, state, progress }); //Jab Download Complete hojayega tab progress mei combine worker ka id rahega to make 
    //the next request to combine worker or neeche wala code se we can use downloadJobId to track the combineWorker
}));
// Combine Video and Audio Status
exports.videoRouter.get('/combineStatus/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield queue_1.downloadQueue.getJob(req.params.jobId);
    if (!job) {
        res.status(404).json({ error: 'Download job not found' });
    }
    const downloadProgress = job.progress;
    const combineJobId = downloadProgress === null || downloadProgress === void 0 ? void 0 : downloadProgress.combineJobId;
    if (!combineJobId) {
        res.status(202).json({
            status: 'waiting',
            message: 'Combine job not created yet'
        });
        return;
    }
    const combineJob = yield queue_1.combineQueue.getJob(combineJobId);
    if (!combineJob) {
        res.status(404).json({ error: 'Combine job not found' });
    }
    const state = yield combineJob.getState(); // Correct job here
    const combineProgress = combineJob.progress;
    res.json({ id: combineJob.id, state, progress: combineProgress });
}));
//After Combining we have to trim the video
//When user gives the start and end time this API will be called
//if the combine step is not done this call will not take place (handle this in frontend) - add retry after 10sec logic
//Add a check here as well if the combinedVideoPath is there or not
// /api/video/trim?startTime="00:00:00"&endTime="00:00:10"
exports.videoRouter.post('/trim', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Body -> {videoId,combinedVideoPath}
    const { videoId, combinedVideoPath } = req.body;
    const { startTime, endTime } = req.query;
    const absolutePath = path_1.default.join(path_1.default.resolve(), combinedVideoPath);
    if (!fs_1.default.existsSync(absolutePath)) {
        res.json({
            'error': "The combinedVideoPath doesnot Exist!!"
        });
    }
    console.error('called', videoId, combinedVideoPath, startTime, endTime);
    try {
        const job = yield queue_1.trimQueue.add('trim-video', { startTime, endTime, combinedVideoPath, videoId });
        console.log(job);
        res.json({ jobId: job.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
}));
//trim task queue testing
exports.videoRouter.get('/trimStatus/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield queue_1.trimQueue.getJob(req.params.jobId);
    if (!job)
        res.status(404).json({ error: 'Job not found' });
    const state = yield job.getState(); // e.g. 'waiting', 'active', 'completed', 'failed'
    const progress = job.progress;
    res.json({ id: job.id, state, progress });
}));
//After trimming happens, the user will choose the quality he needs, we just have to fulfill it and at last download starts
// /quality?aspectRatio=squared&quality=144p
// {trimmedVideoPath,videoId}
exports.videoRouter.post('/quality', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trimmedVideoPath, videoId } = req.body;
    const { resolution, aspectRatio } = req.query;
    if (!trimmedVideoPath || !videoId) {
        res.status(400).json({ error: 'trimmedVideoPath and videoId are required' });
    }
    if (!resolution || !aspectRatio) {
        res.status(400).json({ error: 'resolution and aspectRatio are required query parameters' });
    }
    try {
        const job = yield queue_1.qualityQueue.add('change-quality', { resolution, aspectRatio, trimmedVideoPath, videoId });
        res.json({ jobId: job.id });
    }
    catch (error) {
        console.error('❌ Failed to enqueue quality job:', error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
}));
//track the quality process (final process)
exports.videoRouter.get('/qualityJobStatus/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield queue_1.qualityQueue.getJob(req.params.jobId);
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
    }
    const state = yield job.getState();
    const progress = job.progress;
    res.json({ id: job.id, state, progress });
}));
