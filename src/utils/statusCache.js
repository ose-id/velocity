
// Simple in-memory cache for GitHub CI/CD statuses
// Key: repoUrl
// Value: { status, details, summary, url, timestamp }

const cache = new Map();
const CACHE_duration = 5 * 60 * 1000; // 5 minutes

export const getCachedStatus = (repoUrl) => {
  const data = cache.get(repoUrl);
  if (!data) return null;
  if (Date.now() - data.timestamp > CACHE_duration) {
    cache.delete(repoUrl);
    return null;
  }
  return data;
};

export const setCachedStatus = (repoUrl, statusData) => {
  cache.set(repoUrl, { ...statusData, timestamp: Date.now() });
};
