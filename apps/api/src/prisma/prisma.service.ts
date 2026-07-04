import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@openpath/db';

// Extends the generated PrismaClient so it can be injected anywhere in Nest.
// We rely on Prisma's lazy connection (connects on first query) so the API can
// still boot — and serve /health — even when the database is not yet up.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
