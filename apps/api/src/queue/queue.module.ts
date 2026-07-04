import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { redisConnectionFromUrl } from './redis.config';

// Token for injecting the shared ingestion/scoring/recommendation queue.
export const INGESTION_QUEUE = 'INGESTION_QUEUE';

@Global()
@Module({
  providers: [
    {
      provide: INGESTION_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Queue('ingestion', {
          connection: redisConnectionFromUrl(config.get<string>('REDIS_URL')),
        }),
    },
  ],
  exports: [INGESTION_QUEUE],
})
export class QueueModule {}
