import { config } from 'dotenv';
import { resolve } from 'node:path';
import { generateRecommendations } from './recommendation/generate';

// Generate recommendations for a user from the database (needs Postgres).
//   npm run -w @openpath/worker recommend -- <userId>
config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('usage: npm run -w @openpath/worker recommend -- <userId>');
    process.exit(1);
  }
  const result = await generateRecommendations(userId);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
