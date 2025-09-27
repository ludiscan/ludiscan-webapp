import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AmbientLight, Box3, DirectionalLight, HemisphereLight, Raycaster, SpotLight, Vector2, Vector3 } from 'three';

import { HeatmapObjectOverlay } from './HeatmapObjectOverlay';

import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group, PerspectiveCamera, OrthographicCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { EventLogMarkers } from '@src/features/heatmap/EventLogMarkers';
import { HeatmapFillOverlay } from '@src/features/heatmap/HeatmapFillOverlay';
import { HotspotCircles } from '@src/features/heatmap/HotspotCircles';
import { LocalModelLoader, StreamModelLoader } from '@src/features/heatmap/ModelLoader';
import { PlayerTimelinePoints } from '@src/features/heatmap/PlayerTimelinePoints';
import { WaypointMarker } from '@src/features/heatmap/WaypointMarker';
import { useEventLogState, useGeneralState, usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type HeatmapCanvasProps = {
  model: Group | null;
  service: HeatmapDataService;
  map?: string | ArrayBuffer | null;
  modelType?: 'gltf' | 'glb' | 'obj' | 'server' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
  currentTimelineSeek: number;
  visibleTimelineRange: PlayerTimelinePointsTimeRange;
};

type Waypoint = {
  id: string;
  position: Vector3; // x, y, z 座標（モデル表面に対して Y 座標を合わせたもの）
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const Component: FC<HeatmapCanvasProps> = ({ model, map, modelType, pointList, service, currentTimelineSeek, visibleTimelineRange }) => {
  // const { invalidate } = useThree();
  const fitInfoRef = useRef<{ dist: number; center: Vector3 }>({ dist: 1000, center: new Vector3() });
  const {
    data: { showHeatmap, heatmapOpacity, heatmapType },
  } = useGeneralState();
  const { theme } = useSharedTheme();
  const { data: eventLog } = useEventLogState();
  const { data: timelineState } = usePlayerTimelineState();
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const groupRef = useRef<Group>(null);
  const orthoBaseZoomRef = useRef<number | null>(null);

  const visibleEventLogs = useMemo(() => eventLog.logs.filter((event) => event.visible), [eventLog]);

  // **1-1. State を追加**
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  const [draggingWaypointId, setDraggingWaypointId] = useState<string | null>(null);

  // Raycaster を使ってモデル表面上の正しい高さ（Y 座標）を求めるための準備
  const { camera, gl, scene } = useThree(); // size は canvas の幅・高さ、gl は renderer
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

  useEffect(() => {
    // 平行光源を作成
    // new THREE.DirectionalLight(色, 光の強さ)
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    // 平行光源を作成
    // new THREE.DirectionalLight(色, 光の強さ)
    const directionalLight = new DirectionalLight(0xffffff, 0.4);
    scene.add(directionalLight);

    const hemisphereLight = new HemisphereLight(theme.colors.background, theme.colors.surface.dark, 1);
    scene.add(hemisphereLight);
    // スポットライト光源を作成
    // new THREE.SpotLight(色, 光の強さ, 距離, 照射角, ボケ具合, 減衰率)
    const spotLight = new SpotLight(0xffffff, 4, 30, Math.PI / 4, 10, 0.5);
    scene.add(spotLight);
    return () => {
      // コンポーネントのクリーンアップ時に光源を削除
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(hemisphereLight);
      scene.remove(spotLight);
    };
  }, [scene, theme]);

  const getPercent = useCallback(() => {
    const controls = orbitControlsRef.current;
    const camera = controls?.object as PerspectiveCamera | OrthographicCamera | undefined;
    if (!controls || !camera) return 100;

    if ((camera as OrthographicCamera).isOrthographicCamera) {
      const cam = camera as OrthographicCamera;
      const base = orthoBaseZoomRef.current ?? cam.zoom;
      return clamp(Math.round((cam.zoom / base) * 100), 25, 400);
    }

    const cam = camera as PerspectiveCamera;
    const { dist: fitDist } = fitInfoRef.current;
    const dist = controls.target.distanceTo(cam.position);
    return clamp(Math.round(100 * (fitDist / dist)), 25, 400); // 100%でfit
  }, []);

  const notifyPercent = useCallback(() => {
    const pct = getPercent();
    heatMapEventBus.emit('camera:percent', { percent: pct });
  }, [getPercent]);

  const setPercent = useCallback(
    (percent: number) => {
      const controls = orbitControlsRef.current;
      const camera = controls?.object as PerspectiveCamera | OrthographicCamera | undefined;
      if (!controls || !camera) return;

      // Orthographic
      if ((camera as OrthographicCamera).isOrthographicCamera) {
        const cam = camera as OrthographicCamera;
        if (orthoBaseZoomRef.current == null) orthoBaseZoomRef.current = cam.zoom; // 100%の基準
        const base = orthoBaseZoomRef.current;
        const nextZoom = (clamp(percent, 25, 400) / 100) * base; // 100%が基準
        cam.zoom = nextZoom;
        cam.updateProjectionMatrix();
        controls.update();
        notifyPercent();
        return;
      }

      // Perspective: distance = fitDist * (100 / percent)
      const { dist: fitDist } = fitInfoRef.current;
      const min = controls.minDistance ?? fitDist * 0.2;
      const max = controls.maxDistance ?? fitDist * 6;

      const targetDist = clamp(fitDist * (100 / clamp(percent, 25, 400)), min, max);
      // console.log('targetDist', targetDist, 'min', min, 'max', max, 'percent', percent);

      const cam = camera as PerspectiveCamera;
      const dir = cam.position.clone().sub(controls.target).normalize();
      cam.position.copy(controls.target.clone().add(dir.multiplyScalar(targetDist)));
      cam.updateProjectionMatrix();
      controls.update();
      notifyPercent();
    },
    [notifyPercent],
  );

  const fitToObject = useCallback(() => {
    const camera = orbitControlsRef.current?.object as PerspectiveCamera;
    const controls = orbitControlsRef.current;
    if (!camera || !controls || !groupRef.current) return;

    const box = new Box3().setFromObject(groupRef.current);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const radius = size.length() / 2;
    const padding = 1.2;
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (radius * padding) / Math.tan(fov / 2);

    const dir = camera.position.clone().sub(controls.target).normalize();
    const nextPos = center.clone().add(dir.multiplyScalar(dist));
    controls.target.copy(center);
    camera.position.copy(nextPos);
    camera.updateProjectionMatrix();
    controls.update();
    notifyPercent();
  }, [notifyPercent]);

  useEffect(() => {
    const onSet = (e: CustomEvent<{ percent: number }>) => setPercent(e.detail.percent);
    const onFit = () => fitToObject();

    heatMapEventBus.on('camera:set-zoom-percent', onSet);
    heatMapEventBus.on('camera:fit', onFit);
    return () => {
      heatMapEventBus.off('camera:set-zoom-percent', onSet);
      heatMapEventBus.off('camera:fit', onFit);
    };
  }, [fitToObject, setPercent]);

  // モデルが揃った/サイズが決まったタイミングで実行
  useEffect(() => {
    const controls = orbitControlsRef.current;
    const cam = controls?.object as PerspectiveCamera | undefined;
    if (!controls || !cam || !groupRef.current) return;

    const box = new Box3().setFromObject(groupRef.current);
    const size = new Vector3(),
      center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    const radius = size.length() / 2 || 100;
    const padding = 1.2;
    const fov = (cam.fov * Math.PI) / 180;
    const fitDist = (radius * padding) / Math.tan(fov / 2);

    // 100% の基準
    fitInfoRef.current = { dist: fitDist, center };

    // Controls のレンジ（fit を中心に）
    controls.minDistance = Math.max(1, fitDist * 0.2);
    controls.maxDistance = fitDist * 6;

    // カメラの near/far（遠クリップに埋もれないように）
    cam.near = Math.max(0.1, fitDist * 0.01);
    cam.far = fitDist * 12; // ← ここ重要！ far を十分大きく
    cam.updateProjectionMatrix();

    // 100% (= fit) の位置へ
    const dir = cam.position.clone().sub(controls.target).normalize();
    controls.target.copy(center);
    cam.position.copy(center.clone().add(dir.multiplyScalar(fitDist)));
    cam.updateProjectionMatrix();
    controls.update();
    notifyPercent();
  }, [model, modelType, notifyPercent]); // モデルが変わったら再計算

  return (
    <>
      <group ref={groupRef}>
        {modelType && map && modelType !== 'server' && typeof map === 'string' && <LocalModelLoader ref={modelRef} modelPath={map} modelType={modelType} />}
        {modelType && model && modelType === 'server' && typeof map !== 'string' && (
          <>
            <StreamModelLoader ref={modelRef} model={model} />
            {pointList && modelRef.current && heatmapType === 'fill' && showHeatmap && (
              <HeatmapFillOverlay group={modelRef.current} points={pointList} cellSize={(service.task?.stepSize || 50) / 2} opacity={heatmapOpacity} />
            )}
          </>
        )}
        {pointList && heatmapType === 'object' && showHeatmap && <HeatmapObjectOverlay points={pointList} />}
        {pointList && showHeatmap && <HotspotCircles points={pointList} />}
        {visibleEventLogs.length > 0 && visibleEventLogs.map((event) => <EventLogMarkers key={event.key} logName={event.key} service={service} pref={event} />)}
        {service &&
          timelineState &&
          timelineState.visible &&
          timelineState.details &&
          timelineState.details.length > 0 &&
          timelineState.details.map((tl, index) => (
            <PlayerTimelinePoints key={index} service={service} state={tl} currentTimelineSeek={currentTimelineSeek} visibleTimeRange={visibleTimelineRange} />
          ))}
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
      </group>
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} position0={new Vector3(1, 1, 3000)} />
    </>
  );
};

export const HeatMapCanvas = Component;
