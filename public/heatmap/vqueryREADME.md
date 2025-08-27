> ヒートマップ／リプレイの見た目を、**クエリ風のテキスト**でカスタムできます。
> 例：`status.team` で色分け、`status.hand` でアイコン切替、`hp` で透明度調整…など。

---

## クイックスタート

```txt
palette {             # パレット定義（色や定数に名前を付ける）
  yellow: #FFD400;
  blue:   #0057FF;
}

map status.team {     # ステータスの team 値ごとに色を指定
  yellow -> player-color: ${yellow};
  blue   -> player-color: ${blue};
  *      -> player-color: #888;   # デフォルト（その他）
}

map status.hand {     # hand 値ごとにアイコンを指定
  rock    -> player-current-point-icon: hand-rock;
  paper   -> player-current-point-icon: hand-paper;
  scissor -> player-current-point-icon: hand-scissor;
}
```

---

## できること

* **色／アイコン／ラベル／線色／不透明度／点サイズ**などの見た目を、データの値で切り替え
* **パレット**（名前付き色・定数）を使って再利用 & 読みやすく
* **テンプレート変数**（`${name}`）でパレット値や UI からの変数を埋め込み
* デフォルト分岐（`*`）で抜け漏れ防止
* 後に書いたルールが**上書き**（同じプロパティに対して）

---

## 文法（最小セット）

### 1) パレット定義

複数行:

```txt
palette {
  name: value;
  other: value;   # 行末の ; はあってもなくてもOK
}
```

1行（インライン）:

```txt
palette { name: value; other: value; }
```

* `value` は文字列でも色でもOK（例：`#FFAA00`, `Main`, `"Boss"`）。
* 参照は `${name}` で。

### 2) マップ（条件 → ビュー設定）

```txt
map <path> {
  <value> -> <prop>: <expr>[, <prop>: <expr> ...];
  *       -> <prop>: <expr>;   # デフォルト
}
```

* `<path>`: データの場所（例：`status.team`, `status.hand`, `status.hp`）
* `<value>`: **完全一致**で判定（文字列 / 数値 / 真偽値）

  * 文字列：`red` or `'red'` or `"red"`（迷ったらクォート推奨）
  * 数値：`80`（等号一致のみ）
  * 真偽：`true` / `false`
* `*` はデフォルト分岐（マッチしない場合に適用）
* 行末の `;` は任意

---

## 使えるプロパティ

| プロパティ名（VQL）                 | 意味             | 型例                              |
| --------------------------- | -------------- | ------------------------------- |
| `player-color`              | プレイヤーの点・軌跡の基本色 | `#0057FF`, `${yellow}`          |
| `player-current-point-icon` | 現在位置のアイコン名     | `hand-rock`, `'skull'`          |
| `label`                     | ラベル文字列         | `"P${id}"`, `"TH=${threshold}"` |
| `trail-color`               | 軌跡（ライン）の色      | `#FFAA00`, `${blue}`            |
| `opacity`                   | 不透明度（0–1）      | `0.3`, `0.8`                    |
| `point-size`                | 点サイズ（px相当）     | `8`, `12`                       |

> **注意**: 同じプロパティを複数の `map` で設定した場合、**後に書いたほうが優先**されます。

---

## 参照できるデータパス

* `status.*` … サーバに送った `status` の任意キー（例：`status.team`, `status.hand`, `status.hp`）
* `player` … プレイヤーID（数値）
* `pos.x`, `pos.y`, `pos.z` … 現在位置
* `t` … タイムスタンプ/オフセット（数値）

例：

```txt
map player {
  1 -> label: "Leader";
}

map pos.z {
  0 -> trail-color: #888;
}
```

---

## 変数・テンプレート

`"${...}"` による展開に対応：

* **パレット名**：`${yellow}`, `${blue}`
* **外部変数**（アプリ側が提供）：`${threshold}`, `${phase}` など

例：

```txt
palette { warn: #FF5A5A; }

map status.hp {
  80 -> opacity: 0.7, trail-color: ${warn};
  *  -> opacity: 0.3, label: "HP=${threshold}";
}
```

---

## 実例集

### チーム色 + 手札アイコン

```txt
palette {
  yellow: #FFD400;
  blue:   #0057FF;
}

map status.team {
  yellow -> player-color: ${yellow};
  blue   -> player-color: ${blue};
  *      -> player-color: #888;
}

map status.hand {
  rock    -> player-current-point-icon: hand-rock;
  paper   -> player-current-point-icon: hand-paper;
  scissor -> player-current-point-icon: hand-scissor;
}
```

### HP で透明度とサイズを調整

```txt
map status.hp {
  100 -> opacity: 1,   point-size: 12;
  80  -> opacity: 0.7, point-size: 12;
  *   -> opacity: 0.3;
}
```

### 後勝ちの上書き（優先順位コントロール）

```txt
map status.team {
  red -> player-color: #f00;
  *   -> player-color: #888;
}

# 特定の手札のときは色を強制上書き
map status.hand {
  rock -> player-color: #000;   # こちらが後段なので上書き
}
```

---

## コメント

* `#` 以降はコメントとして無視されます（**色コードの `#RRGGBB` は安全**）。
* 例：

  ```txt
  player-color: #00FF99;  # ミント色
  ```

---

## よくあるハマり

* **一致しない**
  値は**完全一致**のみ。`<` や `>=` はまだ未対応。数値は `80` のように書く（`"80"` と区別したい場合はクォート）。
* **デフォルト（`*`）を書き忘れ**
  未マッチ時に何も変わらない。`* -> ...` を用意すると安心。
* **同じプロパティを複数箇所で設定**
  **後に書いた**ルールが上書き。順序で意図をコントロール。
* **クォート**
  文字列は `'text'` / `"text"` どちらでもOK。記号を含む場合はクォート推奨。

---

## 文法リファレンス（簡易）

```
script        := { palette_block | map_block } ;

palette_block := "palette" "{" palette_pairs "}"
               | "palette" "{" inline_pairs "}" ;

palette_pairs := { name ":" value [";"] } ;
inline_pairs  := name ":" value { ";" name ":" value } [";"] ;

map_block     := "map" path "{" map_case+ "}" ;
map_case      := ( value | "*" ) "->" assignments [";"] ;
assignments   := prop ":" expr { "," prop ":" expr } ;

path          := [ "status." name ] | "player" | "pos.x" | "pos.y" | "pos.z" | "t"
value         := number | boolean | string | identifier
expr          := string | number | identifier | template
template      := ... "${" name "}" ...
```

---

## ちょっとしたコツ

* **パレットを使う**と配色差し替えが一瞬で済む
* **小さく始める**：まず `map status.team { ... }` から
* **検証**：ルールは後から何度でも書き換え可能。壊れたらエラーメッセージを参考に直す

---

## 制限（現状）

* 比較演算（`<`, `>`, `in`, 正規表現）は未対応（将来追加予定）
* マッチは**単一値の等値**のみ

---

## トラブル時

* エラーに「`missing "}"`」→ ブロックの閉じ忘れ
* 「`invalid line`」→ `prop: value` の書式崩れ、`,` の付け忘れ、`:` の右辺抜け
* 直らないときは、**最小の例**に戻して少しずつ増やして確認を

---

🛈 **ヒント**
右上の「適用」前に内容を保存しておくと、別セッションでも再利用できます。
不明点があれば `?` からこのドキュメントに戻って確認してください。
