import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Let BigInt fields (e.g. githubId) serialize to strings in JSON responses.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port);
  console.log(`OpenPath API listening on http://localhost:${port}/api`);
}

void bootstrap();
