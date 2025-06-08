import { Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();
import { Redis } from 'ioredis';
import { qualityVideo } from '../utils/getVideoQuality';

import { connection } from '../utils/redis/redis';

// Add Redis connection event listeners
connection.on('connect', () => {
    console.log('✅ Quality Worker: Redis connection established');
});

connection.on('ready', () => {
    console.log('✅ Quality Worker: Redis connection ready');
});

connection.on('error', (err) => {
    console.error('❌ Quality Worker: Redis connection error:', err);
});

connection.on('close', () => {
    console.log('⚠️ Quality Worker: Redis connection closed');
});

connection.on('reconnecting', () => {
    console.log('🔄 Quality Worker: Redis reconnecting...');
});

const qualityQueue = new Worker(
    'change-quality',
    async (job) => {
        const { trimmedVideoPath, aspectRatio, resolution, videoId } = job.data;
        console.log(trimmedVideoPath, aspectRatio, resolution, videoId, "From qq endpoint");
        try {
            const result = await qualityVideo(resolution, aspectRatio, trimmedVideoPath, videoId);
            console.log(`🎥 Quality job done: ${result}`);
            await job.updateProgress({
                finalVideoPath: result.outputPath,
                fileId: result.fileId //File id of appwrite
                //Maybe a downloadable Link of appwriter
            })
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