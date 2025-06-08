import express from "express";
import cors from "cors";
import { downloadQueue, qualityQueue } from "../../utils/queue/queue";

export const queueRouter = express.Router();

queueRouter.use(cors());
queueRouter.use(express.json());

queueRouter.get('/test', (req, res) => {
    res.json({ user: req.user });
});

// Get queue size and current status of your job
queueRouter.post('/status/:jobId', async (req, res) => {
    try {
        const { qualityJobId } = req.body;
        const jobId = req.params.jobId;

        const downloadJob = await downloadQueue.getJob(jobId);
        if (!downloadJob) {
            res.status(404).json({ message: "Download job not found" });
            return;
        }

        const downloadState = await downloadJob.getState();

        // Default to 0 position unless in waiting queue
        let position = 0;

        // Check if the job is still in the waiting queue
        if (downloadState === "waiting") {
            const waitingJobs = await downloadQueue.getWaiting();

            const jobIndex = waitingJobs.findIndex(job => job.id === jobId);
            position = jobIndex !== -1 ? jobIndex + 1 : 0;
        }

        // If active or completed
        if (downloadState === "active" || downloadState === "completed") {
            if (!qualityJobId) {
                res.json({
                    currentWaitingJobs: position,
                    statusOfYourJob: "active",
                    qualityJobStatus: "unknown",
                });
                return;
            }

            const qualityJob = await qualityQueue.getJob(qualityJobId);
            if (qualityJob) {
                const qualityState = await qualityJob.getState();
                if (qualityState !== "completed") {
                    res.json({
                        currentWaitingJobs: position,
                        statusOfYourJob: "active",
                        qualityJobStatus: qualityState,
                    });
                    
                }
            } else {
                res.json({
                    currentWaitingJobs: position,
                    statusOfYourJob: "active",
                    qualityJobStatus: "not found",
                });
            }
        }

        res.json({
            currentWaitingJobs: position,
            statusOfYourJob: downloadState,
        });

    } catch (error: any) {
        console.error("Queue status error:", error);
        res.status(500).json({ error: error.message });
    }
});
