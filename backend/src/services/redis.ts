import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export async function cacheTraderData(traderId: string, data: any, ttl = 300) {
  await redis.setex(`trader:${traderId}`, ttl, JSON.stringify(data));
}

export async function getCachedTraderData(traderId: string) {
  const data = await redis.get(`trader:${traderId}`);
  return data ? JSON.parse(data) : null;
}

export async function cacheUserSettings(userId: string, settings: any) {
  await redis.set(`user:${userId}:settings`, JSON.stringify(settings));
}

export async function getUserSettings(userId: string) {
  const data = await redis.get(`user:${userId}:settings`);
  return data ? JSON.parse(data) : null;
}

export async function cachePosition(positionId: string, position: any, ttl = 60) {
  await redis.setex(`position:${positionId}`, ttl, JSON.stringify(position));
}

export async function getCachedPosition(positionId: string) {
  const data = await redis.get(`position:${positionId}`);
  return data ? JSON.parse(data) : null;
}

export async function addUserPosition(userId: string, positionId: string) {
  await redis.sadd(`user:${userId}:positions`, positionId);
}

export async function getUserPositions(userId: string): Promise<string[]> {
  return await redis.smembers(`user:${userId}:positions`);
}

export async function removeUserPosition(userId: string, positionId: string) {
  await redis.srem(`user:${userId}:positions`, positionId);
}

export async function publishSignal(channel: string, signal: any) {
  await redis.publish(`signals:${channel}`, JSON.stringify(signal));
}

export async function subscribeToSignals(channel: string, callback: (signal: any) => void) {
  const subscriber = redis.duplicate();
  
  subscriber.subscribe(`signals:${channel}`);
  
  subscriber.on('message', (ch, message) => {
    if (ch === `signals:${channel}`) {
      callback(JSON.parse(message));
    }
  });
  
  return () => {
    subscriber.unsubscribe(`signals:${channel}`);
    subscriber.quit();
  };
}

export async function cacheLeaderboard(traders: any[], ttl = 60) {
  await redis.setex('leaderboard', ttl, JSON.stringify(traders));
}

export async function getCachedLeaderboard() {
  const data = await redis.get('leaderboard');
  return data ? JSON.parse(data) : null;
}

export async function cacheTradeFills(address: string, fills: any[], ttl = 30) {
  await redis.setex(`fills:${address}`, ttl, JSON.stringify(fills));
}

export async function getCachedTradeFills(address: string) {
  const data = await redis.get(`fills:${address}`);
  return data ? JSON.parse(data) : null;
}

export { redis };
