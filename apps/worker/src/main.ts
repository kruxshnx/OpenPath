import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Queue, Worker, QueueEvents, type ConnectionOptions } from 'bullmq';

// Load the repo-root .env (npm runs workspace scripts with cwd = apps/worker).
config({ path: resolve(process.cwd(), '../../.env') });

// Build connection options from REDIS_URL and let BullMQ create its own ioredis
// client. (Passing an external ioredis instance clashes with the copy bundled
// under bullmq.) Handles managed Redis with auth + TLS, e.g. Upstash rediss://.
function redisConnection(): ConnectionOptions {
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

const connection = redisConnection();
const INGESTION_QUEUE = 'ingestion';

// Producers enqueue ingestion jobs onto this queue (repo refreshes, issue pulls).
export const ingestionQueue = new Queue(INGESTION_QUEUE, { connection });

// The limiter is the core of the §0 strategy: GitHub allows 5,000 REST
// requests/hour, so we cap the worker to 5,000 jobs/hour across all
// concurrency. This guarantees ingestion never trips the rate limit.
const worker = new Worker(
  INGESTION_QUEUE,
  async (job) => {
    // TODO (Phase 1): fetch repo/issue data via GitHub REST/GraphQL and
    // upsert into Postgres using `prisma` from @openpath/db.
    console.log(`[worker] processing job ${job.id} (${job.name})`, job.data);
    return { ok: true };
  },
  {
    connection,
    limiter: { max: 5000, duration: 60 * 60 * 1000 },
    concurrency: 5,
  },
);

worker.on('ready', () => console.log('[worker] ingestion worker ready'));
worker.on('failed', (job, err) =>
  console.error(`[worker] job ${job?.id} failed:`, err.message),
);

const events = new QueueEvents(INGESTION_QUEUE, { connection });
events.on('completed', ({ jobId }) => console.log(`[worker] job ${jobId} completed`));

console.log('[worker] OpenPath ingestion worker started');
