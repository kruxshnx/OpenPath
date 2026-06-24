import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    // Loads the repo-root .env (we keep a single .env for the whole monorepo).
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    QueueModule,
    AuthModule,
    UsersModule,
    RepositoriesModule,
    RecommendationsModule,
    SkillsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
