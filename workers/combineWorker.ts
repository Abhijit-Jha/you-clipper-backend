import dotenv from 'dotenv';
dotenv.config();
import { Worker } from 'bullmq';

import { combineVideo } from '../utils/combine';
import { connection } from '../utils/redis/redis';


const combineWorker = new Worker(
    'combine-queue',
    async (job) => {
        console.log(`🔄 Combining files for job ${job.id}`);
        console.log('📦 Job data received:', job.data);

        const { videoPath, audioPath, videoId } = job.data;

        // Validate inputs
        if (!videoPath || !audioPath || !videoId) {
            console.error('❌ Missing required data:', { videoPath, audioPath, videoId });
            throw new Error('Missing required combine data');
        }

        try {
            console.log('🎬 Starting combine process...');
            const { outputPath } = await combineVideo({ videoPath, audioPath, videoId });
            console.log('✅ Combine completed, output path:', outputPath);

            await job.updateProgress({ videoPath, audioPath, videoId, outputPath });
            console.log('✅ Progress updated with output path');

        } catch (error) {
            console.error(`❌ Combining job ${job.id} failed:`, error);
            throw error;
        }
    },
    { connection }
);

combineWorker.on('ready', () => {
    console.log('🟢 Combine worker is ready and waiting for jobs');
});

combineWorker.on('completed', (job) => {
    console.log(`✅ Combine job ${job.id} completed successfully`);
});

combineWorker.on('failed', (job, err) => {
    console.error(`❌ Combine job ${job?.id} failed:`, err);
});

combineWorker.on('error', (err) => {
    console.error('❌ Combine worker error:', err);
});