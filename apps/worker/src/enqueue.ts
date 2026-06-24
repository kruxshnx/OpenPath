import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Queue } from 'bullmq';
import { INGESTION_QUEUE, redisConnection } from './redis';

// Enqueue one or more repos for ingestion (needs Redis running).
//   npm run -w @openpath/worker enqueue -- facebook/react vercel/next.js
config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
  const repos = process.argv.slice(2);
  if (!repos.length) {
    console.error(
      'usage: npm run -w @openpath/worker enqueue -- owner/repo [owner/repo ...]',
    );
    process.exit(1);
  }

  const queue = new Queue(INGESTION_QUEUE, { connection: redisConnection() });
  for (const fullName of repos) {
    await queue.add(
      'ingest-repo',
      { fullName },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    console.log(`enqueued ${fullName}`);
  }
  await queue.close();
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
