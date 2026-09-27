export interface StatusCacheData {
  status: string;
  details?: unknown;
  summary?: string;
  url?: string | null;
  timestamp?: number;
  [key: string]: unknown;
}

const cache = new Map<string, StatusCacheData & { timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedStatus = (repoUrl: string): StatusCacheData | null => {
  const data = cache.get(repoUrl);
  if (!data) return null;
  if (Date.now() - data.timestamp > CACHE_DURATION) {
    cache.delete(repoUrl);
    return null;
  }
  return data;
};

export const setCachedStatus = (repoUrl: string, statusData: StatusCacheData): void => {
  cache.set(repoUrl, { ...statusData, timestamp: Date.now() });
};
