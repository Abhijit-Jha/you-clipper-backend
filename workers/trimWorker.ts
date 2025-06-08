import { Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

import { Redis } from 'ioredis';
import { trimVideo } from '../utils/trim';
import path from 'path';
import fs from 'fs'
import { connection } from '../utils/redis/redis';
const worker = new Worker(
    'trim-video',
    async (job) => {
        console.log(`✂️ Processing trim job ${job.id}`);
        console.log('📦 Job data received:', job.data);

        const { startTime, endTime, combinedVideoPath, videoId } = job.data;

        // Validate inputs
        if (!startTime || !endTime || !combinedVideoPath || !videoId) {
            console.error('❌ Missing required trim data:', { startTime, endTime, combinedVideoPath, videoId });
            throw new Error('Missing required trim parameters');
        }

        // Check if file exists before processing
        const absolutePath = path.join(path.resolve(), combinedVideoPath);
        if (!fs.existsSync(absolutePath)) {
            console.error('❌ Combined video file not found:', absolutePath);
            throw new Error(`Combined video file not found: ${absolutePath}`);
        }

        console.log('✅ Input validation passed');
        console.log('⏱️ Trim settings:', { startTime, endTime, videoId });
        console.log('📁 Input file:', absolutePath);

        try {
            console.log('🔄 Starting trim process...');
            const outputPath = await trimVideo({
                startTime,
                endTime,
                combinedVideoPath,
                videoId
            });

            console.log('✅ Trim completed successfully');
            console.log('📁 Output path:', outputPath);

            await job.updateProgress({
                trimmedVideoPath: outputPath,
                status: 'completed'
            });

            console.log('✅ Progress updated with trimmed video path');

        } catch (error: any) {
            console.error(`❌ Trim job ${job.id} failed:`, error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    },
    {
        connection
    }
);

worker.on('ready', () => {
    console.log('🟢 Trim worker is ready and waiting for jobs');
});

worker.on('completed', (job) => {
    console.log(`✅ Trim job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Trim job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
    console.error('❌ Trim worker error:', err);
});