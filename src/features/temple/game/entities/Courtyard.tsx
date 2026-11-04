import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { Roof } from "./Roof";
import { LotusFlower } from "./BuddhaStatue";
import { gameEvents } from "../systems/events";
import { useTempleStore } from "../../application/templeStore";
import { LANTERN_POSITIONS, TREE_POSITIONS } from "../../domain/world";

// ── Lư hương + khói ────────────────────────────────────────────────────────
function useSmokeTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const g = canvas.getContext("2d");
    if (g) {
      const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grd.addColorStop(0, "rgba(255,255,255,0.9)");
      grd.addColorStop(0.5, "rgba(255,255,255,0.35)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

const INCENSE_DURATION_MS = 120_000;

function Smoke({ count, origin }: { count: number; origin: [number, number, number] }) {
  const tex = useSmokeTexture();
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const litAt = useTempleStore((s) => s.incenseLitAt);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);

  useFrame(({ clock }) => {
    const active = litAt !== null && Date.now() - litAt < INCENSE_DURATION_MS;
    const t0 = clock.elapsedTime * 0.22;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const t = (t0 + offsets[i]) % 1;
      s.position.set(Math.sin(t * 7 + i) * 0.18 * t, t * 2.4, Math.cos(t * 5 + i) * 0.12 * t);
      const sc = 0.12 + t * 0.6;
      s.scale.set(sc, sc, sc);
      const mat = s.material as THREE.SpriteMaterial;
      mat.opacity = active ? Math.sin(t * Math.PI) * 0.32 : 0;
      s.visible = active;
    });
  });

  return (
    <group position={origin}>
      {offsets.map((_, i) => (
        <sprite key={i} ref={(el) => (sprites.current[i] = el)}>
          <spriteMaterial map={tex} color="#e9e4da" transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

export function IncenseBurner({ smokeCount }: { smokeCount: number }) {
  const litAt = useTempleStore((s) => s.incenseLitAt);
  const sticks = useRef<THREE.Group>(null);
  useFrame(() => {
    if (sticks.current) {
      sticks.current.visible = litAt !== null && Date.now() - litAt < INCENSE_DURATION_MS * 1.5;
    }
  });
  return (
    <group position={[0, 0, 8]}>
      <mesh position={[0, 0.3, 0]} material={M.stone} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.6, 1.7]} />
      </mesh>
      <mesh position={[0, 0.63, 0]} material={M.stoneDark}>
        <boxGeometry args={[1.85, 0.08, 1.85]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} material={M.bronze} castShadow>
        <cylinderGeometry args={[0.7, 0.52, 0.7, 24]} />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation-x={Math.PI / 2} material={M.bronzeDark}>
        <torusGeometry args={[0.7, 0.05, 8, 32]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.78, 1.22, 0]} rotation={[0, Math.PI / 2, 0]} material={M.bronzeDark}>
          <torusGeometry args={[0.14, 0.035, 8, 16]} />
        </mesh>
      ))}
      <group ref={sticks} position={[0, 1.3, 0]} visible={false}>
        {[-0.12, 0, 0.12].map((x, i) => (
          <group key={x} position={[x, 0.32, 0]} rotation={[0, 0, (i - 1) * -0.08]}>
            <mesh material={M.incenseStick}>
              <cylinderGeometry args={[0.012, 0.012, 0.64, 6]} />
            </mesh>
            <mesh position={[0, 0.33, 0]} material={M.incenseTip}>
              <sphereGeometry args={[0.02, 6, 6]} />
            </mesh>
          </group>
        ))}
      </group>
      <Smoke count={smokeCount} origin={[0, 1.95, 0]} />
    </group>
  );
}

// ── Lầu chuông ─────────────────────────────────────────────────────────────
const BELL_PROFILE = [
  [0.0, 0.0],
  [0.62, 0.0],
  [0.6, 0.06],
  [0.52, 0.2],
  [0.48, 0.5],
  [0.45, 0.82],
  [0.36, 0.97],
  [0.1, 1.02],
  [0.0, 1.02],
].map(([x, y]) => new THREE.Vector2(x, y));

export function BellTower() {
  const bell = useRef<THREE.Group>(null);
  const striker = useRef<THREE.Group>(null);
  const ringAt = useRef<number | null>(null);
  const clockRef = useRef(0);

  useEffect(() => gameEvents.on("bell:ring", () => (ringAt.current = clockRef.current)), []);

  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
    const since = ringAt.current === null ? 99 : clock.elapsedTime - ringAt.current;
    if (bell.current) {
      const amp = since < 8 ? 0.06 * Math.exp(-since * 0.6) : 0;
      bell.current.rotation.z = Math.sin(since * 4.2) * amp;
    }
    if (striker.current) {
      // Chày gỗ lùi lại rồi đánh vào chuông (đã được Player đồng bộ theo keyframe).
      const back = since < 0.15 ? since / 0.15 : since < 1.2 ? 1 - (since - 0.15) / 1.05 : 0;
      striker.current.position.x = -1.25 - Math.max(0, back) * 0.25;
    }
  });

  const posts: [number, number][] = [
    [-1.8, -1.8],
    [1.8, -1.8],
    [-1.8, 1.8],
    [1.8, 1.8],
  ];
  return (
    <group position={[10, 0, 4]}>
      <mesh position={[0, 0.15, 0]} material={M.stone} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.3, 4.8]} />
      </mesh>
      {posts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 2.0, z]} material={M.lacquer} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 3.4, 12]} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 0]} material={M.wood} castShadow>
        <boxGeometry args={[4.0, 0.22, 0.24]} />
      </mesh>
      <mesh position={[0, 3.6, 0]} rotation-y={Math.PI / 2} material={M.wood} castShadow>
        <boxGeometry args={[4.0, 0.22, 0.24]} />
      </mesh>
      <Roof width={5.8} depth={5.8} height={1.7} position={[0, 3.72, 0]} ridge={false} />
      <group ref={bell} position={[0, 3.5, 0]}>
        <mesh position={[0, -1.25, 0]} material={M.bronze} castShadow>
          <latheGeometry args={[BELL_PROFILE, 32]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} material={M.bronzeDark}>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
        </mesh>
        <mesh position={[0, -0.95, 0]} material={M.gold}>
          <torusGeometry args={[0.47, 0.02, 6, 32]} />
        </mesh>
      </group>
      <group ref={striker} position={[-1.25, 2.85, 0]}>
        <mesh rotation-z={Math.PI / 2} material={M.woodLight} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.3, 10]} />
        </mesh>
      </group>
    </group>
  );
}

// ── Ao sen ─────────────────────────────────────────────────────────────────
export function LotusPond() {
  const pads = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: 12 }, () => {
      const a = rnd() * Math.PI * 2;
      const r = 0.6 + rnd() * 2.3;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.7 + rnd() * 0.5, flower: rnd() > 0.55 };
    });
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = 0.1 + Math.sin(clock.elapsedTime * 0.8) * 0.01;
  });
  return (
    <group position={[-10, 0, 5]}>
      <mesh position={[0, 0.14, 0]} rotation-x={Math.PI / 2} material={M.stone} castShadow receiveShadow>
        <torusGeometry args={[3.45, 0.2, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation-x={-Math.PI / 2} material={M.water} receiveShadow>
        <circleGeometry args={[3.4, 48]} />
      </mesh>
      <group ref={group}>
        {pads.map((p, i) => (
          <group key={i} position={[p.x, 0, p.z]}>
            <mesh material={M.lilyPad} scale={p.s}>
              <cylinderGeometry args={[0.32, 0.32, 0.02, 14, 1, false, 0.3, Math.PI * 1.85]} />
            </mesh>
            {p.flower && <LotusFlower position={[0, 0.01, 0]} scale={1.3} />}
          </group>
        ))}
      </group>
    </group>
  );
}

// ── Cây ────────────────────────────────────────────────────────────────────
export function Tree({ position, scale = 1, detail = 1 }: { position: [number, number, number]; scale?: number; detail?: number }) {
  const clumps: [number, number, number, number][] = [
    [0, 3.4, 0, 1.5],
    [0.9, 3.0, 0.4, 1.1],
    [-0.8, 3.1, -0.3, 1.15],
    [0.2, 4.2, -0.4, 1.0],
  ];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]} material={M.trunk} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 2.6, 8]} />
      </mesh>
      {clumps.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={i % 2 ? M.leafDark : M.leaf} castShadow>
          <icosahedronGeometry args={[r, detail]} />
        </mesh>
      ))}
    </group>
  );
}

export function BodhiTree({ detail = 1 }: { detail?: number }) {
  const clumps: [number, number, number, number][] = [
    [0, 5.2, 0, 2.6],
    [2.2, 4.6, 0.6, 1.9],
    [-2.3, 4.5, 0.3, 2.0],
    [0.6, 4.4, 2.0, 1.8],
    [-0.6, 4.6, -2.0, 1.9],
    [1.2, 6.2, -0.6, 1.6],
  ];
  return (
    <group position={[-10, 0, 12.6]}>
      <mesh position={[0, 1.6, 0]} material={M.trunk} castShadow>
        <cylinderGeometry args={[0.45, 0.8, 3.2, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.9, 3.4, 0.2]} rotation-z={s * -0.7} material={M.trunk} castShadow>
          <cylinderGeometry args={[0.18, 0.3, 2.2, 8]} />
        </mesh>
      ))}
      {clumps.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={i % 2 ? M.leafDark : M.leaf} castShadow>
          <icosahedronGeometry args={[r, detail]} />
        </mesh>
      ))}
      {/* Bệ đá quanh gốc */}
      <mesh position={[0, 0.15, 0]} material={M.stone} receiveShadow>
        <cylinderGeometry args={[1.25, 1.35, 0.3, 20]} />
      </mesh>
      {/* Bồ đoàn */}
      <mesh position={[0, 0.09, 3.2]} material={M.cushion} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.45, 0.18, 20]} />
      </mesh>
    </group>
  );
}

// ── Tượng Quán Âm ──────────────────────────────────────────────────────────
export function QuanAmStatue() {
  return (
    <group position={[10, 0, 14]}>
      <mesh position={[0, 0.35, 0]} material={M.stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.7, 20]} />
      </mesh>
      <group position={[0, 0.7, 0]} scale={1.25}>
        <LotusFlower position={[0, -0.05, 0]} scale={4.5} />
        <mesh position={[0, 0.95, 0]} material={M.whiteJade} castShadow>
          <coneGeometry args={[0.42, 1.7, 20]} />
        </mesh>
        <mesh position={[0, 1.55, 0]} scale={[0.26, 0.42, 0.2]} material={M.whiteJade} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <mesh position={[0, 2.06, 0]} material={M.whiteJade} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
        </mesh>
        <mesh position={[0, 2.12, -0.05]} scale={[1, 1.2, 1]} material={M.whiteJade}>
          <sphereGeometry args={[0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        </mesh>
        {/* Bình cam lồ */}
        <mesh position={[0.2, 1.38, 0.2]} material={M.whiteJade}>
          <cylinderGeometry args={[0.035, 0.06, 0.2, 10]} />
        </mesh>
        <mesh position={[0, 2.05, -0.2]} material={M.goldBright}>
          <torusGeometry args={[0.3, 0.02, 6, 32]} />
        </mesh>
        <mesh position={[0, 2.05, -0.21]} material={M.halo}>
          <circleGeometry args={[0.3, 32]} />
        </mesh>
      </group>
    </group>
  );
}

// ── Tam quan (cổng chùa) ───────────────────────────────────────────────────
export function Gate() {
  const pillars: [number, number][] = [
    [-2, 4.4],
    [2, 4.4],
    [-5.6, 3.3],
    [5.6, 3.3],
  ];
  return (
    <group position={[0, 0, 22.2]}>
      {pillars.map(([x, h]) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, h / 2, 0]} material={M.ochreWall} castShadow>
            <boxGeometry args={[0.7, h, 0.7]} />
          </mesh>
          <mesh position={[0, h + 0.2, 0]} material={M.lacquer}>
            <boxGeometry args={[0.55, 0.4, 0.55]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.9, 0]} material={M.lacquer}>
        <boxGeometry args={[3.4, 0.7, 0.2]} />
      </mesh>
      <mesh position={[0, 3.9, 0.11]} material={M.goldBright}>
        <boxGeometry args={[2.6, 0.36, 0.02]} />
      </mesh>
      <Roof width={5.6} depth={2.4} height={1.1} position={[0, 4.6, 0]} pearl />
      {[-1, 1].map((s) => (
        <Roof key={s} width={3.6} depth={1.9} height={0.8} position={[s * 3.8, 3.4, 0]} ridge={false} />
      ))}
    </group>
  );
}

export function Lanterns() {
  return (
    <group>
      {LANTERN_POSITIONS.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.8, 0]} material={M.stoneDark} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.6, 8]} />
          </mesh>
          <mesh position={[0, 1.85, 0]} material={M.lanternRed}>
            <sphereGeometry args={[0.24, 14, 10]} />
          </mesh>
          <mesh position={[0, 2.12, 0]} material={M.goldBright}>
            <cylinderGeometry args={[0.1, 0.12, 0.06, 10]} />
          </mesh>
          <mesh position={[0, 1.58, 0]} material={M.goldBright}>
            <cylinderGeometry args={[0.12, 0.1, 0.06, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Trees({ detail }: { detail: number }) {
  return (
    <group>
      {TREE_POSITIONS.map(([x, z, s]) => (
        <Tree key={`${x}${z}`} position={[x, 0, z]} scale={s} detail={detail} />
      ))}
      {/* Cây ngoài tường để tạo chiều sâu */}
      {[
        [-22, -10, 1.4],
        [-24, 6, 1.6],
        [-21, 26, 1.3],
        [22, -12, 1.5],
        [25, 8, 1.7],
        [21, 28, 1.3],
        [-8, -24, 1.6],
        [9, -23, 1.5],
        [0, -27, 1.8],
      ].map(([x, z, s]) => (
        <Tree key={`o${x}${z}`} position={[x, 0, z]} scale={s} detail={0} />
      ))}
    </group>
  );
}

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
