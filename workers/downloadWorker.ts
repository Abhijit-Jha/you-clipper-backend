import { Worker } from 'bullmq';
import { ytDpl } from '../utils/start-download';  // your function file
import dotenv from 'dotenv';

dotenv.config();

import IORedis from 'ioredis';
import { combineVideo } from '../utils/combine';
import { combineQueue } from '../utils/queue/queue';

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});


const worker = new Worker(
    'start-download',
    async (job) => {
        console.log(`Processing job ${job.id} for URL: ${job.data.youtubeURL}`);
        try {
            const { videoPath, audioPath, videoId } = await ytDpl({ youtubeURL: job.data.youtubeURL });
            const combineJob = await combineQueue.add('combine-queue', { videoPath, audioPath, videoId });
            await job.updateProgress({ combineJobId: combineJob.id, videoPath,audioPath,videoId }); //This will update the Jobid to track the combine progress
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
