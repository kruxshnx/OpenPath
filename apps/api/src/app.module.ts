import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // Loads the repo-root .env (we keep a single .env for the whole monorepo).
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
