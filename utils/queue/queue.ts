import { Queue } from 'bullmq';
import dotenv from 'dotenv'
import Redis from 'ioredis';
dotenv.config();

export const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

export const downloadQueue = new Queue('start-download', { connection });
export const combineQueue = new Queue('combine-queue', { connection });
export const trimQueue = new Queue('trim-video', { connection });
export const qualityQueue = new Queue('change-quality', { connection });