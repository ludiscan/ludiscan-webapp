import { parseMarkdownFile, isDocFile, filePathToSlug } from './parser';

describe('parser.ts', () => {
  describe('isDocFile', () => {
    test('returns true for .md files', () => {
      expect(isDocFile('test.md')).toBe(true);
      expect(isDocFile('path/to/test.md')).toBe(true);
    });

    test('returns false for non-.md files', () => {
      expect(isDocFile('test.txt')).toBe(false);
      expect(isDocFile('test.mdx')).toBe(false);
      expect(isDocFile('test')).toBe(false);
    });

    test('returns false for hidden files', () => {
      expect(isDocFile('.hidden.md')).toBe(false);
      expect(isDocFile('.env')).toBe(false);
    });
  });

  describe('filePathToSlug', () => {
    test('removes .md extension', () => {
      expect(filePathToSlug('test.md')).toBe('test');
      expect(filePathToSlug('path/to/test.md')).toBe('path/to/test');
    });

    test('replaces backslashes with forward slashes', () => {
      expect(filePathToSlug('path\\to\\test.md')).toBe('path/to/test');
      expect(filePathToSlug('a\\b\\c\\test.md')).toBe('a/b/c/test');
    });

    test('works with no extension', () => {
      expect(filePathToSlug('test')).toBe('test');
      expect(filePathToSlug('path/to/test')).toBe('path/to/test');
    });
  });

  describe('parseMarkdownFile', () => {
    const validContent = `---
group: Getting Started
title: Introduction
order: 1
description: A getting started guide
---
# Introduction

This is the content.
`;

    test('successfully parses valid frontmatter and content', () => {
      const result = parseMarkdownFile(validContent, 'intro');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('intro');
        expect(result.data.content).toBe('# Introduction\n\nThis is the content.');
        expect(result.data.frontmatter.group).toBe('Getting Started');
        expect(result.data.frontmatter.title).toBe('Introduction');
        expect(result.data.frontmatter.order).toBe(1);
        expect(result.data.frontmatter.description).toBe('A getting started guide');
      }
    });

    test('uses default order when missing', () => {
      const content = `---
group: Guide
title: Basic
---
Content
`;
      const result = parseMarkdownFile(content, 'basic');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter.order).toBe(0);
      }
    });

    test('removes quotes from frontmatter values', () => {
      const content = `---
group: "Guide"
title: 'Advanced'
---
Content
`;
      const result = parseMarkdownFile(content, 'adv');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frontmatter.group).toBe('Guide');
        expect(result.data.frontmatter.title).toBe('Advanced');
      }
    });

    test('returns error if missing frontmatter starting delimiter', () => {
      const content = `# Title\n\nNo frontmatter`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('must start with frontmatter delimiter');
      }
    });

    test('returns error if missing frontmatter closing delimiter', () => {
      const content = `---
group: Guide
title: Test
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('closing delimiter (---) not found');
      }
    });

    test('returns error if missing required group field', () => {
      const content = `---
title: Test
---
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing required field: group');
      }
    });

    test('returns error if missing required title field', () => {
      const content = `---
group: Guide
---
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing required field: title');
      }
    });

    test('returns error if group field is empty', () => {
      const content = `---
group:
title: Test
---
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing required field: group');
      }
    });

    test('returns error if title field is empty', () => {
      const content = `---
group: Guide
title:
---
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing required field: title');
      }
    });

    test('returns error if order field is not a number', () => {
      const content = `---
group: Guide
title: Test
order: abc
---
Content
`;
      const result = parseMarkdownFile(content, 'test');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Field "order" must be a number');
      }
    });

  });
});
