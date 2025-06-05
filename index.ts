import express from "express";
import { videoRouter } from "./routes/video/route";
import { authenticate } from "./utils/middleware/verifyToken";
import cors from "cors"
import { queueRouter } from "./routes/queue/route";

const app = express();

// Add this to parse JSON body before routes
app.use(express.json());
app.use(cors())
app.use('/api/video',authenticate, videoRouter);
app.use('/api/queue',authenticate, queueRouter);
app.listen(3001, () => {
    console.log('Server started on port 3001');
});



// uploadVideoToAppwrite("videos\\57ATmXx-uUk\\57ATmXx-uUk-144p-reels.mp4").then((e) => {
//     console.log("File uploaded", e)
// })
