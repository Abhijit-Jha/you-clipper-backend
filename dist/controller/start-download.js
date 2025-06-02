"use strict";
// import { Request, Response } from "express";
// import { myQueue } from "../utils/queue/queue";
// export async function startDownloadHandler(req: Request, res: Response) {
//     const { youtubeURL } = req.body;
//     if (!youtubeURL) return res.status(400).json({ error: 'youtubeURL missing' });
//     try {
//         const job = await myQueue.add('download-video', { youtubeURL });
//         return res.json({ jobId: job.id });
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to enqueue job' });
//     }
// }
