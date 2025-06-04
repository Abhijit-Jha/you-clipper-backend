import express from "express";
import { videoRouter } from "./routes/video/route";
import { authenticate } from "./utils/middleware/verifyToken";
import cors from "cors"

const app = express();

// Add this to parse JSON body before routes
app.use(express.json());
app.use(cors())
app.use('/api/video',authenticate, videoRouter);
app.listen(3001, () => {
    console.log('Server started on port 3001');
});
