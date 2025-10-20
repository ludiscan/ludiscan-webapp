/**
 * YAML Frontmatter & Markdown Parser
 * Safely parses docs files with frontmatter validation
 */

import type { DocFrontmatter, DocPage, DocParseResult } from './types';

const FRONTMATTER_DELIMITER = '---';
const REQUIRED_FIELDS = ['group', 'title'] as const;

/**
 * Parse YAML frontmatter string into a structured object
 * Simple parser - doesn't support complex YAML features
 */
function parseYamlFrontmatter(yaml: string): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  yaml.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (key && value) {
      // Remove quotes if present
      obj[key] = value.replace(/^["']|["']$/g, '');
    }
  });

  return obj;
}

/**
 * Validate and type frontmatter data
 */
function validateFrontmatter(data: Record<string, unknown>): { valid: boolean; errors: string[]; data?: DocFrontmatter } {
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate types
  const group = String(data.group || '').trim();
  const title = String(data.title || '').trim();
  const order = typeof data.order === 'string' ? parseInt(data.order, 10) : typeof data.order === 'number' ? data.order : 0;
  const description = data.description ? String(data.description).trim() : undefined;

  if (!group) {
    errors.push('Field "group" cannot be empty');
  }
  if (!title) {
    errors.push('Field "title" cannot be empty');
  }
  if (isNaN(order)) {
    errors.push('Field "order" must be a number');
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: undefined };
  }

  return {
    valid: true,
    errors: [],
    data: {
      group,
      title,
      order: order || 0,
      description,
    },
  };
}

/**
 * Parse a markdown file with YAML frontmatter
 * Safely extracts frontmatter and content
 */
export function parseMarkdownFile(fileContent: string, slug: string): DocParseResult {
  try {
    const lines = fileContent.split('\n');

    // Check if frontmatter exists
    if (lines.length < 2 || lines[0].trim() !== FRONTMATTER_DELIMITER) {
      return {
        success: false,
        error: 'File must start with frontmatter delimiter (---)',
        file: slug,
      };
    }

    // Find frontmatter end
    let frontmatterEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === FRONTMATTER_DELIMITER) {
        frontmatterEnd = i;
        break;
      }
    }

    if (frontmatterEnd === -1) {
      return {
        success: false,
        error: 'Frontmatter closing delimiter (---) not found',
        file: slug,
      };
    }

    // Extract frontmatter and content
    const frontmatterStr = lines.slice(1, frontmatterEnd).join('\n');
    const contentLines = lines.slice(frontmatterEnd + 1);
    const content = contentLines.join('\n').trim();

    // Parse and validate frontmatter
    const rawFrontmatter = parseYamlFrontmatter(frontmatterStr);
    const validationResult = validateFrontmatter(rawFrontmatter);

    if (!validationResult.valid) {
      return {
        success: false,
        error: `Frontmatter validation failed: ${validationResult.errors.join(', ')}`,
        file: slug,
      };
    }

    if (!validationResult.data) {
      return {
        success: false,
        error: 'Failed to extract frontmatter data',
        file: slug,
      };
    }

    // Create doc page
    const docPage: DocPage = {
      slug,
      frontmatter: validationResult.data,
      content,
    };

    return {
      success: true,
      data: docPage,
    };
  } catch (error) {
    return {
      success: false,
      error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      file: slug,
    };
  }
}

/**
 * Check if a file should be processed as a doc
 */
export function isDocFile(filename: string): boolean {
  return filename.endsWith('.md') && !filename.startsWith('.');
}

/**
 * Convert file path to slug
 * e.g., 'heatmap/getting-started.md' -> 'heatmap/getting-started'
 */
export function filePathToSlug(filePath: string): string {
  return filePath.replace(/\.md$/, '').replace(/\\/g, '/');
}
