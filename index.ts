import express from "express";
import { videoRouter } from "./routes/video/route";
import { authenticate } from "./utils/middleware/verifyToken";
import cors from "cors"
import { queueRouter } from "./routes/queue/route";
//Comment it if you dont want to delete the videos 
import './cronjob' //CronJob to delete videos at midnight 12:00
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());


app.use('/api/video',authenticate, videoRouter);
app.use('/api/queue', authenticate, queueRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

