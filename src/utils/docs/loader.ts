/**
 * Docs Loader - Safe file loading for both dev and build environments
 * Uses server-side file operations only during build/SSG
 * Provides error handling and caching
 */

import type { DocsCollection, DocGroup, DocPage } from './types';

// In-memory cache that persists across requests
let docsCache: DocsCollection | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Get cached docs or clear if expired
 */
function getCachedDocs(): DocsCollection | null {
  if (!docsCache) return null;
  if (!cacheTimestamp) return null;

  const now = Date.now();
  if (now - cacheTimestamp > CACHE_TTL) {
    docsCache = null;
    cacheTimestamp = null;
    return null;
  }

  return docsCache;
}

/**
 * Set docs in cache
 */
function setCachedDocs(docs: DocsCollection): void {
  docsCache = docs;
  cacheTimestamp = Date.now();
}

/**
 * Create an empty docs collection (fallback)
 */
function createEmptyDocsCollection(): DocsCollection {
  return {
    pages: new Map(),
    groups: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Create a DocsCollection from loaded pages
 */
function createDocsCollection(pages: Map<string, DocPage>): DocsCollection {
  // Group pages by their group field
  const groupMap = new Map<string, DocPage[]>();

  pages.forEach((page) => {
    const group = page.frontmatter.group;
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
    groupMap.get(group)!.push(page);
  });

  // Sort pages within each group by order
  const groups: DocGroup[] = Array.from(groupMap.entries())
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.frontmatter.order - b.frontmatter.order),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    pages,
    groups,
    lastUpdated: Date.now(),
  };
}

/**
 * Process a single markdown file
 */
async function processDocFile(
  fullPath: string,
  relativePath: string,
  pages: Map<string, DocPage>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fs: any,
  errors: Array<{ file: string; error: string }>,
): Promise<void> {
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

    // Dynamically import parser
    const { parseMarkdownFile } = await import('./parser');
    const result = parseMarkdownFile(content, slug);

    if (result.success && result.data) {
      pages.set(slug, result.data);
    } else {
      errors.push({ file: relativePath, error: result.error || 'Unknown parse error' });
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error';
    errors.push({ file: relativePath, error: err });
  }
}

/**
 * Load all documentation files from disk
 * IMPORTANT: This should only be called on the server side (build time or SSR)
 */
export async function loadDocsFromDisk(): Promise<DocsCollection> {
  // Check cache first
  const cached = getCachedDocs();
  if (cached) {
    return cached;
  }

  // Dynamically import fs only when needed (server-side)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let path: any;

  try {
    fs = await import('fs/promises');
    path = await import('path');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Docs Loader] Failed to import fs/path - this should only happen on client side', err);
    return createEmptyDocsCollection();
  }

  const DOCS_DIR = path.join(process.cwd(), 'src/docs');

  try {
    // Check if docs directory exists
    await fs.access(DOCS_DIR);
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`[Docs Loader] Docs directory not found at ${DOCS_DIR}`);
    return createEmptyDocsCollection();
  }

  const pages = new Map<string, DocPage>();
  const errors: Array<{ file: string; error: string }> = [];

  /**
   * Recursively walk through the docs directory
   */
  const walkDir = async (dir: string, prefix: string = ''): Promise<void> => {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        try {
          const fullPath = path.join(dir, entry.name);
          const relativePath = prefix + entry.name;

          if (entry.isDirectory()) {
            // Recursively process subdirectories
            await walkDir(fullPath, `${relativePath}/`);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            // Process markdown files
            await processDocFile(fullPath, relativePath, pages, fs, errors);
          }
        } catch (error) {
          const err = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ file: `${prefix}${entry.name}`, error: err });
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error(`[Docs Loader] Error reading directory ${dir}: ${err}`);
    }
  };

  await walkDir(DOCS_DIR);

  // Log any errors that occurred during loading
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[Docs Loader] ${errors.length} file(s) failed to load:`);
    errors.forEach(({ file, error }) => {
      // eslint-disable-next-line no-console
      console.warn(`  - ${file}: ${error}`);
    });
  }

  // Create docs collection
  const docs = createDocsCollection(pages);

  // Cache the result
  setCachedDocs(docs);

  return docs;
}

/**
 * Get a single doc by slug
 */
export async function getDocBySlug(slug: string): Promise<DocPage | null> {
  const docs = await loadDocsFromDisk();
  return docs.pages.get(slug) ?? null;
}

/**
 * Get all groups
 */
export async function getDocGroups(): Promise<DocGroup[]> {
  const docs = await loadDocsFromDisk();
  return docs.groups;
}

/**
 * Get all pages
 */
export async function getAllDocs(): Promise<DocPage[]> {
  const docs = await loadDocsFromDisk();
  return Array.from(docs.pages.values());
}

/**
 * Get all slugs for static generation
 */
export async function getDocSlugs(): Promise<string[]> {
  const docs = await loadDocsFromDisk();
  return Array.from(docs.pages.keys());
}

/**
 * Clear cache (useful for development)
 */
export function clearDocsCache(): void {
  docsCache = null;
  cacheTimestamp = null;
}
