import { flattenObject } from '@src/utils/flattenObject';

describe(`${flattenObject.name}`, () => {
  test('オブジェクトをフラット化する', () => {
    const obj = {
      a: {
        b: {
          c: {
            d: 'value',
          },
        },
      },
      e: 'value e',
      f: {
        g: 'value g',
      },
    };

    expect(flattenObject(obj)).toEqual([
      { name: 'a.b.c.d', value: 'value' },
      { name: 'e', value: 'value e' },
      { name: 'f.g', value: 'value g' },
    ]);
  });

  test('空のオブジェクトを渡した場合は空の配列を返す', () => {
    expect(flattenObject({})).toEqual([]);
  });

  test('prefixを指定した場合は、キーの先頭にprefixが付与される', () => {
    const obj = {
      a: 'value a',
      b: {
        c: 'value c',
      },
    };

    expect(flattenObject(obj, 'prefix')).toEqual([
      { name: 'prefix.a', value: 'value a' },
      { name: 'prefix.b.c', value: 'value c' },
    ]);
  });

  test('nullやundefinedの値は無視される', () => {
    const obj = {
      a: 'value a',
      b: null,
      c: undefined,
      d: {
        e: null,
        f: undefined,
      },
    };

    expect(flattenObject(obj)).toEqual([{ name: 'a', value: 'value a' }]);
  });

  test('数値や真偽値などの文字列以外の値は無視される', () => {
    const obj = {
      a: 'value a',
      b: 123,
      c: true,
      d: {
        e: 456,
        f: false,
      },
    };

    expect(flattenObject(obj)).toEqual([{ name: 'a', value: 'value a' }]);
  });

  test('空のネストされたオブジェクトはキーを生成しない', () => {
    const obj = {
      a: 'value a',
      b: {},
      c: {
        d: {},
      },
    };

    expect(flattenObject(obj)).toEqual([{ name: 'a', value: 'value a' }]);
  });
});
