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
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ioredis_1 = __importDefault(require("ioredis"));
const trim_1 = require("../utils/trim");
const connection = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});
const worker = new bullmq_1.Worker('trim-video', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Processing job ${job.id} for URL: ${job.data.combinedVideoPath}`);
    try {
        const outputPath = yield (0, trim_1.trimVideo)({
            startTime: job.data.startTime,
            endTime: job.data.endTime,
            combinedVideoPath: job.data.combinedVideoPath,
            videoId: job.data.videoId
        });
        console.error("TrimmedvideoPath", outputPath);
        yield job.updateProgress({
            trimmedVideoPath: outputPath
        });
    }
    catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
    }
}), {
    connection
});
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} failed`, err);
});
