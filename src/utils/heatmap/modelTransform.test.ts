import { alignmentToTransform, parseTransformHeader, toModelTransform, transformToAlignmentPatch } from '@src/utils/heatmap/modelTransform';

describe('alignmentToTransform', () => {
  it('converts degrees to radians and expands uniform scale', () => {
    const result = alignmentToTransform({
      modelPositionX: 1,
      modelPositionY: 2,
      modelPositionZ: 3,
      modelRotationX: 0,
      modelRotationY: 180,
      modelRotationZ: -90,
      scale: 2,
    });
    expect(result.position).toEqual([1, 2, 3]);
    expect(result.rotation[0]).toBeCloseTo(0);
    expect(result.rotation[1]).toBeCloseTo(Math.PI);
    expect(result.rotation[2]).toBeCloseTo(-Math.PI / 2);
    expect(result.scale).toEqual([2, 2, 2]);
  });
});

describe('transformToAlignmentPatch', () => {
  it('converts radians to degrees and takes uniform scale from x', () => {
    const patch = transformToAlignmentPatch({
      position: [4, 5, 6],
      rotation: [0, Math.PI, -Math.PI / 2],
      scale: [3, 3, 3],
    });
    expect(patch.modelPositionX).toBe(4);
    expect(patch.modelPositionY).toBe(5);
    expect(patch.modelPositionZ).toBe(6);
    expect(patch.modelRotationX).toBeCloseTo(0);
    expect(patch.modelRotationY).toBeCloseTo(180);
    expect(patch.modelRotationZ).toBeCloseTo(-90);
    expect(patch.scale).toBe(3);
  });

  it('round-trips with alignmentToTransform', () => {
    const original = {
      modelPositionX: 10,
      modelPositionY: -5,
      modelPositionZ: 0,
      modelRotationX: 45,
      modelRotationY: 90,
      modelRotationZ: -135,
      scale: 1.5,
    };
    const patch = transformToAlignmentPatch(alignmentToTransform(original));
    expect(patch.modelPositionX).toBeCloseTo(original.modelPositionX);
    expect(patch.modelRotationX).toBeCloseTo(original.modelRotationX);
    expect(patch.modelRotationZ).toBeCloseTo(original.modelRotationZ);
    expect(patch.scale).toBeCloseTo(original.scale);
  });
});

describe('toModelTransform', () => {
  it('accepts a valid parsed object', () => {
    expect(toModelTransform({ position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] })).toEqual({
      position: [1, 2, 3],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  });

  it('returns null for null / non-object / wrong shape', () => {
    expect(toModelTransform(null)).toBeNull();
    expect(toModelTransform(42)).toBeNull();
    expect(toModelTransform({ position: [1, 2], rotation: [0, 0, 0], scale: [1, 1, 1] })).toBeNull();
    expect(toModelTransform({ position: [1, 2, 3], rotation: [0, 0, 0] })).toBeNull();
  });
});

describe('parseTransformHeader', () => {
  it('parses a valid transform JSON header', () => {
    const header = JSON.stringify({ position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] });
    expect(parseTransformHeader(header)).toEqual({
      position: [1, 2, 3],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  });

  it('returns null for null / empty header', () => {
    expect(parseTransformHeader(null)).toBeNull();
    expect(parseTransformHeader('')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseTransformHeader('{not json')).toBeNull();
  });

  it('returns null when a vector has the wrong shape', () => {
    expect(parseTransformHeader(JSON.stringify({ position: [1, 2], rotation: [0, 0, 0], scale: [1, 1, 1] }))).toBeNull();
    expect(parseTransformHeader(JSON.stringify({ position: [1, 2, 3], rotation: [0, 0, 0] }))).toBeNull();
    expect(parseTransformHeader(JSON.stringify({ position: [1, 2, 'x'], rotation: [0, 0, 0], scale: [1, 1, 1] }))).toBeNull();
  });
});
