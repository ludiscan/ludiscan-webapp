import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Raycaster, Vector2, Vector3 } from 'three';

import { PositionPointMarkers } from './PositionPointMarkers';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { useEventLogsState, useGeneralState } from '@src/hooks/useHeatmapState';
import { EventLogMarkers } from '@src/pages/heatmap/tasks/[task_id]/EventLogMarkers';
import { HotspotCircles } from '@src/pages/heatmap/tasks/[task_id]/HotspotCircles';
import { LocalModelLoader, StreamModelLoader } from '@src/pages/heatmap/tasks/[task_id]/ModelLoader';
import { WaypointMarker } from '@src/pages/heatmap/tasks/[task_id]/WaypointMarker';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type HeatmapCanvasProps = {
  model: Group | null;
  service: HeatmapDataService;
  map?: string | ArrayBuffer | null;
  modelType?: 'gltf' | 'glb' | 'obj' | 'server' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

type Waypoint = {
  id: string;
  position: Vector3; // x, y, z 座標（モデル表面に対して Y 座標を合わせたもの）
};

const Component: FC<HeatmapCanvasProps> = ({ model, map, modelType, pointList, service }) => {
  // const { invalidate } = useThree();
  const {
    data: { showHeatmap },
  } = useGeneralState();
  const { data: eventLogs } = useEventLogsState();
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const visibleEventLogs = useMemo(() => eventLogs.filter((event) => event.visible), [eventLogs]);

  // **1-1. State を追加**
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  const [draggingWaypointId, setDraggingWaypointId] = useState<string | null>(null);

  // Raycaster を使ってモデル表面上の正しい高さ（Y 座標）を求めるための準備
  const { camera, gl } = useThree(); // size は canvas の幅・高さ、gl は renderer
  const raycaster = useMemo(() => new Raycaster(), []);
  const modelRef = useRef<Group>(null);

  // 移動量。必要に応じて調整してください（マップのスケールに合わせる）
  const MOVE_DELTA = 10;

  // モデル表面での正確な Y 座標を取得する関数
  const getHeightOnModel = useCallback(
    (x: number, z: number): Vector3 | null => {
      if (!modelRef.current) return null;
      // Y を十分大きな位置にして、その直下方向（0,-1,0）に Raycaster を飛ばす
      const origin = new Vector3(x, 10000, z);
      const direction = new Vector3(0, -1, 0);
      raycaster.set(origin, direction);
      // モデルのグループ以下すべてを対象に intersection を計算
      const intersects = raycaster.intersectObject(modelRef.current, true);
      if (intersects.length > 0) {
        return intersects[0].point; // 交差点 (Vector3) を返す
      }
      return null;
    },
    [raycaster],
  );

  // 矢印キーで選択中ウェイポイントを移動する処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWaypointId) return;
      // 対応するキーなら処理を行う
      const dirMap: { [key: string]: [number, number] } = {
        ArrowUp: [0, -MOVE_DELTA],
        ArrowDown: [0, MOVE_DELTA],
        ArrowLeft: [-MOVE_DELTA, 0],
        ArrowRight: [MOVE_DELTA, 0],
      };

      if (dirMap[e.key]) {
        e.preventDefault();
        const [dx, dz] = dirMap[e.key];

        setWaypoints((prev) =>
          prev.map((wp) => {
            if (wp.id !== selectedWaypointId) return wp;

            const oldPos = wp.position;
            const newX = oldPos.x + dx;
            const newZ = (oldPos.z ?? 0) + dz;

            // Y 座標は常にモデル表面に合わせる
            const hit = getHeightOnModel(newX, newZ);
            if (hit) {
              return { ...wp, position: hit };
            }
            // モデルと交差しない（マップ外など）場合は移動を無視
            return wp;
          }),
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedWaypointId, getHeightOnModel]);

  useEffect(() => {
    const handleAddWaypoint = () => {
      if (!modelRef.current) return;
      // 例として「モデルのワールド空間の中心 (0,0) あたり」を初期位置とする
      // 必要があればメニュー側から座標を渡しても構いません
      const defaultX = 0;
      const defaultZ = 200;
      const hit = getHeightOnModel(defaultX, defaultZ);
      if (!hit) {
        // console.warn('モデル表面の交差点が見つかりませんでした');
        return;
      }

      const newWp: Waypoint = {
        id: crypto.randomUUID(), // または任意の一意な文字列生成
        position: hit.clone(),
      };
      // console.log('新しいウェイポイントを追加:', newWp, '位置:', newWp.position);
      setWaypoints((prev) => [...prev, newWp]);
      setSelectedWaypointId(newWp.id); // 追加後に自動で選択状態にする
    };

    heatMapEventBus.on('add-waypoint', handleAddWaypoint);
    return () => {
      heatMapEventBus.off('add-waypoint', handleAddWaypoint);
    };
  }, [getHeightOnModel]);

  useEffect(() => {
    // pointermove ハンドラ
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingWaypointId) return;
      if (!modelRef.current) return;

      // Canvas 上の pointer 座標を正規化デバイス座標に変換
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);
      const intersects = raycaster.intersectObject(modelRef.current, true);
      if (intersects.length > 0) {
        const point = intersects[0].point.clone();
        setWaypoints((prev) => prev.map((wp) => (wp.id === draggingWaypointId ? { ...wp, position: point } : wp)));
      }
    };

    // pointerup ハンドラ（ドラッグ終了）
    const handlePointerUp = () => {
      if (draggingWaypointId) {
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
        setDraggingWaypointId(null);
      }
    };

    gl.domElement.addEventListener('pointermove', handlePointerMove);
    // pointerup はキャンバス外でも起きるので window に登録
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingWaypointId, camera, gl, raycaster, setWaypoints]);

  return (
    <>
      <ambientLight intensity={0.3} /> {/* eslint-disable-line react/no-unknown-property */}
      <directionalLight position={[10, 10, 10]} intensity={3} castShadow={true} /> {/* eslint-disable-line react/no-unknown-property */}
      {modelType && map && modelType !== 'server' && typeof map === 'string' && <LocalModelLoader ref={modelRef} modelPath={map} modelType={modelType} />}
      {modelType && model && modelType === 'server' && typeof map !== 'string' && <StreamModelLoader ref={modelRef} model={model} />}
      {pointList && showHeatmap && <PositionPointMarkers points={pointList} />}
      {pointList && showHeatmap && <HotspotCircles points={pointList} />}
      {visibleEventLogs.length > 0 &&
        visibleEventLogs.map((event) => <EventLogMarkers key={event.key} logName={event.key} service={service} color={event.color} />)}
      {/* --- 追加：ウェイポイントを map して表示 --- */}
      {waypoints.map((wp) => (
        <WaypointMarker
          key={wp.id}
          position={wp.position}
          selected={wp.id === selectedWaypointId}
          onClick={() => {
            setSelectedWaypointId(wp.id);
          }}
          onPointerDown={() => {
            // ドラッグ開始
            if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
            setSelectedWaypointId(wp.id);
            setDraggingWaypointId(wp.id);
          }}
          onPointerUp={() => {
            // ドラッグ終了は上記 useEffect の window.pointerup でもキャッチしているが、
            // こちらでも安全のため呼んでおく
            setDraggingWaypointId(null);
          }}
        />
      ))}
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} position0={new Vector3(1, 1, 3000)} />
    </>
  );
};

export const HeatMapCanvas = Component;
