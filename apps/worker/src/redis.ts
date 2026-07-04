import type { ConnectionOptions } from 'bullmq';

export const INGESTION_QUEUE = 'ingestion';

// Build BullMQ connection options from REDIS_URL and let BullMQ create its own
// ioredis client. Handles managed Redis with auth + TLS (e.g. Upstash rediss://).
export function redisConnection(): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
