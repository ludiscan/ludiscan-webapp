export type ViewContext = {
  player: number;
  status: Record<string, never | string | boolean | number>;
  pos: { x: number; y: number; z: number };
  t: number;
  objectType?: string;
};

export type ViewStyle = {
  color?: string;
  icon?: string;
  label?: string;
  trailColor?: string;
  opacity?: number;
  pointSize?: number;
  playerIcon?: string;
};

export type Document = {
  palette?: Record<string, string>;
  vars?: Record<string, string | number>;
};

const propMap: Record<string, keyof ViewStyle> = {
  'player-color': 'color',
  icon: 'icon',
  'player-icon': 'playerIcon',
  label: 'label',
  'trail-color': 'trailColor',
  opacity: 'opacity',
  'point-size': 'pointSize',
};

// snake_case -> camelCase 変換
const toCamelCase = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
// camelCase -> snake_case 変換
const toSnakeCase = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

// eslint-disable-next-line
// @ts-ignore
const getPath = (obj: never, path: string) =>
  path.split('.').reduce((o, k) => {
    if (o == null) return undefined;
    // 元のキーで見つかればそれを返す
    // eslint-disable-next-line
    // @ts-ignore
    if (o[k] !== undefined) return o[k];
    // snake_case と camelCase の両方を試す
    const camel = toCamelCase(k);
    const snake = toSnakeCase(k);
    // eslint-disable-next-line
    // @ts-ignore
    if (o[camel] !== undefined) return o[camel];
    // eslint-disable-next-line
    // @ts-ignore
    if (o[snake] !== undefined) return o[snake];
    return undefined;
  }, obj);

const expandTemplate = (s: string, env: Document) =>
  s.replace(/\$\{([a-zA-Z0-9_-]+)\}/g, (_, key) => {
    if (env.palette && key in env.palette) return String(env.palette[key]);
    if (env.vars && key in env.vars) return String(env.vars[key]);
    return '';
  });

const toLiteral = (raw: string): string | number | boolean => {
  let t = raw.trim();
  t = t.replace(/;+\s*$/, ''); // 末尾 ; を先に除去
  if (/^'.*'$|^".*"$/.test(t)) return t.slice(1, -1);
  if (/^(true|false)$/i.test(t)) return t.toLowerCase() === 'true';
  if (/^[+-]?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t; // 裸の識別子
};

type Assign = { key: string; value: string };
type Case = { match: string | number | boolean; assigns: Assign[] };
type MapBlock = { path: string; cases: Case[]; defaultAssigns?: Assign[] };

export type HVQLProgram = {
  palette: Record<string, string>;
  maps: MapBlock[];
};

// ---- Parser ----
export function parseHVQL(input: string): HVQLProgram {
  const normalized = input.replace(/\r\n?/g, '\n');

  // 「#」コメントを削るが、#RGB/#RRGGBB/#RRGGBBAA は残す
  const src = normalized
    .split('\n')
    .map((l) => l.replace(/(^|.)#(?![0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b).*$/, '$1'))
    .join('\n');

  const palette: Record<string, string> = {};
  const maps: MapBlock[] = [];

  const lines = src.split('\n').map((l) => l.trim());
  const nextNonEmpty = (from: number) => {
    let j = from;
    while (j < lines.length && lines[j].trim().length === 0) j++;
    return j;
  };

  // 1行の "k: v; k2: v2;" をまとめて palette に流し込む
  const parsePaletteInline = (inner: string) => {
    for (const seg of inner.split(';')) {
      const s = seg.trim();
      if (!s) continue;
      const m = s.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      if (!m) throw new Error(`palette: invalid line: "${s}"`);
      palette[m[1]] = m[2].trim().replace(/;+\s*$/, '');
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    // ---------- palette ----------
    if (/^palette\b/i.test(line)) {
      // ケースA: 同一行で { .. } が完結
      const openPos = line.indexOf('{');
      const closePos = line.lastIndexOf('}');
      if (openPos >= 0 && closePos > openPos) {
        const inner = line.slice(openPos + 1, closePos).trim();
        if (inner) parsePaletteInline(inner);
        i++; // 次の行へ
        continue;
      }

      // ケースB: palette 行の次に { が来て、以降複数行で定義
      const j = openPos >= 0 ? i : nextNonEmpty(i + 1); // 同行に { が無ければ次の非空行
      if (j >= lines.length || !lines[j].includes('{')) {
        throw new Error('palette: missing "{"');
      }

      // '{' の次行から } まで読む
      i = j + 1;
      for (; i < lines.length; i++) {
        const l = lines[i];
        if (!l) continue;
        if (l === '}') break;

        if (/^map\b/i.test(l) || /^palette\b/i.test(l) || l === '{') {
          throw new Error('palette: missing closing "}"');
        }

        const m = l.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*;?$/);
        if (!m) throw new Error(`palette: invalid line: "${l}"`);
        palette[m[1]] = m[2].trim().replace(/;+\s*$/, '');
      }
      if (i >= lines.length || lines[i] !== '}') {
        throw new Error('palette: missing closing "}"');
      }
      i++; // '}' の次へ
      continue;
    }

    // ---------- map <path> ----------
    const mm = line.match(/^map\s+([a-zA-Z0-9_.]+)\b/i);
    if (mm) {
      const path = mm[1];

      // '{' が同じ行にあるか、次行にあるかを許容
      const hasOpen = line.includes('{');
      if (!hasOpen) {
        const j = nextNonEmpty(i + 1);
        if (j >= lines.length || !lines[j].includes('{')) {
          throw new Error(`map ${path}: missing "{"`);
        }
        i = j; // '{' を含む行に移動
      }

      // '{' の次行からケースを読む
      i++;
      const block: MapBlock = { path, cases: [] };

      for (; i < lines.length; i++) {
        const l = lines[i];
        if (!l) continue;
        if (l === '}') break;

        // <value> -> prop: expr[, prop: expr ...][;]
        const m = l.match(/^(.+?)\s*->\s*(.+?)\s*;?$/);
        if (!m) throw new Error(`map ${path}: invalid line: "${l}"`);

        const head = m[1].trim();
        const assignsRaw = m[2];

        const parseAssigns = (s: string): Assign[] =>
          s.split(',').map((pair) => {
            const kv = pair.trim().match(/^([a-zA-Z0-9\-._]+)\s*:\s*(.+)$/);
            if (!kv) throw new Error(`invalid assignment: "${pair}"`);
            return {
              key: kv[1],
              value: kv[2].trim().replace(/;+\s*$/, ''), // 末尾 ; 除去
            };
          });

        if (head === '*') {
          block.defaultAssigns = parseAssigns(assignsRaw);
        } else {
          const val = toLiteral(head);
          block.cases.push({ match: val, assigns: parseAssigns(assignsRaw) });
        }
      }
      if (i >= lines.length || lines[i] !== '}') {
        throw new Error(`map ${path}: missing closing "}"`);
      }
      maps.push(block);
      i++; // '}' の次へ
      continue;
    }

    throw new Error(`Unknown statement: "${line}"`);
  }

  return { palette, maps };
}

// ---- Compile & Apply ----
export function compileHVQL(input: string, baseEnv: Document = {}) {
  const program = parseHVQL(input);
  const env: Document = {
    palette: { ...(baseEnv.palette || {}), ...program.palette },
    vars: baseEnv.vars || {},
  };

  return function apply(ctx: ViewContext): ViewStyle {
    const out: ViewStyle = {};
    for (const b of program.maps) {
      const val = getPath({ status: ctx.status, player: ctx.player, pos: ctx.pos, t: ctx.t, objectType: ctx.objectType } as never, b.path);
      const c = b.cases.find(
        (ca) =>
          (typeof ca.match === 'number' && String(ca.match) === String(val)) ||
          (typeof ca.match === 'string' && String(ca.match).toLowerCase() === String(val).toLowerCase()) ||
          (typeof ca.match === 'boolean' && String(ca.match) === String(val)),
      );
      const assigns = c ? c.assigns : b.defaultAssigns;
      if (!assigns) continue;

      for (const a of assigns) {
        const key = a.key.toLowerCase();
        const mapped = propMap[key];
        if (!mapped) continue;

        let v = a.value.trim().replace(/;+\s*$/, ''); // 末尾 ; 除去
        if (/^'.*'$|^".*"$/.test(v)) v = v.slice(1, -1); // クォート除去
        v = expandTemplate(v, env); // テンプレ展開

        // 単純な識別子がパレットに存在する場合は展開（${...}なしでも展開可能に）
        if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(v) && env.palette && v in env.palette) {
          v = env.palette[v];
        }

        if (mapped === 'opacity' || mapped === 'pointSize') {
          const n = Number(v);
          if (!Number.isNaN(n)) out[mapped] = n;
        } else {
          out[mapped] = v;
        }
      }
    }
    return out;
  };
}
