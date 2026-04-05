interface ApiResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

const GITHUB_API_BASE = 'https://api.github.com';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  };
  const token = process.env.GITHUB_TOKEN;
  // Support both classic tokens (ghp_*) and OAuth tokens
  if (token && !token.startsWith('your_')) {
    // Classic tokens use 'token' prefix, OAuth tokens use 'Bearer'
    const prefix = token.startsWith('ghp_') ? 'token' : 'Bearer';
    headers['Authorization'] = `${prefix} ${token}`;
  }
  return headers;
}

export async function fetchRepoTree(
  owner: string,
  repo: string
): Promise<ApiResult<{ path: string; sha: string; type: string }[]>> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers: getHeaders() }
    );
    if (res.status === 404) {
      return { success: false, data: null, error: 'Repository not found or is private. GreenDev Coach only works with public repos.' };
    }
    if (res.status === 403) {
      return { success: false, data: null, error: 'GitHub rate limit reached. Try again in a few minutes.' };
    }
    if (!res.ok) {
      return { success: false, data: null, error: `GitHub API error: ${res.status}` };
    }
    const json = await res.json();
    return { success: true, data: json.tree || [], error: null };
  } catch {
    return { success: false, data: null, error: 'Could not reach GitHub. Check your connection.' };
  }
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<ApiResult<string>> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    );
    if (!res.ok) return { success: false, data: null, error: `Could not fetch ${path}` };
    const json = await res.json();
    if (json.encoding === 'base64' && json.content) {
      const content = Buffer.from(json.content, 'base64').toString('utf-8');
      return { success: true, data: content, error: null };
    }
    return { success: false, data: null, error: 'Unexpected file encoding' };
  } catch {
    return { success: false, data: null, error: `Failed to fetch ${path}` };
  }
}

export async function fetchRepoMeta(
  owner: string,
  repo: string
): Promise<ApiResult<{ stars: number; language: string; size: number; topics: string[]; isPrivate: boolean }>> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return { success: false, data: null, error: 'Failed to fetch repo metadata' };
    const json = await res.json();
    return {
      success: true,
      data: {
        stars: json.stargazers_count,
        language: json.language,
        size: json.size,
        topics: json.topics || [],
        isPrivate: json.private === true,
      },
      error: null,
    };
  } catch {
    return { success: false, data: null, error: 'Failed to fetch repo metadata' };
  }
}

/**
 * Fetches the last 52 weeks of commit activity and returns the
 * actual average monthly commit count (last 4 full weeks × 30/7).
 * Falls back to 0 if GitHub hasn't yet computed the stats (202 response).
 */
export async function fetchCommitActivity(
  owner: string,
  repo: string
): Promise<ApiResult<{ monthlyCommits: number; weeklyAvg: number }>> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`,
      { headers: getHeaders() }
    );
    // 202 = GitHub is computing stats, not ready yet
    if (res.status === 202) return { success: true, data: { monthlyCommits: 0, weeklyAvg: 0 }, error: null };
    if (!res.ok) return { success: false, data: null, error: 'Failed to fetch commit activity' };
    const weeks: { total: number }[] = await res.json();
    if (!Array.isArray(weeks) || weeks.length === 0) {
      return { success: true, data: { monthlyCommits: 0, weeklyAvg: 0 }, error: null };
    }
    // Use last 12 weeks for a more stable average (avoids outlier sprints)
    const recent = weeks.slice(-12);
    const totalCommits = recent.reduce((s, w) => s + (w.total || 0), 0);
    const weeklyAvg = totalCommits / recent.length;
    const monthlyCommits = Math.round(weeklyAvg * 4.33); // 4.33 weeks per month
    return { success: true, data: { monthlyCommits, weeklyAvg }, error: null };
  } catch {
    return { success: false, data: null, error: 'Failed to fetch commit activity' };
  }
}
