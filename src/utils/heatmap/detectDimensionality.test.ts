import { detectDimensionality, hasNonZeroZ } from './detectDimensionality';
import type { HeatmapTask } from '@src/modeles/heatmaptask';

describe('detectDimensionality', () => {
  describe('1. ユーザーによる手動切り替え（最優先）', () => {
    test('dimensionalityOverrideが指定されている場合はそれが最優先されること', () => {
      // 2D override
      expect(detectDimensionality('2d', false, { id: '1', zVisible: true } as unknown as HeatmapTask)).toBe('2d');
      expect(detectDimensionality('2d', undefined, undefined)).toBe('2d');

      // 3D override
      expect(detectDimensionality('3d', true, { id: '1', zVisible: false } as unknown as HeatmapTask)).toBe('3d');
      expect(detectDimensionality('3d', undefined, undefined)).toBe('3d');
    });
  });

  describe('2. プロジェクトのis2Dフラグ', () => {
    test('dimensionalityOverrideがなく、projectIs2Dが指定されている場合はそれが優先されること', () => {
      expect(detectDimensionality(null, true, { id: '1', zVisible: true } as unknown as HeatmapTask)).toBe('2d');
      expect(detectDimensionality(undefined, true, undefined)).toBe('2d');

      expect(detectDimensionality(null, false, { id: '1', zVisible: false } as unknown as HeatmapTask)).toBe('3d');
      expect(detectDimensionality(undefined, false, undefined)).toBe('3d');
    });
  });

  describe('3. 後方互換性: taskのzVisibleで判定', () => {
    test('dimensionalityOverrideとprojectIs2Dがなく、taskが指定されていない場合はデフォルトで3dを返すこと', () => {
      expect(detectDimensionality(null, undefined, undefined)).toBe('3d');
    });

    test('task.zVisibleが明示的にfalseの場合は2dを返すこと', () => {
      expect(detectDimensionality(null, undefined, { id: '1', zVisible: false } as unknown as HeatmapTask)).toBe('2d');
    });

    test('task.zVisibleがtrueの場合は3dを返すこと', () => {
      expect(detectDimensionality(null, undefined, { id: '1', zVisible: true } as unknown as HeatmapTask)).toBe('3d');
    });

    test('task.zVisibleがundefinedの場合はデフォルトで3dを返すこと', () => {
      expect(detectDimensionality(null, undefined, { id: '1' } as unknown as HeatmapTask)).toBe('3d');
    });
  });
});

describe('hasNonZeroZ', () => {
  test('空の配列の場合はfalseを返すこと', () => {
    expect(hasNonZeroZ([])).toBe(false);
  });

  test('すべての要素のzが0の場合はfalseを返すこと', () => {
    expect(hasNonZeroZ([{ z: 0 }, { z: 0 }])).toBe(false);
  });

  test('すべての要素にzが未定義の場合はfalseを返すこと', () => {
    expect(hasNonZeroZ([{}, { x: 1, y: 2 }])).toBe(false);
  });

  test('一部の要素のzが0以外の場合はtrueを返すこと', () => {
    expect(hasNonZeroZ([{ z: 0 }, { z: 1 }])).toBe(true);
    expect(hasNonZeroZ([{ z: 0 }, { z: -0.5 }])).toBe(true);
    expect(hasNonZeroZ([{}, { z: 10 }])).toBe(true);
  });
});
