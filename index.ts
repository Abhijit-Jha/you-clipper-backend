import express from "express";
import { videoRouter } from "./routes/video/route";

const app = express();

// Add this to parse JSON body before routes
app.use(express.json());

app.use('/api/video', videoRouter);

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
