import type { NextApiRequest, NextApiResponse } from 'next';

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  created_at: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

export interface ReleaseResponse {
  releases: GitHubRelease[];
  cached: boolean;
  cacheTime: string;
}

const GITHUB_API_URL = 'https://api.github.com/repos/ludiscan/ludiscan-webapp/releases';
const CACHE_DURATION = 12 * 60 * 60; // 12 hours in seconds

let cachedData: { data: GitHubRelease[]; timestamp: number } | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReleaseResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  const isCacheValid = cachedData && now - cachedData.timestamp < CACHE_DURATION * 1000;

  // Return cached data if valid
  if (isCacheValid && cachedData) {
    return res.status(200).json({
      releases: cachedData.data,
      cached: true,
      cacheTime: new Date(cachedData.timestamp).toISOString(),
    });
  }

  try {
    // Fetch from GitHub API
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ludiscan-webapp',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const releases: GitHubRelease[] = await response.json();

    // Filter out drafts and sort by published date (newest first)
    const filteredReleases = releases
      .filter((release) => !release.draft)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Update cache
    cachedData = {
      data: filteredReleases,
      timestamp: now,
    };

    // Set cache headers (12 hours)
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`);

    return res.status(200).json({
      releases: filteredReleases,
      cached: false,
      cacheTime: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error('Error fetching releases:', error);
    return res.status(500).json({ error: 'Failed to fetch releases' });
  }
}
