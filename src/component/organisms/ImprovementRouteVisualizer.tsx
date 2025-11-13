import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useSharedTheme } from '@src/hooks/useSharedTheme';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ImprovementRoute {
  id: number;
  trajectory_points: Point3D[];
  strategy_type: 'divergence' | 'safety_passage' | 'faster';
  success_rate: number;
}

interface Cluster {
  cluster_center_x: number;
  cluster_center_y: number;
  cluster_center_z: number;
  cluster_radius: number;
}

interface ImprovementRouteVisualizerProps {
  className?: string;
  route: ImprovementRoute;
  cluster: Cluster;
  onClose: () => void;
}

/**
 * 改善案ルートを3D可視化するコンポーネント
 */
const Component: FC<ImprovementRouteVisualizerProps> = ({ className, route, cluster, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const theme = useSharedTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.colors.background.default);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 10000);
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Draw cluster center (red sphere)
    const clusterGeometry = new THREE.SphereGeometry(cluster.cluster_radius, 16, 16);
    const clusterMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const clusterMesh = new THREE.Mesh(clusterGeometry, clusterMaterial);
    clusterMesh.position.set(cluster.cluster_center_x, cluster.cluster_center_y, cluster.cluster_center_z);
    scene.add(clusterMesh);

    // Draw route trajectory (blue line)
    const routeGeometry = new THREE.BufferGeometry();
    const routePositions = route.trajectory_points.map((p) => [p.x, p.y, p.z]);
    routeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(routePositions.flat()), 3));

    const strategyColors = {
      divergence: 0x0066ff,
      safety_passage: 0x00cc00,
      faster: 0xffaa00,
    };
    const routeMaterial = new THREE.LineBasicMaterial({
      color: strategyColors[route.strategy_type],
      linewidth: 2,
    });
    const routeLine = new THREE.Line(routeGeometry, routeMaterial);
    scene.add(routeLine);

    // Draw route points
    const pointsGeometry = new THREE.SphereGeometry(2, 8, 8);
    const pointsMaterial = new THREE.MeshBasicMaterial({
      color: strategyColors[route.strategy_type],
    });
    route.trajectory_points.forEach((point) => {
      const mesh = new THREE.Mesh(pointsGeometry, pointsMaterial);
      mesh.position.set(point.x, point.y, point.z);
      scene.add(mesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto rotate
      scene.rotation.z += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    const currentContainer = containerRef.current;
    return () => {
      currentContainer?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [route, cluster]);

  const strategyLabels = {
    divergence: '分岐点検出',
    safety_passage: '安全通過',
    faster: '時間短縮',
  };

  const strategyColors = {
    divergence: theme.colors.primary.main,
    safety_passage: theme.colors.semantic.success.main,
    faster: theme.colors.secondary.main,
  };

  return (
    <div className={`${className}__overlay`} onClick={onClose} role='presentation'>
      <div className={`${className}__window`} onClick={(e) => e.stopPropagation()} role='presentation'>
        <div className={`${className}__header`}>
          <div>
            <h3 className={`${className}__title`}>改善案ルート 3D可視化</h3>
            <div className={`${className}__subtitle`}>
              戦略: {strategyLabels[route.strategy_type as keyof typeof strategyLabels]} | 成功率: {(route.success_rate * 100).toFixed(0)}%
            </div>
          </div>
          <button className={`${className}__closeButton`} onClick={onClose} type='button'>
            閉じる
          </button>
        </div>
        <div className={`${className}__canvas`} ref={containerRef} />
        <div className={`${className}__legend`}>
          <div className={`${className}__legendItem`}>
            <div className={`${className}__legendColor ${className}__legendColor--error`} />
            <span>死亡クラスタ（半径: {cluster.cluster_radius}m）</span>
          </div>
          <div className={`${className}__legendItem`}>
            <div className={`${className}__legendColor ${className}__legendColor--${route.strategy_type}`} />
            <span>改善案ルート ({route.trajectory_points.length} points)</span>
          </div>
          <div className={`${className}__legendItem`}>
            <span>💡 マウスで自動回転します。クリックで閉じます。</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImprovementRouteVisualizer = styled(Component)`
  &__overlay {
    position: fixed;
    inset: 0;
    z-index: ${({ theme }) => (theme.mode === 'light' ? 1000 : 1000)};
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.background.overlay};
  }

  &__window {
    display: flex;
    flex-direction: column;
    max-width: 90vw;
    max-height: 90vh;
    background-color: ${({ theme }) => theme.colors.surface.base};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.default};
  }

  &__title {
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__closeButton {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.error.contrast};
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
    border: none;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.semantic.error.dark};
    }
  }

  &__canvas {
    position: relative;
    width: 100%;
    max-width: 800px;
    height: auto;
    aspect-ratio: 4 / 3;

    @media (max-width: 900px) {
      max-width: 100%;
    }

    & > canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }

  &__legend {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-top: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.default};
  }

  &__legendItem {
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
    align-items: center;
  }

  &__legendColor {
    width: 12px;
    height: 12px;
    border-radius: ${({ theme }) => theme.borders.radius.sm};

    &--error {
      background-color: ${({ theme }) => theme.colors.semantic.error.main};
    }

    &--divergence {
      background-color: ${({ theme }) => theme.colors.primary.main};
    }

    &--safety_passage {
      background-color: ${({ theme }) => theme.colors.semantic.success.main};
    }

    &--faster {
      background-color: ${({ theme }) => theme.colors.secondary.main};
    }
  }
`;
