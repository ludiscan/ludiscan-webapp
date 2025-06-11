import { capitalize } from '@src/utils/string';

describe(`${capitalize.name}`, () => {
  test('通常の文字列を正しく大文字化できること', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  test('1文字の文字列を大文字化できること', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('z')).toBe('Z');
  });

  test('すでに大文字で始まる文字列は変更されないこと', () => {
    expect(capitalize('Hello')).toBe('Hello');
    expect(capitalize('World')).toBe('World');
  });

  test('空文字列の場合は空文字列を返すこと', () => {
    expect(capitalize('')).toBe('');
  });

  test('数字で始まる文字列はそのまま返すこと', () => {
    expect(capitalize('123abc')).toBe('123abc');
  });

  test('日本語の文字列も大文字化できること', () => {
    expect(capitalize('あいうえお')).toBe('あいうえお');
    expect(capitalize('ａｂｃ')).toBe('Ａｂｃ');
  });
});
