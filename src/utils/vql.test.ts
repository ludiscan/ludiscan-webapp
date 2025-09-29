// src/utils/hvql.test.ts
import { parseHVQL, compileHVQL } from './vql';

import type { ViewContext, HVQLProgram } from './vql';

describe('HVQL - parse & compile', () => {
  const baseCtx: ViewContext = {
    player: 1,
    status: { team: 'yellow', hand: 'rock', hp: 82, flag: true },
    pos: { x: 10, y: 20, z: 0 },
    t: 1000,
  };

  test('parseHVQL: palette と map ブロック', () => {
    const script = [
      'palette {',
      '  yellow: #FFD400;',
      '  blue:   #0057FF;',
      '}',
      '',
      'map status.team {',
      '  yellow -> player-color: ${yellow};',
      '  blue   -> player-color: ${blue};',
      '  *      -> player-color: #888;',
      '}',
    ].join('\n');

    const program: HVQLProgram = parseHVQL(script);
    expect(program.palette.yellow).toBe('#FFD400');
    expect(program.palette.blue).toBe('#0057FF');
    expect(program.maps).toHaveLength(1);
    expect(program.maps[0].path).toBe('status.team');
    expect(program.maps[0].cases).toHaveLength(2);
    expect(program.maps[0].defaultAssigns?.[0].key).toBe('player-color');
  });

  test('compileHVQL: palette 展開で色が適用される', () => {
    const script = [
      'palette {',
      '  yellow: #FFD400;',
      '}',
      '',
      'map status.team {',
      '  yellow -> player-color: ${yellow};',
      '  *      -> player-color: #888;',
      '}',
    ].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    expect(style.color).toBe('#FFD400');
  });

  test('compileHVQL: 複数 map マージ（色 + アイコン）', () => {
    const script = [
      'palette { yellow: #FFD400; }',
      '',
      'map status.team {',
      '  yellow -> player-color: ${yellow};',
      '  *      -> player-color: #ccc;',
      '}',
      '',
      'map status.hand {',
      '  rock   -> player-current-point-icon: hand-rock;',
      '  paper  -> player-current-point-icon: hand-paper;',
      '  *      -> player-current-point-icon: hand-unknown;',
      '}',
    ].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    expect(style.color).toBe('#FFD400');
    expect(style.icon).toBe('hand-rock');
  });

  test('compileHVQL: player-icon プロパティ', () => {
    const script = [
      'map status.hand {',
      '  rock   -> player-icon: hand-rock;',
      '  paper  -> player-icon: hand-paper;',
      '  *      -> player-icon: hand-unknown;',
      '}',
    ].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    expect(style.playerIcon).toBe('hand-rock');
  });

  test('compileHVQL: デフォルト分岐（*）', () => {
    const script = ['map status.team {', '  blue -> player-color: #00f;', '  *    -> player-color: #888;', '}'].join('\n');

    const apply = compileHVQL(script);
    const style = apply({ ...baseCtx, status: { ...baseCtx.status, team: 'green' } });
    expect(style.color).toBe('#888');
  });

  test('compileHVQL: 数値マッチと数値プロパティ（opacity, point-size）', () => {
    const script = ['map status.hp {', '  80 -> opacity: 0.7, point-size: 12;', '  *  -> opacity: 0.3;', '}'].join('\n');

    const apply = compileHVQL(script);

    // 82 は default
    let style = apply(baseCtx);
    expect(style.opacity).toBe(0.3);

    // 80 でマッチ
    style = apply({ ...baseCtx, status: { ...baseCtx.status, hp: 80 } });
    expect(style.opacity).toBe(0.7);
    expect(style.pointSize).toBe(12);
  });

  test('compileHVQL: クォート付き文字列の除去', () => {
    const script = ['map status.hand {', "  rock -> player-current-point-icon: 'hand-rock';", '}'].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    expect(style.icon).toBe('hand-rock'); // 末尾 ; や クォートが残らない
  });

  test('compileHVQL: vars のテンプレ展開（label 等）', () => {
    const script = ['map status.flag {', '  true -> label: "TH=${threshold}";', '  *    -> label: "NOPE";', '}'].join('\n');

    const apply = compileHVQL(script, { vars: { threshold: 0.7 } });
    const styleTrue = apply(baseCtx);
    expect(styleTrue.label).toBe('TH=0.7');

    const styleFalse = apply({ ...baseCtx, status: { ...baseCtx.status, flag: false } });
    expect(styleFalse.label).toBe('NOPE');
  });

  test('compileHVQL: 未知プロパティは無視', () => {
    const script = ['map status.team {', '  yellow -> unknown-prop: 123, player-color: #000;', '}'].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    // eslint-disable-next-line
    // @ts-ignore
    expect(style['unknown-prop']).toBeUndefined();
    expect(style.color).toBe('#000');
  });

  test('compileHVQL: 後勝ち（同一プロパティの再設定）', () => {
    const script = [
      'map status.team {',
      '  yellow -> player-color: #000;',
      '  *      -> player-color: #222;',
      '}',
      'map status.hand {',
      '  rock   -> player-color: #111;', // 後段が優先される
      '}',
    ].join('\n');

    const apply = compileHVQL(script);
    const style = apply(baseCtx);
    expect(style.color).toBe('#111');
  });

  // ---- エラーパス ----

  test('parseHVQL: palette ブロックの閉じ忘れ', () => {
    const script = [
      'palette {',
      '  yellow: #fff;',
      // '}' が無い
      'map status.team {',
      '  * -> player-color: #000;',
      '}',
    ].join('\n');

    expect(() => parseHVQL(script)).toThrow(/palette: missing closing "}"|Unknown statement/);
  });

  test('parseHVQL: map 内の代入構文エラー（コロンの右辺なし）', () => {
    const script = [
      'map status.team {',
      '  yellow -> player-color;', // 値が無い
      '}',
    ].join('\n');

    expect(() => parseHVQL(script)).toThrow(/invalid assignment/i);
  });

  test('parseHVQL: 不明なトップレベル文', () => {
    const script = ['bogus something', 'map status.team { * -> player-color: #000; }'].join('\n');

    expect(() => parseHVQL(script)).toThrow(/Unknown statement/i);
  });
});
