"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimQueue = exports.combineQueue = exports.downloadQueue = exports.connection = void 0;
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
exports.connection = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
});
exports.downloadQueue = new bullmq_1.Queue('start-download', { connection: exports.connection });
exports.combineQueue = new bullmq_1.Queue('combine-queue', { connection: exports.connection });
exports.trimQueue = new bullmq_1.Queue('trim-video', { connection: exports.connection });
