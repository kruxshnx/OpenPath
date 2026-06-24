import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Worker, QueueEvents } from 'bullmq';
import { INGESTION_QUEUE, redisConnection } from './redis';
import { ingestRepository } from './ingestion';

// Load the repo-root .env (npm runs workspace scripts with cwd = apps/worker).
config({ path: resolve(process.cwd(), '../../.env') });

const connection = redisConnection();

// The limiter is the core of the §0 strategy: GitHub allows 5,000 REST
// requests/hour, so we cap the worker to 5,000 jobs/hour across all
// concurrency. This guarantees ingestion never trips the rate limit.
const worker = new Worker(
  INGESTION_QUEUE,
  async (job) => {
    if (job.name === 'ingest-repo') {
      const { fullName } = job.data as { fullName: string };
      const result = await ingestRepository(fullName);
      console.log(
        `[worker] ingested ${fullName}: repo ${result.repositoryId}, ${result.issueCount} issues`,
      );
      return result;
    }
    console.warn(`[worker] unknown job "${job.name}"`);
    return { ok: false };
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
