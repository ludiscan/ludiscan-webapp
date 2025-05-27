import type { HeatmapTask } from '@src/modeles/heatmaptask';

export function getOfflineHeatmapTemplate(task: HeatmapTask) {
  return `
  <!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ludiscan Heatmap - ${task.project.name}</title>
  <style>
    body, html {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }
    #root {
      width: 100%;
      height: 100%;
    }

  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.HEATMAP_DATA = {};
    process = {};
    process.env = {};
    process.env.__NEXT_ROUTER_BASEPATH = '';
  </script>
  <script src="./bundle.js"></script>
</body>
</html>`;
}
