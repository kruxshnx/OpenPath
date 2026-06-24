import { config } from 'dotenv';
import { resolve } from 'node:path';
import { scoreRepository } from './scoring/score-repository';

// Score an already-ingested repo from the database (needs Postgres).
//   npm run -w @openpath/worker score -- owner/repo
config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
  const fullName = process.argv[2];
  if (!fullName) {
    console.error('usage: npm run -w @openpath/worker score -- owner/repo');
    process.exit(1);
  }
  const result = await scoreRepository(fullName);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
