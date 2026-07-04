import type { ConnectionOptions } from 'bullmq';

// Connection options for the API's BullMQ producer. lazyConnect keeps the API
// from hammering Redis at boot when it isn't running yet (connects on first add).
export function redisConnectionFromUrl(redisUrl?: string): ConnectionOptions {
  const url = new URL(redisUrl ?? 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
}
