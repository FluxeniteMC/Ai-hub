/**
 * Build-time GitHub status lookup.
 *
 * Captures the latest commit and the latest Pages deployment so the site can
 * show live repository status. This runs during `npm run build` only — the
 * browser never talks to the GitHub API, and no token is shipped to the client.
 *
 * Uses GITHUB_TOKEN when running in Actions (higher rate limit); otherwise it
 * falls back to the anonymous public API. Any failure degrades to nulls rather
 * than failing the build, so an offline or rate-limited build still succeeds.
 */

const API = 'https://api.github.com';

function headers() {
  const base = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'fluxenite-ai-hub-site',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { headers: headers(), signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{repo: string, workflow: string, fallbackSha?: string|null}} options
 * @returns {Promise<{commit: object|null, deployment: object|null, fetchedAt: string}>}
 */
export async function fetchRepoStatus({ repo, workflow, fallbackSha = null }) {
  const [owner, name] = repo.split('/');
  const [commitData, runData] = await Promise.all([
    getJson(`${API}/repos/${owner}/${name}/commits?per_page=1`),
    getJson(`${API}/repos/${owner}/${name}/actions/workflows/${workflow}/runs?per_page=1`),
  ]);

  let commit = null;
  const raw = Array.isArray(commitData) ? commitData[0] : null;
  if (raw && raw.sha) {
    commit = {
      sha: raw.sha,
      shortSha: String(raw.sha).slice(0, 7),
      message: String(raw.commit?.message ?? '')
        .split('\n')
        .filter(Boolean)[0],
      author: raw.commit?.author?.name ?? raw.author?.login ?? 'Unknown',
      date: raw.commit?.author?.date ?? null,
      htmlUrl: raw.htmlUrl ?? `https://github.com/${repo}/commit/${raw.sha}`,
      isDeployed: fallbackSha ? String(raw.sha).startsWith(String(fallbackSha).slice(0, 7)) : null,
    };
  }

  let deployment = null;
  // The Actions API wraps results in { workflow_runs: [...] }, not a bare array.
  const runs = Array.isArray(runData?.workflow_runs) ? runData.workflow_runs : [];
  // Prefer the most recent FINISHED run. While a build is running its own run
  // already exists with status "in_progress", so taking runs[0] would make every
  // deployed page report itself as in-flight instead of the real last outcome.
  const run = runs.find((item) => item.status === 'completed') ?? runs[0] ?? null;
  if (run) {
    deployment = {
      status: run.status ?? null,
      conclusion: run.conclusion ?? null,
      htmlUrl: run.html_url ?? null,
      updatedAt: run.updated_at ?? null,
      sha: run.head_sha ?? null,
    };
  }

  return { commit, deployment, fetchedAt: new Date().toISOString() };
}