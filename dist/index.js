"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_1 = require("./routes/video/route");
const verifyToken_1 = require("./utils/middleware/verifyToken");
const cors_1 = __importDefault(require("cors"));
const route_2 = require("./routes/queue/route");
require("./cronjob");
const app = (0, express_1.default)();
// Add this to parse JSON body before routes
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/video', verifyToken_1.authenticate, route_1.videoRouter);
app.use('/api/queue', verifyToken_1.authenticate, route_2.queueRouter);
app.listen(3001, () => {
    console.log('Server started on port 3001');
});
// uploadVideoToAppwrite("videos\\57ATmXx-uUk\\57ATmXx-uUk-144p-reels.mp4").then((e) => {
//     console.log("File uploaded", e)
// })
