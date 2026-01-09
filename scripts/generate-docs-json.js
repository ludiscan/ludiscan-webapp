#!/usr/bin/env node

/**
 * Generate docs-groups.json for production use
 *
 * This script reads all markdown files from src/docs/ and generates
 * a JSON file containing document metadata for the sidebar navigation.
 *
 * Usage: node scripts/generate-docs-json.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'src', 'docs');
const OUTPUT_GROUPS_FILE = path.join(__dirname, '..', 'generated', 'docs-groups.json');
const OUTPUT_PAGES_FILE = path.join(__dirname, '..', 'generated', 'docs-pages.json');
const FRONTMATTER_DELIMITER = '---';

/**
 * Parse YAML frontmatter string into a structured object
 */
function parseYamlFrontmatter(yaml) {
  const obj = {};

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
 * Parse a markdown file and extract frontmatter and content
 */
function parseMarkdownFile(filePath, slug) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    // Check if frontmatter exists
    if (lines.length < 2 || lines[0].trim() !== FRONTMATTER_DELIMITER) {
      return { success: false, error: 'File must start with frontmatter delimiter (---)' };
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
      return { success: false, error: 'Frontmatter closing delimiter (---) not found' };
    }

    // Extract frontmatter
    const frontmatterStr = lines.slice(1, frontmatterEnd).join('\n');
    const rawFrontmatter = parseYamlFrontmatter(frontmatterStr);

    // Validate required fields
    if (!rawFrontmatter.group || !rawFrontmatter.title) {
      return { success: false, error: 'Missing required fields (group, title)' };
    }

    const frontmatter = {
      group: String(rawFrontmatter.group).trim(),
      title: String(rawFrontmatter.title).trim(),
      order: parseInt(rawFrontmatter.order, 10) || 0,
      description: rawFrontmatter.description ? String(rawFrontmatter.description).trim() : undefined,
      public: rawFrontmatter.public !== 'false',
    };

    // Extract markdown content (everything after the closing frontmatter delimiter)
    const content = lines.slice(frontmatterEnd + 1).join('\n').trim();

    return {
      success: true,
      data: {
        slug,
        frontmatter,
        content,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Recursively walk through the docs directory
 */
function walkDir(dir, prefix = '') {
  const pages = [];
  const errors = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix + entry.name;

      if (entry.isDirectory()) {
        const subResult = walkDir(fullPath, `${relativePath}/`);
        pages.push(...subResult.pages);
        errors.push(...subResult.errors);
      } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
        const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
        const result = parseMarkdownFile(fullPath, slug);

        if (result.success && result.data) {
          pages.push(result.data);
        } else {
          errors.push({ file: relativePath, error: result.error });
        }
      }
    }
  } catch (error) {
    errors.push({ file: dir, error: error.message });
  }

  return { pages, errors };
}

/**
 * Create DocGroup array from pages
 */
function createDocGroups(pages) {
  // Filter to only public pages
  const publicPages = pages.filter((page) => page.frontmatter.public !== false);

  // Group pages by their group field
  const groupMap = new Map();

  publicPages.forEach((page) => {
    const group = page.frontmatter.group;
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
    groupMap.get(group).push(page);
  });

  // Sort pages within each group by order, then create groups array
  const groups = Array.from(groupMap.entries())
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.frontmatter.order - b.frontmatter.order),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return groups;
}

/**
 * Create pages object (slug -> page data map)
 */
function createPagesObject(pages) {
  const pagesObj = {};
  pages.forEach((page) => {
    pagesObj[page.slug] = page;
  });
  return pagesObj;
}

/**
 * Main function
 */
function main() {
  console.log('[generate-docs-json] Starting docs JSON generation...');

  // Check if docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`[generate-docs-json] Docs directory not found at ${DOCS_DIR}`);
    process.exit(1);
  }

  // Walk through docs directory
  const { pages, errors } = walkDir(DOCS_DIR);

  // Log any errors
  if (errors.length > 0) {
    console.warn(`[generate-docs-json] ${errors.length} file(s) failed to load:`);
    errors.forEach(({ file, error }) => {
      console.warn(`  - ${file}: ${error}`);
    });
  }

  // Create doc groups (for sidebar navigation)
  const groups = createDocGroups(pages);

  // Create pages object (for page content lookup)
  const pagesObj = createPagesObject(pages);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_GROUPS_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write groups JSON file (sidebar navigation)
  fs.writeFileSync(OUTPUT_GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf-8');

  // Write pages JSON file (full page content)
  fs.writeFileSync(OUTPUT_PAGES_FILE, JSON.stringify(pagesObj, null, 2), 'utf-8');

  console.log(`[generate-docs-json] Generated ${OUTPUT_GROUPS_FILE}`);
  console.log(`[generate-docs-json] Generated ${OUTPUT_PAGES_FILE}`);
  console.log(`[generate-docs-json] Total groups: ${groups.length}, Total pages: ${pages.length}`);
}

main();
