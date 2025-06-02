import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { combineVideo } from '../utils/combine';


dotenv.config();

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

const combineWorker = new Worker(
    'combine-queue',
    async (job) => {
        console.log(`Combining files for job ${job.id}`);
        const { videoPath, audioPath, videoId } = job.data;

        try {
            // Call your combineVideo function here (make sure it returns a promise)
            const { outputPath } = await combineVideo({ videoPath, audioPath, videoId });
            await job.updateProgress({ videoPath, audioPath, videoId, outputPath });
            console.log(`Job ${job.id} combined successfully`);
        } catch (error) {
            console.error(`Combining job ${job.id} failed:`, error);
            throw error;
        }
    },
    { connection }
);

combineWorker.on('completed', (job) => {
    console.log(`Combine job ${job.id} completed successfully`);
});

combineWorker.on('failed', (job, err) => {
    console.error(`Combine job ${job?.id} failed`, err);
});
