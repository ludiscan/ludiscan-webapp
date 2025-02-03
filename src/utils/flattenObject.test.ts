import { flattenObject } from './flattenObject';

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
});
