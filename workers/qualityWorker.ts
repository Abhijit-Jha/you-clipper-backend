import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { qualityVideo } from '../utils/getVideoQuality';

dotenv.config();

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

const qualityQueue = new Worker(
    'change-quality',
    async (job) => {
        const { trimmedVideoPath, aspectRatio, resolution, videoId } = job.data;

        try {
            const result = await qualityVideo(resolution, aspectRatio, trimmedVideoPath, videoId);
            console.log(`🎥 Quality job done: ${result}`);
        } catch (error: any) {
            console.error(`❌ Error processing quality job ${job.id}:`, error.message || error);
            throw error;
        }
    },
    { connection }
);

qualityQueue.on('completed', (job) => {
    console.log(`✅ Quality job ${job.id} completed successfully`);
});

qualityQueue.on('failed', (job, err) => {
    console.error(`❌ Quality job ${job?.id} failed`, err);
});
