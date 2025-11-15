/**
 * API route to get documentation groups
 * Returns the list of doc groups for sidebar navigation
 */

import type { DocGroup } from '@src/utils/docs/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getPublicDocGroups } from '@src/utils/docs/loader';

export default async function handler(req: NextApiRequest, res: NextApiResponse<DocGroup[] | { error: string }>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only return public docs (where public !== false)
    const groups = await getPublicDocGroups();

    // Set cache headers to reduce server load
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return res.status(200).json(groups);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[API] Error fetching doc groups:', errorMessage);
    return res.status(500).json({ error: 'Failed to load documentation groups' });
  }
}
