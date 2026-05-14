import { isDocFile } from './parser';

describe('isDocFile', () => {
  test('returns true for regular markdown files', () => {
    expect(isDocFile('document.md')).toBe(true);
    expect(isDocFile('path/to/file.md')).toBe(true);
    expect(isDocFile('index.md')).toBe(true);
  });

  test('returns false for files that do not end with .md', () => {
    expect(isDocFile('document.txt')).toBe(false);
    expect(isDocFile('file.mdx')).toBe(false);
    expect(isDocFile('image.png')).toBe(false);
    expect(isDocFile('readme.MD')).toBe(false); // Since endsWith is case-sensitive
  });

  test('returns false for hidden files (starting with a dot)', () => {
    expect(isDocFile('.hidden.md')).toBe(false);
    expect(isDocFile('.env')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isDocFile('')).toBe(false);
  });
});
