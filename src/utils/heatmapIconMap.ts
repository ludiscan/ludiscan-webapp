// heatmapアイコンのマッピング設定
export const heatmapIconMap: Record<string, string> = {
  // 手の形
  'hand-rock': '/heatmap/hand-rock.svg',
  'hand-paper': '/heatmap/hand-paper.svg',
  'hand-scissor': '/heatmap/hand-scissors.svg',
  'hand-scissors': '/heatmap/hand-scissors.svg',
  'hand-unknown': '/heatmap/unknown.svg',

  // アイテム・装備
  shoes: '/heatmap/shoes.svg',
  target: '/heatmap/target.svg',

  // 状態・アクション
  flag: '/heatmap/flag.svg',
  checkpoint: '/heatmap/checkpoint.svg',
  spawn: '/heatmap/spawn.svg',
  question: '/heatmap/question.svg',

  // デフォルト
  default: '/heatmap/default.svg',
};

// アイコンパスを取得する関数
export function getIconPath(iconName: string): string {
  return heatmapIconMap[iconName] || heatmapIconMap.default || '/heatmap/default.svg';
}

// 利用可能なアイコン名のリスト
export const availableIcons = Object.keys(heatmapIconMap);
