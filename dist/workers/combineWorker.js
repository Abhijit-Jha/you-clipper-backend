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
const ioredis_1 = __importDefault(require("ioredis"));
const combine_1 = require("../utils/combine");
dotenv_1.default.config();
const connection = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});
const combineWorker = new bullmq_1.Worker('combine-queue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Combining files for job ${job.id}`);
    const { videoPath, audioPath, videoId } = job.data;
    try {
        // Call your combineVideo function here (make sure it returns a promise)
        const { outputPath } = yield (0, combine_1.combineVideo)({ videoPath, audioPath, videoId });
        yield job.updateProgress({ videoPath, audioPath, videoId, outputPath });
        console.log(`Job ${job.id} combined successfully`);
    }
    catch (error) {
        console.error(`Combining job ${job.id} failed:`, error);
        throw error;
    }
}), { connection });
combineWorker.on('completed', (job) => {
    console.log(`Combine job ${job.id} completed successfully`);
});
combineWorker.on('failed', (job, err) => {
    console.error(`Combine job ${job === null || job === void 0 ? void 0 : job.id} failed`, err);
});
