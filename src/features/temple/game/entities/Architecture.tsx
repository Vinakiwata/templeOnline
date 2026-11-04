import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { PLATEAU, type Rect } from "../../domain/world";
import { playerRuntime, renderSettings } from "../systems/runtime";
import { makeTextTexture, SERIF } from "../systems/textTexture";

/**
 * Các khối kiến trúc dùng chung cho mọi công trình trong chùa.
 * Toạ độ là toạ độ thế giới; y tính từ mặt bằng chùa (PLATEAU).
 */

/** Chỉ hiển thị nội thất khi người chơi ở gần — giảm draw call trên mobile. */
export function Near({ x, z, r = 34, children }: { x: number; z: number; r?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const acc = useRef(1);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.25 || !g.current) return;
    acc.current = 0;
    const d = Math.hypot(playerRuntime.position.x - x, playerRuntime.position.z - z);
    const rr = r * renderSettings.nearScale;
    if (g.current.visible && d > rr + 4) g.current.visible = false;
    else if (!g.current.visible && d < rr) g.current.visible = true;
  });
  return <group ref={g}>{children}</group>;
}

/** Nền nâng: khối đá + mặt sàn lát gạch. */
export function Slab({ r, h, floor = M.floorTile, steps = "front" }: { r: Rect; h: number; floor?: THREE.Material; steps?: "front" | "none" | "left" | "right" }) {
  const w = r.maxX - r.minX;
  const d = r.maxZ - r.minZ;
  const cx = (r.minX + r.maxX) / 2;
  const cz = (r.minZ + r.maxZ) / 2;
  return (
    <group>
      <mesh position={[cx, PLATEAU + h / 2, cz]} material={M.stone} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, PLATEAU + h + 0.004, cz]} material={floor} receiveShadow>
        <planeGeometry args={[w - 0.3, d - 0.3]} />
      </mesh>
      {steps === "front" && h > 0.2 && (
        <Steps x={cx} z={r.maxZ} width={Math.min(w * 0.5, 8)} h={h} dir={1} axis="z" />
      )}
      {steps === "left" && h > 0.2 && <Steps x={r.minX} z={cz} width={Math.min(d * 0.4, 6)} h={h} dir={-1} axis="x" />}
      {steps === "right" && h > 0.2 && <Steps x={r.maxX} z={cz} width={Math.min(d * 0.4, 6)} h={h} dir={1} axis="x" />}
    </group>
  );
}

/** Bậc thềm đi xuống theo hướng dir từ mép nền. */
export function Steps({ x, z, width, h, dir, axis }: { x: number; z: number; width: number; h: number; dir: 1 | -1; axis: "x" | "z" }) {
  const n = Math.max(2, Math.round(h / 0.15));
  const run = 0.32;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const stepH = (h * (n - i)) / n;
        const off = dir * (run * i + run / 2);
        const pos: [number, number, number] =
          axis === "z" ? [x, PLATEAU + stepH / 2, z + off] : [x + off, PLATEAU + stepH / 2, z];
        const size: [number, number, number] = axis === "z" ? [width, stepH, run] : [run, stepH, width];
        return (
          <mesh key={i} position={pos} material={i % 2 ? M.stone : M.stoneDark} receiveShadow castShadow>
            <boxGeometry args={size} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Tường dạng hộp (chặn camera). */
export function Wall({
  r,
  y0,
  h,
  material = M.ochreWall,
}: {
  r: Rect;
  y0: number;
  h: number;
  material?: THREE.Material;
}) {
  return (
    <mesh
      position={[(r.minX + r.maxX) / 2, PLATEAU + y0 + h / 2, (r.minZ + r.maxZ) / 2]}
      material={material}
      castShadow
      receiveShadow
      userData={{ camBlock: true }}
    >
      <boxGeometry args={[r.maxX - r.minX, h, r.maxZ - r.minZ]} />
    </mesh>
  );
}

/** Cột sơn son có chân đá tảng. */
export function Column({ x, z, y0, h, radius = 0.24, material = M.lacquer }: { x: number; z: number; y0: number; h: number; radius?: number; material?: THREE.Material }) {
  return (
    <group position={[x, PLATEAU + y0, z]}>
      <mesh position={[0, 0.1, 0]} material={M.stone} castShadow>
        <cylinderGeometry args={[radius + 0.13, radius + 0.17, 0.2, 10]} />
      </mesh>
      <mesh position={[0, h / 2, 0]} material={material} castShadow>
        <cylinderGeometry args={[radius, radius * 1.1, h, 12]} />
      </mesh>
    </group>
  );
}

/** Xà ngang. */
export function Beam({ from, to, y, size = 0.35, material = M.lacquerDark }: { from: [number, number]; to: [number, number]; y: number; size?: number; material?: THREE.Material }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, PLATEAU + y, (from[1] + to[1]) / 2]}
      rotation-y={Math.atan2(dx, dz) - Math.PI / 2}
      material={material}
      castShadow
    >
      <boxGeometry args={[len, size, size]} />
    </mesh>
  );
}

/** Hoành phi trên cửa. */
export function Plaque({ x, y, z, width = 2.6, rotY = 0 }: { x: number; y: number; z: number; width?: number; rotY?: number }) {
  return (
    <group position={[x, PLATEAU + y, z]} rotation-y={rotY}>
      <mesh material={M.gold}>
        <boxGeometry args={[width + 0.2, 0.75, 0.06]} />
      </mesh>
      <mesh position={[0, 0, 0.04]} material={M.lacquer}>
        <boxGeometry args={[width, 0.58, 0.04]} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((t) => (
        <mesh key={t} position={[t * width, 0, 0.07]} material={M.goldBright}>
          <boxGeometry args={[width * 0.12, 0.32, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

/** Bàn thờ bậc: các tầng thấp dần về phía trước. */
export function AltarTiers({
  x,
  z,
  y0,
  width,
  tiers,
  material = M.lacquer,
}: {
  x: number;
  z: number;
  y0: number;
  width: number;
  /** [độ sâu, chiều cao] từ sau ra trước */
  tiers: [number, number][];
  material?: THREE.Material;
}) {
  let zCursor = z;
  return (
    <group>
      {tiers.map(([depth, height], i) => {
        const cz = zCursor + depth / 2;
        zCursor += depth;
        return (
          <group key={i}>
            <mesh position={[x, PLATEAU + y0 + height / 2, cz]} material={material} castShadow receiveShadow>
              <boxGeometry args={[width - i * 0.6, height, depth]} />
            </mesh>
            <mesh position={[x, PLATEAU + y0 + height - 0.03, cz + depth / 2 + 0.01]} material={M.gold}>
              <boxGeometry args={[width - i * 0.6, 0.06, 0.04]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Nến trên bàn thờ (không dùng đèn thật để nhẹ máy). */
export function CandlePair({ x, z, y, spread }: { x: number; z: number; y: number; spread: number }) {
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[x + s * spread, PLATEAU + y, z]}>
          <mesh position={[0, 0.2, 0]} material={M.candle}>
            <cylinderGeometry args={[0.045, 0.05, 0.4, 8]} />
          </mesh>
          <mesh position={[0, 0.45, 0]} material={M.flame}>
            <coneGeometry args={[0.03, 0.1, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Trần gỗ dưới mái — tránh nhìn thấy mặt dưới mái tối đen khi ở trong điện. */
export function Ceiling({ r, y }: { r: Rect; y: number }) {
  return (
    <mesh
      rotation-x={Math.PI / 2}
      position={[(r.minX + r.maxX) / 2, PLATEAU + y, (r.minZ + r.maxZ) / 2]}
      material={M.ceiling}
    >
      <planeGeometry args={[r.maxX - r.minX, r.maxZ - r.minZ]} />
    </mesh>
  );
}

/** Hoành phi có chữ (vẽ bằng canvas): dùng cho cổng Tam quan. */
export function TextPlaque({
  x,
  y,
  z,
  width,
  height = 0.9,
  rotY = 0,
  text,
  font = SERIF,
}: {
  x: number;
  y: number;
  z: number;
  width: number;
  height?: number;
  rotY?: number;
  text: string;
  font?: string;
}) {
  const tex = useMemo(
    () =>
      makeTextTexture({
        width: 1024,
        height: Math.round((1024 * height) / width),
        background: "#8f1f17",
        border: { color: "#e9b04d", width: 10, inset: 18 },
        lines: [{ text, font, color: "#f6cf6a", size: Math.round(((1024 * height) / width) * 0.52) }],
      }),
    [text, font, width, height],
  );
  return (
    <group position={[x, PLATEAU + y, z]} rotation-y={rotY}>
      <mesh material={M.gold} castShadow>
        <boxGeometry args={[width + 0.24, height + 0.24, 0.08]} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Câu đối dọc treo trên cột: mỗi chữ một dòng, chữ vàng trên nền son. */
export function CoupletBoard({
  x,
  y,
  z,
  width,
  height,
  text,
  rotY = 0,
}: {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  text: string;
  rotY?: number;
}) {
  const tex = useMemo(() => {
    const words = text.replace(/[,.;:]/g, "").split(/\s+/).filter(Boolean);
    const W = 256;
    const H = Math.round((W * height) / width);
    const size = Math.min(W * 0.36, (H * 0.9) / (words.length * 1.18));
    return makeTextTexture({
      width: W,
      height: H,
      background: "#8f1f17",
      border: { color: "#e9b04d", width: 6, inset: 12 },
      lines: words.map((w) => ({ text: w, font: SERIF, color: "#f6cf6a", size: Math.round(size) })),
      lineGap: 0.18,
    });
  }, [text, width, height]);
  return (
    <group position={[x, PLATEAU + y, z]} rotation-y={rotY}>
      <mesh material={M.gold} castShadow>
        <boxGeometry args={[width + 0.12, height + 0.12, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}
