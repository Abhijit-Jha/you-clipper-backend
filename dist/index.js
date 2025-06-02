"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_1 = require("./routes/video/route");
const app = (0, express_1.default)();
// Add this to parse JSON body before routes
app.use(express_1.default.json());
app.use('/api/video', route_1.videoRouter);
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
