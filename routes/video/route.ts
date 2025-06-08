import express, { Request, Response } from "express";
import cors from "cors";
import { combineQueue, downloadQueue, qualityQueue, trimQueue } from "../../utils/queue/queue";
import fs from 'fs'
import path from "path";
export const videoRouter = express.Router();

videoRouter.use(cors());
videoRouter.use(express.json());

videoRouter.get('/test', (req, res) => {
    res.json({ user: req.user })
})

videoRouter.post('/startDownload', async (req: Request, res: Response) => {
    console.log('🚀 /startDownload endpoint hit');
    console.log('📦 Request body:', req.body);
    console.log('📋 Request headers:', req.headers);

    const { youtubeURL } = req.body;

    if (!youtubeURL) {
        console.log('❌ Missing youtubeURL in request body');
        res.status(400).json({ error: 'youtubeURL missing' });
        return;
    }

    console.log('✅ youtubeURL received:', youtubeURL);

    try {
        console.log('🔄 Attempting to add job to downloadQueue...');
        const job = await downloadQueue.add('start-download', { youtubeURL });
        console.log('✅ Download Job added successfully:', {
            jobId: job.id,
            youtubeURL: youtubeURL,
            jobData: job.data
        });
        res.json({ jobId: job.id });
    } catch (error: any) {
        console.error('❌ Failed to add job to queue:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
});

//Frontend will poll this
videoRouter.get('/downloadStatus/:jobId', async (req, res) => {
    const job = await downloadQueue.getJob(req.params.jobId);

    if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }

    const state = await job.getState();  // e.g. 'waiting', 'active', 'completed', 'failed'
    const progress = job.progress;

    res.json({ id: job.id, state, progress }); //Jab Download Complete hojayega tab progress mei combine worker ka id rahega to make 
    //the next request to combine worker or neeche wala code se we can use downloadJobId to track the combineWorker
});


// Combine Video and Audio Status
videoRouter.get('/combineStatus/:jobId', async (req: Request, res: Response) => {
    const job = await downloadQueue.getJob(req.params.jobId);

    if (!job) {
        res.status(404).json({ error: 'Download job not found' });
        return;
    }

    const downloadProgress = job.progress as { combineJobId?: string };

    const combineJobId = downloadProgress?.combineJobId;
    if (!combineJobId) {
        res.status(202).json({
            status: 'waiting',
            message: 'Combine job not created yet'
        });
        return;
    }
    const combineJob = await combineQueue.getJob(combineJobId);

    if (!combineJob) {
        res.status(404).json({ error: 'Combine job not found' });
        return;
    }

    const state = await combineJob.getState();  // Correct job here
    const combineProgress = combineJob.progress;

    res.json({ id: combineJob.id, state, progress: combineProgress });
});


//After Combining we have to trim the video
//When user gives the start and end time this API will be called
//if the combine step is not done this call will not take place (handle this in frontend) - add retry after 10sec logic
//Add a check here as well if the combinedVideoPath is there or not
// /api/video/trim?startTime="00:00:00"&endTime="00:00:10"
videoRouter.post('/trim', async (req: Request, res: Response) => {
    console.log('✂️ /trim endpoint hit');
    console.log('📦 Request body:', req.body);
    console.log('🔍 Query params:', req.query);

    const { videoId, combinedVideoPath } = req.body;
    const { startTime, endTime } = req.query as { startTime?: string; endTime?: string };

    // Validate required fields
    if (!videoId || !combinedVideoPath) {
        console.log('❌ Missing required fields:', { videoId, combinedVideoPath });
        res.status(400).json({ error: 'videoId and combinedVideoPath are required' });
        return;
    }

    if (!startTime || !endTime) {
        console.log('❌ Missing time parameters:', { startTime, endTime });
        res.status(400).json({ error: 'startTime and endTime query parameters are required' });
        return;
    }

    // Check if file exists
    const absolutePath = path.join(path.resolve(), combinedVideoPath);
    console.log('📁 Checking file path:', absolutePath);

    if (!fs.existsSync(absolutePath)) {
        console.log('❌ File does not exist:', absolutePath);
        res.status(404).json({
            error: "The combinedVideoPath does not exist!",
            path: absolutePath
        });
        return; // Fixed: uncommented return
    }

    console.log('✅ File exists, proceeding with trim');
    console.log('⏱️ Trim parameters:', { videoId, combinedVideoPath, startTime, endTime });

    try {
        console.log('🔄 Adding job to trim queue...');
        const job = await trimQueue.add('trim-video', {
            startTime,
            endTime,
            combinedVideoPath,
            videoId
        });

        console.log('✅ Trim job added successfully:', {
            jobId: job.id,
            jobData: job.data
        });

        res.json({ jobId: job.id });
    } catch (error) {
        console.error('❌ Failed to enqueue trim job:', error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
});


//trim task queue testing
videoRouter.get('/trimStatus/:jobId', async (req, res) => {
    const job = await trimQueue.getJob(req.params.jobId);
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }

    const state = await job.getState();  // e.g. 'waiting', 'active', 'completed', 'failed'
    const progress = job.progress;

    res.json({ id: job.id, state, progress });
});

//After trimming happens, the user will choose the quality he needs, we just have to fulfill it and at last download starts
// /quality?aspectRatio=squared&quality=144p
// {trimmedVideoPath,videoId}

// videoRouter.post('/quality', async (req: Request, res: Response) => {
//     const { trimmedVideoPath, videoId } = req.body;
//     const { resolution, aspectRatio } = req.query as { resolution?: string; aspectRatio?: string };
//     console.log("Hello from quality", resolution, aspectRatio, trimmedVideoPath, videoId);
//     if (!trimmedVideoPath || !videoId) {
//         res.status(400).json({ error: 'trimmedVideoPath and videoId are required' });
//         return;
//     }

//     if (!resolution || !aspectRatio) {
//         res.status(400).json({ error: 'resolution and aspectRatio are required query parameters' });
//         return;
//     }

//     try {
//         const job = await qualityQueue.add('change-quality', { resolution, aspectRatio, trimmedVideoPath, videoId });
//         console.log("Quality QUeue added ")
//         res.json({ jobId: job.id });
//     } catch (error) {
//         console.error('❌ Failed to enqueue quality job:', error);
//         res.status(500).json({ error: 'Failed to enqueue job' });
//     }
// });


videoRouter.post('/quality', async (req: Request, res: Response) => {
    console.log('🚀 Quality Router: /quality endpoint hit');
    console.log('📦 Quality Router: Request body:', req.body);
    console.log('📦 Quality Router: Request query:', req.query);
    console.log('📋 Quality Router: Request headers:', req.headers);

    const { trimmedVideoPath, videoId } = req.body;
    const { resolution, aspectRatio } = req.query as { resolution?: string; aspectRatio?: string };

    console.log('📊 Quality Router: Extracted parameters:');
    console.log(`  trimmedVideoPath: ${trimmedVideoPath}`);
    console.log(`  videoId: ${videoId}`);
    console.log(`  resolution: ${resolution}`);
    console.log(`  aspectRatio: ${aspectRatio}`);

    // Validation with detailed logging
    if (!trimmedVideoPath || !videoId) {
        console.error('❌ Quality Router: Missing required body parameters');
        console.error(`  trimmedVideoPath: ${trimmedVideoPath}`);
        console.error(`  videoId: ${videoId}`);
        res.status(400).json({ error: 'trimmedVideoPath and videoId are required' });
        return;
    }

    if (!resolution || !aspectRatio) {
        console.error('❌ Quality Router: Missing required query parameters');
        console.error(`  resolution: ${resolution}`);
        console.error(`  aspectRatio: ${aspectRatio}`);
        res.status(400).json({ error: 'resolution and aspectRatio are required query parameters' });
        return;
    }

    console.log('✅ Quality Router: All parameters validated');

    try {
        console.log('🔄 Quality Router: Attempting to add job to quality queue...');

        // Check queue status before adding job
        const waiting = await qualityQueue.getWaiting();
        const active = await qualityQueue.getActive();
        const completed = await qualityQueue.getCompleted();
        const failed = await qualityQueue.getFailed();

        console.log('📊 Quality Router: Current queue status:');
        console.log(`  Waiting: ${waiting.length}`);
        console.log(`  Active: ${active.length}`);
        console.log(`  Completed: ${completed.length}`);
        console.log(`  Failed: ${failed.length}`);

        const jobData = {
            resolution,
            aspectRatio,
            trimmedVideoPath,
            videoId,
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
        };

        console.log('📦 Quality Router: Job data to be added:', jobData);

        const job = await qualityQueue.add('change-quality', jobData, {
            removeOnComplete: 5,
            removeOnFail: 10,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            }
        });

        console.log('✅ Quality Router: Job added successfully');
        console.log(`📊 Quality Router: Job details:`, {
            jobId: job.id,
            queueName: job.queueName,
            data: job.data,
            opts: job.opts
        });

        // Check if job was actually added to queue
        const updatedWaiting = await qualityQueue.getWaiting();
        console.log(`📊 Quality Router: Queue waiting count after adding: ${updatedWaiting.length}`);

        const response = {
            jobId: job.id,
            queueName: job.queueName,
            status: 'queued',
            timestamp: new Date().toISOString()
        };

        console.log('📤 Quality Router: Sending response:', response);
        res.json(response);

    } catch (error:any) {
        console.error('❌ Quality Router: Failed to enqueue quality job');
        console.error('❌ Quality Router: Error details:', error);
        console.error('❌ Quality Router: Error stack:', error.stack);
        console.error('❌ Quality Router: Error message:', error.message);

        res.status(500).json({
            error: 'Failed to enqueue job',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

//track the quality process (final process)
videoRouter.get('/qualityJobStatus/:jobId', async (req: Request, res: Response) => {
    const job = await qualityQueue.getJob(req.params.jobId);
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
    }
    const state = await job.getState();
    const progress = job.progress;

    res.json({ id: job.id, state, progress });
});