import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
