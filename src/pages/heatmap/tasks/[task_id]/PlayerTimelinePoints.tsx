/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useState } from 'react';
import { BufferGeometry, CatmullRomCurve3, Color, Line, LineBasicMaterial, Vector3, Sprite, SpriteMaterial, TextureLoader } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

import type { PlayerPositionLog, PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { ViewContext } from '@src/utils/vql';
import type { FC } from 'react';

import { useHVQL } from '@src/hooks/useHVQuery';
import { useGeneralState, usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { usePlayerPositionLogs } from '@src/modeles/heatmapView';
import { zIndexes } from '@src/styles/style';
import { getIconPath } from '@src/utils/heatmapIconMap';

export type PlayerTimelinePointsTimeRange = {
  start: number; // 開始時刻（ミリ秒）
  end: number; // 終了時刻（ミリ秒）
};
export type PlayerTimelinePointsProps = {
  service: HeatmapDataService;
  state: PlayerTimelineDetail | null;
  currentTimelineSeek: number;
  visibleTimeRange: PlayerTimelinePointsTimeRange;
};

const Component: FC<PlayerTimelinePointsProps> = ({ service, state, currentTimelineSeek, visibleTimeRange }) => {
  const {
    data: { upZ, scale },
  } = useGeneralState();
  const { data: timelineState, setData } = usePlayerTimelineState();
  const [queryColor, setQueryColor] = useState<number | null>(null);
  const [queryIcon, setQueryIcon] = useState<string | null>(null);

  const { data: fetchLogs, isLoading, isSuccess } = usePlayerPositionLogs(state?.player, state?.project_id, state?.session_id, service.createClient());

  const logs = useMemo(() => {
    if (!fetchLogs || !fetchLogs.data || fetchLogs.data.length === 0) return null;
    const points: Map<number, PlayerPositionLog> = new Map();
    fetchLogs.data.forEach((pt) => {
      points.set(pt.offset_timestamp, {
        player: pt.player,
        x: pt.x * scale,
        y: (upZ ? (pt.z ?? 0) : pt.y) * scale + 10,
        z: (upZ ? pt.y : (pt.z ?? 0)) * scale,
        offset_timestamp: pt.offset_timestamp,
        status: pt.status,
      });
    });
    return points.values().toArray();
  }, [fetchLogs, scale, upZ]);
  const fullPathPoints = useMemo(() => {
    if (!logs) return [];
    return Array.from(logs)
      .filter((pt) => pt.offset_timestamp >= visibleTimeRange.start && pt.offset_timestamp <= visibleTimeRange.end)
      .sort((a, b) => a.offset_timestamp - b.offset_timestamp)
      .map((pt) => new Vector3(pt.x, pt.y, pt.z));
  }, [logs, visibleTimeRange]);

  const partialPathPoints = useMemo(() => {
    if (!logs) return [];
    return Array.from(logs)
      .filter((pt) => pt.offset_timestamp >= visibleTimeRange.start && pt.offset_timestamp <= currentTimelineSeek)
      .sort((a, b) => a.offset_timestamp - b.offset_timestamp)
      .map((pt) => {
        return {
          vec: new Vector3(pt.x, pt.y, pt.z),
          data: pt,
        };
      });
  }, [logs, visibleTimeRange, currentTimelineSeek]);

  const { compile, setDocument } = useHVQL();

  useEffect(() => {}, []);

  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const max = logs ? Math.max(...logs.map((pt) => pt.offset_timestamp)) : 0;
    if (max > (timelineState.maxTime || 0)) {
      setData((prev) => ({
        ...prev,
        currantTime: 0,
        maxTime: max,
      }));
    }
  }, [logs, setData, timelineState]);

  useEffect(() => {
    setDocument({
      palette: { yellow: '#FFD400', blue: '#0057FF' },
      vars: { threshold: 0.7 },
    });
  }, [setDocument, timelineState.queryText]);
  useEffect(() => {
    const latestLog = partialPathPoints.slice(-1)[0];
    if (!latestLog) return;
    const ctx: ViewContext = {
      player: latestLog.data.player,
      status: latestLog.data.status || {},
      pos: { x: latestLog.data.x, y: latestLog.data.y, z: latestLog.data.z },
      t: latestLog.data.offset_timestamp,
    };
    const style = compile(timelineState.queryText, ctx);
    if (style.color) {
      setQueryColor(Number('0x' + style.color.slice(1)));
    }
    if (style.playerIcon) {
      setQueryIcon(style.playerIcon);
    } else {
      setQueryIcon(null);
    }
  }, [compile, partialPathPoints, timelineState.queryText]);
  if (isLoading || !logs || !isSuccess || !state?.visible) return <></>;
  return (
    <>
      {logs
        .filter((pt) => pt.offset_timestamp >= visibleTimeRange.start && pt.offset_timestamp <= visibleTimeRange.end)
        .map((pt, idx) => (
          <mesh key={idx} position={new Vector3(pt.x, pt.y, pt.z)} renderOrder={zIndexes.renderOrder.timelinePoints}>
            <sphereGeometry args={[10 * scale, 16, 16]} />
            <meshStandardMaterial color={new Color(161 / 255, 198 / 255, 255 / 255)} transparent />
          </mesh>
        ))}
      {fullPathPoints.length > 1 && (
        <primitive
          object={
            new Line(
              new BufferGeometry().setFromPoints(new CatmullRomCurve3(fullPathPoints).getPoints(200)),
              new LineBasicMaterial({ color: '#888888' }), // 全体：薄いグレー
            )
          }
        />
      )}

      {/* 現在のタイムラインの位置までのパスを描画 */}
      {partialPathPoints.length > 1 &&
        (() => {
          const positions = partialPathPoints.slice(partialPathPoints.length - 3, partialPathPoints.length).flatMap(({ vec }) => [vec.x, vec.y, vec.z]);

          const geometry = new LineGeometry();
          geometry.setPositions(positions);

          const material = new LineMaterial({
            color: queryColor || 0xff0000,
            linewidth: 5, // ピクセル単位の太さ
            worldUnits: false, // trueならworld単位（falseでOK）
            dashed: false,
            opacity: 0.7,
          });

          material.depthTest = false;
          material.transparent = true;
          material.resolution.set(window.innerWidth, window.innerHeight); // これ必須！

          return <primitive renderOrder={zIndexes.renderOrder.timelineArrows} object={new Line2(geometry, material)} />;
        })()}

      {/* アイコン表示 */}
      {queryIcon &&
        partialPathPoints.length > 0 &&
        (() => {
          const lastPoint = partialPathPoints[partialPathPoints.length - 1];
          const iconPath = getIconPath(queryIcon);

          const textureLoader = new TextureLoader();
          const texture = textureLoader.load(iconPath);
          const spriteMaterial = new SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false,
          });
          spriteMaterial.depthTest = false;
          spriteMaterial.transparent = true;
          const sprite = new Sprite(spriteMaterial);
          sprite.position.copy(lastPoint.vec);
          sprite.position.y += 50 * scale; // arrowの上に表示
          sprite.scale.set(0.07 * scale, 0.07 * scale, 1);

          return <primitive renderOrder={zIndexes.renderOrder.timelineArrows} object={sprite} />;
        })()}

      {/* 現在のタイムラインの位置までのパスの矢印を描画 */}
      {partialPathPoints.length >= 2 &&
        (() => {
          const lastIdx = partialPathPoints.length - 1;
          const from = partialPathPoints[lastIdx - 1];
          const to = partialPathPoints[lastIdx].vec;

          const dir = to.clone().sub(from.vec).normalize(); // 進行方向
          const arrowLength = 30 * scale;
          const arrowWidth = 15 * scale;

          // 任意方向に垂直なベクトルを取得
          const getPerpendicularVector = (dir: Vector3) => {
            const up = Math.abs(dir.y) < 0.99 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
            return new Vector3().crossVectors(dir, up).normalize();
          };

          const perpendicular = getPerpendicularVector(dir).multiplyScalar(arrowWidth);
          const tail = to.clone().sub(dir.clone().multiplyScalar(arrowLength));
          const left = tail.clone().add(perpendicular);
          const right = tail.clone().sub(perpendicular);

          const positions = [left, to, right].flatMap((v) => [v.x, v.y, v.z]);

          const geometry = new LineGeometry();
          geometry.setPositions(positions);

          const material = new LineMaterial({
            color: queryColor || 0xff0000,
            linewidth: 5, // 太さはピクセルベース
            worldUnits: false,
            dashed: false,
          });

          material.depthTest = false; // 深度テストを無効化
          material.transparent = true;
          material.resolution.set(window.innerWidth, window.innerHeight);

          return <primitive renderOrder={zIndexes.renderOrder.timelineArrows} object={new Line2(geometry, material)} />;
        })()}
    </>
  );
};

export const PlayerTimelinePoints = Component;
