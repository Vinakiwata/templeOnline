import { useMemo } from "react";
import * as THREE from "three";
import { M } from "./materials";

/**
 * Mái hông có nóc (hip roof) — tạo hình mái chùa với 4 đầu đao cong lên.
 * width theo trục X, depth theo trục Z, gốc tọa độ ở mép dưới mái.
 */
function createHipRoofGeometry(w: number, d: number, h: number) {
  const hw = w / 2;
  const hd = d / 2;
  const r = Math.max(0, hw - hd * 0.95);
  const A = [-hw, 0, hd];
  const B = [hw, 0, hd];
  const C = [hw, 0, -hd];
  const D = [-hw, 0, -hd];
  const R1 = [-r, h, 0];
  const R2 = [r, h, 0];
  const tris = [
    A, B, R2, A, R2, R1, // trước
    C, D, R1, C, R1, R2, // sau
    B, C, R2, // phải
    D, A, R1, // trái
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(tris.flat(), 3));
  geo.computeVertexNormals();
  return { geo, ridgeHalf: r };
}

interface RoofProps {
  width: number;
  depth: number;
  height: number;
  position?: [number, number, number];
  ridge?: boolean;
  pearl?: boolean;
}

export function Roof({ width, depth, height, position = [0, 0, 0], ridge = true, pearl = false }: RoofProps) {
  const { geo, ridgeHalf } = useMemo(() => createHipRoofGeometry(width, depth, height), [width, depth, height]);
  const corners: [number, number][] = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  return (
    <group position={position}>
      <mesh geometry={geo} material={M.roofTile} castShadow receiveShadow userData={{ camBlock: true }} />
      {/* Viền mái */}
      <mesh position={[0, 0.02, 0]} material={M.roofTileDark}>
        <boxGeometry args={[width + 0.15, 0.12, depth + 0.15]} />
      </mesh>
      {/* Đầu đao */}
      {corners.map(([sx, sz]) => (
        <group
          key={`${sx}${sz}`}
          position={[(sx * width) / 2, 0.05, (sz * depth) / 2]}
          rotation={[0, Math.atan2(sx * width, sz * depth), 0]}
        >
          <mesh rotation={[0.95, 0, 0]} position={[0, 0.25, 0.18]} material={M.roofTileDark} castShadow>
            <coneGeometry args={[0.14, 0.9, 6]} />
          </mesh>
        </group>
      ))}
      {ridge && ridgeHalf > 0.1 && (
        <group position={[0, height, 0]}>
          <mesh material={M.roofTileDark} castShadow>
            <boxGeometry args={[ridgeHalf * 2 + 0.6, 0.28, 0.32]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * (ridgeHalf + 0.35), 0.3, 0]}
              rotation={[0, 0, s * -0.5]}
              material={M.roofTileDark}
              castShadow
            >
              <coneGeometry args={[0.16, 0.8, 6]} />
            </mesh>
          ))}
        </group>
      )}
      {pearl && (
        <group position={[0, height + 0.35, 0]}>
          <mesh material={M.goldBright}>
            <sphereGeometry args={[0.28, 20, 16]} />
          </mesh>
          <mesh position={[0, 0.38, 0]} material={M.goldBright}>
            <coneGeometry args={[0.12, 0.45, 8]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
