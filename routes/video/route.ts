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
    const { youtubeURL } = req.body;

    if (!youtubeURL) {
        res.status(400).json({ error: 'youtubeURL missing' });
    }

    try {
        const job = await downloadQueue.add('start-download', { youtubeURL });
        res.json({ jobId: job.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
});

//Frontend will poll this
videoRouter.get('/downloadStatus/:jobId', async (req, res) => {
    const job = await downloadQueue.getJob(req.params.jobId);

    if (!job) res.status(404).json({ error: 'Job not found' });

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
    //Body -> {videoId,combinedVideoPath}
    const { videoId, combinedVideoPath } = req.body;
    const { startTime, endTime } = req.query;
    const absolutePath = path.join(path.resolve(), combinedVideoPath);
    if (!fs.existsSync(absolutePath)) {
        res.json({
            'error': "The combinedVideoPath doesnot Exist!!"
        });
    }
    console.error('called', videoId, combinedVideoPath, startTime, endTime);
    try {
        const job = await trimQueue.add('trim-video', { startTime, endTime, combinedVideoPath, videoId });
        console.log(job)
        res.json({ jobId: job.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }

});


//trim task queue testing
videoRouter.get('/trimStatus/:jobId', async (req, res) => {
    const job = await trimQueue.getJob(req.params.jobId);

    if (!job) res.status(404).json({ error: 'Job not found' });

    const state = await job.getState();  // e.g. 'waiting', 'active', 'completed', 'failed'
    const progress = job.progress;

    res.json({ id: job.id, state, progress });
});

//After trimming happens, the user will choose the quality he needs, we just have to fulfill it and at last download starts
// /quality?aspectRatio=squared&quality=144p
// {trimmedVideoPath,videoId}

videoRouter.post('/quality', async (req: Request, res: Response) => {
    const { trimmedVideoPath, videoId } = req.body;
    const { resolution, aspectRatio } = req.query as { resolution?: string; aspectRatio?: string };

    if (!trimmedVideoPath || !videoId) {
        res.status(400).json({ error: 'trimmedVideoPath and videoId are required' });
    }

    if (!resolution || !aspectRatio) {
        res.status(400).json({ error: 'resolution and aspectRatio are required query parameters' });
    }

    try {
        const job = await qualityQueue.add('change-quality', { resolution, aspectRatio, trimmedVideoPath, videoId });
        res.json({ jobId: job.id });
    } catch (error) {
        console.error('❌ Failed to enqueue quality job:', error);
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
});

//track the quality process (final process)
videoRouter.get('/qualityJobStatus/:jobId', async (req: Request, res: Response) => {
    const job = await qualityQueue.getJob(req.params.jobId);
    if (!job) {
        res.status(404).json({ error: 'Job not found' });
    }
    const state = await job.getState();  
    const progress = job.progress;

    res.json({ id: job.id, state, progress });
});