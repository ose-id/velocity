export function toSshUrl(httpsUrl) {
  if (!httpsUrl) return httpsUrl;
  if (/\.zip($|\?)/i.test(httpsUrl)) return httpsUrl;

  try {
    const u = new URL(httpsUrl);
    if (u.hostname !== 'github.com') return httpsUrl;

    const parts = u.pathname.replace(/^\/+/, '').split('/');
    if (parts.length < 2) return httpsUrl;

    const [owner, repoRaw] = parts;
    const repo = repoRaw.endsWith('.git') ? repoRaw : `${repoRaw}.git`;

    return `git@github.com:${owner}/${repo}`;
  } catch {
    return httpsUrl;
  }
}

export function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    const date = d.toLocaleDateString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    const time = d.toLocaleTimeString(undefined, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${date} ${time}`;
  } catch {
    return ts;
  }
}
