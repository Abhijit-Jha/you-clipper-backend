import { Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

import IORedis from 'ioredis';
import { trimVideo } from '../utils/trim';


const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});


const worker = new Worker(
    'trim-video',
    async (job) => {
        console.log(`Processing job ${job.id} for URL: ${job.data.combinedVideoPath}`);
        try {
            const outputPath = await trimVideo({
                startTime: job.data.startTime,
                endTime: job.data.endTime,
                combinedVideoPath: job.data.combinedVideoPath,
                videoId: job.data.videoId
            });

            await job.updateProgress({
                trimmedVideoPath: outputPath
            })
        } catch (error) {
            console.error(`Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection
    }
);



worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed`, err);
});
