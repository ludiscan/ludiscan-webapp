/**
 * Docs system types - Type-safe interfaces for documentation pages
 */

export interface DocFrontmatter {
  group: string;
  title: string;
  order: number;
  description?: string;
  public?: boolean; // Default: true. Set to false to hide from public docs
}

export interface DocPage {
  slug: string; // file path without .md (e.g., 'heatmap/getting-started')
  frontmatter: DocFrontmatter;
  content: string; // Markdown content
  html?: string; // Rendered HTML (optional, for caching)
}

export interface DocGroup {
  name: string;
  items: DocPage[];
}

export interface DocsCollection {
  pages: Map<string, DocPage>;
  groups: DocGroup[];
  lastUpdated?: number;
}

export interface DocParseResult {
  success: boolean;
  data?: DocPage;
  error?: string;
  file?: string;
}
