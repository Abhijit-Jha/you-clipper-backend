import dotenv from 'dotenv';
dotenv.config();

import IORedis, { Redis } from 'ioredis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

if (!REDIS_HOST || !REDIS_PORT) {
  throw new Error("Missing Redis environment configuration");
}

export const connection = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});
