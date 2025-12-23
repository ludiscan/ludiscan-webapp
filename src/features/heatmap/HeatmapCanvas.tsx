import { ContactShadows, GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';

import { HeatmapObjectOverlay } from './HeatmapObjectOverlay';
import { FocusController } from './selection/FocusController';

import type { components } from '@generated/api';
import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group, PerspectiveCamera, OrthographicCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { EventLogMarkers } from '@src/features/heatmap/EventLogMarkers';
import FieldObjectMarkers from '@src/features/heatmap/FieldObjectMarkers';
import { HeatmapFillOverlay } from '@src/features/heatmap/HeatmapFillOverlay';
import { HotspotCircles } from '@src/features/heatmap/HotspotCircles';
import { LocalModelLoader, StreamModelLoader } from '@src/features/heatmap/ModelLoader';
import { PlayerTimelinePoints } from '@src/features/heatmap/PlayerTimelinePoints';
import { RouteCoachVisualization } from '@src/features/heatmap/RouteCoachVisualization';
import { RouteVisualization } from '@src/features/heatmap/RouteVisualization';
import { WaypointMarker } from '@src/features/heatmap/WaypointMarker';
import { FocusPingLayer } from '@src/features/heatmap/selection/FocusPingLayer';
import { useEventLogSelect } from '@src/hooks/useEventLog';
import { useFieldObjectSelect } from '@src/hooks/useFieldObject';
import { useGeneralPick } from '@src/hooks/useGeneral';
import { usePlayerTimelinePick } from '@src/hooks/usePlayerTimeline';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type HeatmapCanvasProps = {
  model: Group | null;
  service: HeatmapDataService;
  map?: string | ArrayBuffer | null;
  modelType?: 'gltf' | 'glb' | 'obj' | 'server' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
  visibleTimelineRange: PlayerTimelinePointsTimeRange;
  dimensionality: '2d' | '3d';
  fieldObjectLogs?: components['schemas']['FieldObjectLogDto'][];
  projectId?: number;
  playerId?: string;
  hasLocalModel?: boolean; // ローカルモデルがある場合はtrue
};

type Waypoint = {
  id: string;
  position: Vector3; // x, y, z 座標（モデル表面に対して Y 座標を合わせたもの）
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const EventLogs = memo(
  ({ service }: { service: HeatmapDataService }) => {
    const logs = useEventLogSelect((s) => s.logs);
    const visibleEventLogs = useMemo(() => logs.filter((event) => event.visible), [logs]);
    return (
      <>
        {visibleEventLogs.length > 0 && visibleEventLogs.map((event) => <EventLogMarkers key={event.key} logName={event.key} service={service} pref={event} />)}
      </>
    );
  },
  (prev, next) => {
    return prev.service === next.service;
  },
);

EventLogs.displayName = 'EventLogs';

const FieldObjects = memo(
  ({ logs }: { logs: components['schemas']['FieldObjectLogDto'][] }) => {
    const objects = useFieldObjectSelect((s) => s.objects);
    const queryText = useFieldObjectSelect((s) => s.queryText);
    const visibleObjects = useMemo(() => objects.filter((obj) => obj.visible), [objects]);

    if (visibleObjects.length === 0) return null;

    return (
      <>
        {visibleObjects.map((obj, i) => (
          <FieldObjectMarkers key={i} objectType={obj.objectType} pref={obj} logs={logs} queryText={queryText} />
        ))}
      </>
    );
  },
  (prev, next) => prev.logs === next.logs,
);

FieldObjects.displayName = 'FieldObjects';

const TimelinePoints = memo(
  ({ service, visibleTimelineRange }: { service: HeatmapDataService; visibleTimelineRange: PlayerTimelinePointsTimeRange }) => {
    const { visible, details } = usePlayerTimelinePick('visible', 'details');
    return (
      <>
        {service &&
          visible &&
          details &&
          details.length > 0 &&
          details.map((tl, index) => <PlayerTimelinePoints key={index} service={service} state={tl} visibleTimeRange={visibleTimelineRange} />)}
      </>
    );
  },
  (prev, next) => {
    return prev.service === next.service && prev.visibleTimelineRange === next.visibleTimelineRange;
  },
);
TimelinePoints.displayName = 'TimelinePoints';

const HeatMapCanvasComponent: FC<HeatmapCanvasProps> = ({
  model,
  map,
  modelType,
  pointList,
  service,
  visibleTimelineRange,
  dimensionality,
  fieldObjectLogs = [],
  playerId,
  hasLocalModel = false,
}) => {
  // const { invalidate } = useThree();
  const fitInfoRef = useRef<{ dist: number; center: Vector3 }>({ dist: 1000, center: new Vector3() });
  const { showHeatmap, heatmapOpacity, heatmapType, showMapIn2D, showShadow } = useGeneralPick(
    'showHeatmap',
    'heatmapOpacity',
    'heatmapType',
    'showMapIn2D',
    'showShadow',
  );
  const { theme } = useSharedTheme();

  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const groupRef = useRef<Group>(null);
  const orthoBaseZoomRef = useRef<number | null>(null);

  // **1-1. State を追加**
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  const [draggingWaypointId, setDraggingWaypointId] = useState<string | null>(null);

  // Raycaster を使ってモデル表面上の正しい高さ（Y 座標）を求めるための準備
  const { camera, gl, scene } = useThree(); // size は canvas の幅・高さ、gl は renderer
  const raycaster = useMemo(() => new Raycaster(), []);
  const modelRef = useRef<Group>(null);

  // Camera and interaction constants
  const MOVE_DELTA = 10; // Waypoint movement delta
  const RAYCAST_HEIGHT = 10000; // Height for raycast origin
  const DEFAULT_WAYPOINT_Z = 200; // Default Z position for new waypoints
  const MIN_DISTANCE_MULTIPLIER = 0.2; // Minimum camera distance multiplier
  const MAX_DISTANCE_MULTIPLIER = 6; // Maximum camera distance multiplier
  const ZOOM_BASE_VALUE = 100; // Base value for zoom calculations
  const ZOOM_MIN_PERCENT = 25; // Minimum zoom percentage
  const ZOOM_MAX_PERCENT = 400; // Maximum zoom percentage
  const FIT_PADDING = 1.2; // Padding for fit-to-object

  // モデル表面での正確な Y 座標を取得する関数
  const getHeightOnModel = useCallback(
    (x: number, z: number): Vector3 | null => {
      if (!modelRef.current) return null;
      // Y を十分大きな位置にして、その直下方向（0,-1,0）に Raycaster を飛ばす
      const origin = new Vector3(x, RAYCAST_HEIGHT, z);
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
      const defaultZ = DEFAULT_WAYPOINT_Z;
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
    // 2Dモード: 真上からのシンプルな照明
    // 3Dモード: 既存の複数光源
    const lights: (AmbientLight | DirectionalLight | HemisphereLight)[] = [];

    if (dimensionality === '2d') {
      // 2D: 環境光+真上からの平行光源のみ
      const ambientLight = new AmbientLight(0xffffff, 0.6);
      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 0); // 真上から
      lights.push(ambientLight, directionalLight);
    } else {
      // 3D: 全方位から十分な光を当てる照明システム
      const ambientLight = new AmbientLight(0xffffff, 1); // 環境光を強化
      const directionalLight = new DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(2000, 3000, 2000); // 斜め上から（シャドウ用に位置を設定）

      // シャドウ設定
      if (showShadow) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 100;
        directionalLight.shadow.camera.far = 10000;
        // シャドウカメラの範囲（シーンをカバーするように設定）
        const shadowCameraSize = 5000;
        directionalLight.shadow.camera.left = -shadowCameraSize;
        directionalLight.shadow.camera.right = shadowCameraSize;
        directionalLight.shadow.camera.top = shadowCameraSize;
        directionalLight.shadow.camera.bottom = -shadowCameraSize;
        directionalLight.shadow.bias = -0.0005; // シャドウアクネ防止
      }

      const directionalLight2 = new DirectionalLight(0xffffff, 0.2);
      directionalLight2.position.set(-1, 0.5, -1).normalize(); // 反対側から補助光
      const hemisphereLight = new HemisphereLight(0xffffff, 0x444444, 0.4); // 空と地面の色
      lights.push(ambientLight, directionalLight, directionalLight2, hemisphereLight);
    }

    lights.forEach((light) => scene.add(light));

    return () => {
      lights.forEach((light) => scene.remove(light));
    };
  }, [scene, theme, dimensionality, showShadow]);

  // グリッド and 床面をシーンに追加
  useEffect(() => {
    // グリッドを作成
    const gridSize = 10000;
    const gridDivisions = 100;
    const gridHelper = new GridHelper(gridSize, gridDivisions, 0x888888, 0xcccccc);
    gridHelper.position.y = -1000; // 床のわずか下に配置してZファイティングを避ける

    // 床面を作成（半透明の平面）
    const groundGeometry = new PlaneGeometry(gridSize, gridSize);
    const groundMaterial = new MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 0.3, // 半透明
      emissive: 0xf0f0f0,
      emissiveIntensity: 0.2,
    });
    const groundMesh = new Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // XZ平面に合わせる
    groundMesh.position.y = -1; // グリッドより下に配置

    scene.add(gridHelper);
    // scene.add(groundMesh);

    return () => {
      scene.remove(gridHelper);
      // scene.remove(groundMesh);
      groundGeometry.dispose();
      groundMaterial.dispose();
    };
  }, [scene]);

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
      const min = controls.minDistance ?? fitDist * MIN_DISTANCE_MULTIPLIER;
      const max = controls.maxDistance ?? fitDist * MAX_DISTANCE_MULTIPLIER;

      const targetDist = clamp(fitDist * (ZOOM_BASE_VALUE / clamp(percent, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT)), min, max);
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
    const padding = FIT_PADDING;
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

  // 2Dモードにリセットするハンドラー
  const reset2DCamera = useCallback(() => {
    const controls = orbitControlsRef.current;
    const camera = controls?.object as PerspectiveCamera | OrthographicCamera | undefined;
    if (!controls || !camera || !groupRef.current) return;

    // モデルの中心を取得
    const box = new Box3().setFromObject(groupRef.current);
    const center = new Vector3();
    box.getCenter(center);

    // 2Dモード：真上からの視点にリセット
    controls.target.copy(center);
    camera.position.set(center.x, 5000, center.z); // 真上から
    camera.up.set(0, 0, -1); // Z軸が上
    camera.updateProjectionMatrix();
    controls.update();
    notifyPercent();
  }, [notifyPercent]);

  // 3Dモードにリセットするハンドラー
  const reset3DCamera = useCallback(() => {
    const controls = orbitControlsRef.current;
    const camera = controls?.object as PerspectiveCamera | OrthographicCamera | undefined;
    if (!controls || !camera || !groupRef.current) return;

    // モデルの中心を取得
    const box = new Box3().setFromObject(groupRef.current);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    // 3Dモード：斜めからの視点にリセット（upベクトルを標準に戻す）
    camera.up.set(0, 1, 0); // Y軸が上（標準）
    controls.target.copy(center);

    // 斜め視点の計算
    const radius = size.length() / 2 || 100;
    const dist = radius * 2;
    camera.position.set(center.x + dist, center.y + dist, center.z - dist);
    camera.updateProjectionMatrix();
    controls.update();
    notifyPercent();
  }, [notifyPercent]);

  useEffect(() => {
    const onSet = (e: CustomEvent<{ percent: number }>) => setPercent(e.detail.percent);
    const onFit = () => fitToObject();
    const onReset2D = () => reset2DCamera();
    const onReset3D = () => reset3DCamera();

    heatMapEventBus.on('camera:set-zoom-percent', onSet);
    heatMapEventBus.on('camera:fit', onFit);
    heatMapEventBus.on('camera:reset-2d', onReset2D);
    heatMapEventBus.on('camera:reset-3d', onReset3D);
    return () => {
      heatMapEventBus.off('camera:set-zoom-percent', onSet);
      heatMapEventBus.off('camera:fit', onFit);
      heatMapEventBus.off('camera:reset-2d', onReset2D);
      heatMapEventBus.off('camera:reset-3d', onReset3D);
    };
  }, [fitToObject, setPercent, reset2DCamera, reset3DCamera]);

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
        {/* 3Dモデルは3Dモードまたは2Dモードでマップ表示がONの場合、またはローカルモデルがある場合に表示 */}
        {(dimensionality === '3d' || showMapIn2D || hasLocalModel) && modelType && map && modelType !== 'server' && typeof map === 'string' && (
          <LocalModelLoader ref={modelRef} modelPath={map} modelType={modelType} />
        )}
        {(dimensionality === '3d' || showMapIn2D || hasLocalModel) && modelType && model && modelType === 'server' && (
          <>
            <StreamModelLoader ref={modelRef} model={model} />
            {/* fillモードは3Dモデル表面に配置するため、モデルがある場合のみ表示 */}
            {pointList && modelRef.current && heatmapType === 'fill' && showHeatmap && (
              <HeatmapFillOverlay group={modelRef.current} points={pointList} cellSize={(service.task?.stepSize || 50) / 2} opacity={heatmapOpacity} />
            )}
          </>
        )}
        {/* objectモードとホットスポットは2D/3D両方で表示 */}
        {pointList && heatmapType === 'object' && showHeatmap && <HeatmapObjectOverlay points={pointList} />}
        {pointList && showHeatmap && <HotspotCircles points={pointList} />}
        <EventLogs service={service} />
        {fieldObjectLogs && fieldObjectLogs.length > 0 && <FieldObjects logs={fieldObjectLogs} />}
        <TimelinePoints service={service} visibleTimelineRange={visibleTimelineRange} />
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
      {/* AO風の接地影 - モデルの下に柔らかい影を投射 */}
      {showShadow && <ContactShadows position={[0, 600, 0]} opacity={0.4} scale={10000} blur={2} far={5000} resolution={512} color='#000000' />}
      <FocusController orbit={orbitControlsRef} sceneRoot={groupRef} />
      <OrbitControls
        makeDefault
        enableZoom
        enablePan
        enableRotate={dimensionality === '3d'} // 2Dモードでは回転を無効化
        ref={orbitControlsRef}
        position0={new Vector3(1, 1, 3000)}
      />
      <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
        <GizmoViewport axisHeadScale={1.1} />
      </GizmoHelper>
      <FocusPingLayer ttlMs={1800} baseRadius={60} />
      <RouteVisualization dimensionality={dimensionality} />
      {service.projectId && service.sessionId && <RouteCoachVisualization projectId={service.projectId} sessionId={service.sessionId} playerId={playerId} />}
    </>
  );
};

export const HeatMapCanvas = memo(
  HeatMapCanvasComponent,
  (prev, next) =>
    prev.model === next.model &&
    prev.map === next.map &&
    prev.modelType === next.modelType &&
    prev.pointList === next.pointList &&
    prev.visibleTimelineRange === next.visibleTimelineRange &&
    prev.service.task == next.service.task &&
    prev.dimensionality === next.dimensionality &&
    prev.fieldObjectLogs === next.fieldObjectLogs &&
    prev.playerId === next.playerId &&
    prev.service.sessionId === next.service.sessionId &&
    prev.service.projectId === next.service.projectId &&
    prev.hasLocalModel === next.hasLocalModel,
);
