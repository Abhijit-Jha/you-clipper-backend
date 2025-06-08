import { Worker } from 'bullmq';
import { ytDpl } from '../utils/start-download';  // your function file
import dotenv from 'dotenv';
dotenv.config();
import { connection } from '../utils/redis/redis';

import { combineQueue } from '../utils/queue/queue';


const worker = new Worker(
    'start-download',
    async (job) => {
        console.log(`Processing job ${job.id} for URL: ${job.data.youtubeURL}`);
        try {
            const { videoPath, audioPath, videoId } = await ytDpl({ youtubeURL: job.data.youtubeURL });
            console.log('✅ Download completed:', { videoPath, audioPath, videoId });

            // Add combine job
            console.log('🔄 Adding job to combine queue...');
            const combineJob = await combineQueue.add('combine-queue', { videoPath, audioPath, videoId });
            console.log('✅ Combine job added successfully:', {
                combineJobId: combineJob.id,
                combineJobData: combineJob.data
            });

            // Update progress
            await job.updateProgress({
                combineJobId: combineJob.id,
                videoPath,
                audioPath,
                videoId
            });
            console.log('✅ Progress updated with combine job ID');

        } catch (error) {
            console.error(`❌ Job ${job.id} failed:`, error);
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
