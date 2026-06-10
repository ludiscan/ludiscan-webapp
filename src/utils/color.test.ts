import { getRandomPrimitiveColor } from '@src/utils/color';

describe(`${getRandomPrimitiveColor.name}`, () => {
  test('returns a valid hex color code', () => {
    const color = getRandomPrimitiveColor();
    expect(typeof color).toBe('string');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('returns valid hex colors over multiple invocations', () => {
    for (let i = 0; i < 100; i++) {
      const color = getRandomPrimitiveColor();
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
