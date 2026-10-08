import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue } from 'bullmq';
import { redisConnectionFromUrl } from './redis.config';

// Token for injecting the shared ingestion/scoring/recommendation queue.
export const INGESTION_QUEUE = 'INGESTION_QUEUE';

class LazyQueue {
  private queue: Queue | null = null;

  constructor(
    private readonly name: string,
    private readonly redisUrl?: string,
  ) {}

  add(name: string, data: unknown, opts?: JobsOptions) {
    this.queue ??= new Queue(this.name, {
      connection: redisConnectionFromUrl(this.redisUrl),
    });
    return this.queue.add(name, data, opts);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: INGESTION_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new LazyQueue(
          'ingestion',
          config.get<string>('REDIS_URL'),
        ) as unknown as Queue,
    },
  ],
  exports: [INGESTION_QUEUE],
})
export class QueueModule {}
