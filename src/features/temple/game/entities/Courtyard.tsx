import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { Roof } from "./Roof";
import { LotusFlower } from "./BuddhaStatue";
import { gameEvents } from "../systems/events";
import { useTempleStore } from "../../application/templeStore";
import { PLATEAU } from "../../domain/world";

type XZ = [number, number];

// ── Khói hương ─────────────────────────────────────────────────────────────
let smokeTexture: THREE.CanvasTexture | null = null;
function getSmokeTexture() {
  if (smokeTexture) return smokeTexture;
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
  smokeTexture = new THREE.CanvasTexture(canvas);
  smokeTexture.colorSpace = THREE.SRGBColorSpace;
  return smokeTexture;
}

export const INCENSE_DURATION_MS = 120_000;

export function Smoke({ count, origin, objectId }: { count: number; origin: [number, number, number]; objectId: string }) {
  const tex = useMemo(getSmokeTexture, []);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const litAt = useTempleStore((s) => s.incenseLit[objectId] ?? null);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);

  useFrame(({ clock }) => {
    const active = litAt !== null && Date.now() - litAt < INCENSE_DURATION_MS;
    const t0 = clock.elapsedTime * 0.22;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      s.visible = active;
      if (!active) return;
      const t = (t0 + offsets[i]) % 1;
      s.position.set(Math.sin(t * 7 + i) * 0.18 * t, t * 2.4, Math.cos(t * 5 + i) * 0.12 * t);
      const sc = 0.12 + t * 0.6;
      s.scale.set(sc, sc, sc);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin(t * Math.PI) * 0.32;
    });
  });

  return (
    <group position={origin}>
      {offsets.map((_, i) => (
        <sprite key={i} ref={(el) => (sprites.current[i] = el)} visible={false}>
          <spriteMaterial map={tex} color="#e9e4da" transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

export function IncenseSticks({ objectId, y }: { objectId: string; y: number }) {
  const litAt = useTempleStore((s) => s.incenseLit[objectId] ?? null);
  const sticks = useRef<THREE.Group>(null);
  useFrame(() => {
    if (sticks.current) sticks.current.visible = litAt !== null && Date.now() - litAt < INCENSE_DURATION_MS * 1.5;
  });
  return (
    <group ref={sticks} position={[0, y, 0]} visible={false}>
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
  );
}

/** Lư hương đồng lớn giữa sân. */
export function IncenseBurner({ position, smokeCount, objectId }: { position: XZ; smokeCount: number; objectId: string }) {
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
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
      {/* Nắp lư hình mái chùa */}
      <IncenseSticks objectId={objectId} y={1.3} />
      <Smoke count={smokeCount} origin={[0, 1.95, 0]} objectId={objectId} />
    </group>
  );
}

// ── Gác chuông ─────────────────────────────────────────────────────────────
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

function Pavilion({ children }: { children?: ReactNode }) {
  const posts: XZ[] = [
    [-1.8, -1.8],
    [1.8, -1.8],
    [-1.8, 1.8],
    [1.8, 1.8],
  ];
  return (
    <group>
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
      {/* Mái hai tầng */}
      <Roof width={5.8} depth={5.8} height={1.2} position={[0, 3.72, 0]} ridge={false} />
      <mesh position={[0, 4.75, 0]} material={M.ochreWallDark}>
        <boxGeometry args={[2.2, 0.6, 2.2]} />
      </mesh>
      <Roof width={3.4} depth={3.4} height={1.1} position={[0, 5.0, 0]} ridge={false} pearl />
      {children}
    </group>
  );
}

export function BellTower({ position }: { position: XZ }) {
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
      const back = since < 0.15 ? since / 0.15 : since < 1.2 ? 1 - (since - 0.15) / 1.05 : 0;
      striker.current.position.x = -1.25 - Math.max(0, back) * 0.25;
    }
  });

  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <Pavilion>
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
      </Pavilion>
    </group>
  );
}

// ── Gác trống ──────────────────────────────────────────────────────────────
export function DrumTower({ position }: { position: XZ }) {
  const drum = useRef<THREE.Group>(null);
  const beatAt = useRef<number | null>(null);
  const clockRef = useRef(0);
  useEffect(() => gameEvents.on("drum:beat", () => (beatAt.current = clockRef.current)), []);
  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
    const since = beatAt.current === null ? 99 : clock.elapsedTime - beatAt.current;
    if (drum.current) {
      const k = since < 0.4 ? Math.sin(since * 40) * 0.02 * (1 - since / 0.4) : 0;
      drum.current.scale.set(1 + k, 1 + k, 1);
    }
  });
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <Pavilion>
        {/* Giá trống */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.85, 0.95, 0]} material={M.lacquer} castShadow>
            <boxGeometry args={[0.14, 1.3, 0.5]} />
          </mesh>
        ))}
        <group ref={drum} position={[0, 1.35, 0]}>
          <mesh rotation-x={Math.PI / 2} material={M.lacquer} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 0.85, 24]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0, s * 0.43]} rotation-y={s < 0 ? Math.PI : 0} material={M.drumSkin}>
              <circleGeometry args={[0.66, 24]} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`r${s}`} position={[0, 0, s * 0.42]} material={M.goldBright}>
              <torusGeometry args={[0.68, 0.03, 6, 28]} />
            </mesh>
          ))}
        </group>
        {/* Dùi trống */}
        <mesh position={[0.35, 1.0, 0.75]} rotation={[0.6, 0, 0.3]} material={M.woodLight}>
          <cylinderGeometry args={[0.03, 0.04, 0.6, 6]} />
        </mesh>
      </Pavilion>
    </group>
  );
}

// ── Ao sen ─────────────────────────────────────────────────────────────────
export function LotusPond({ position, radius = 3.4 }: { position: XZ; radius?: number }) {
  const pads = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: Math.round(radius * 4) }, () => {
      const a = rnd() * Math.PI * 2;
      const r = 1.9 + rnd() * (radius - 2.3);
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.7 + rnd() * 0.5, flower: rnd() > 0.55 };
    });
  }, [radius]);
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <mesh position={[0, 0.16, 0]} rotation-x={Math.PI / 2} material={M.stone} castShadow receiveShadow>
        <torusGeometry args={[radius + 0.05, 0.22, 8, 64]} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation-x={-Math.PI / 2} material={M.water} receiveShadow>
        <circleGeometry args={[radius, 64]} />
      </mesh>
      {pads.map((p, i) => (
        <group key={i} position={[p.x, 0.1, p.z]}>
          <mesh material={M.lilyPad} scale={p.s}>
            <cylinderGeometry args={[0.32, 0.32, 0.02, 14, 1, false, 0.3, Math.PI * 1.85]} />
          </mesh>
          {p.flower && <LotusFlower position={[0, 0.01, 0]} scale={1.3} />}
        </group>
      ))}
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

export function BodhiTree({ position, detail = 1 }: { position: XZ; detail?: number }) {
  const clumps: [number, number, number, number][] = [
    [0, 5.2, 0, 2.6],
    [2.2, 4.6, 0.6, 1.9],
    [-2.3, 4.5, 0.3, 2.0],
    [0.6, 4.4, 2.0, 1.8],
    [-0.6, 4.6, -2.0, 1.9],
    [1.2, 6.2, -0.6, 1.6],
  ];
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
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

// ── Đèn lồng, cây phướn, tháp đá ───────────────────────────────────────────
export function Lantern({ x, z, y = PLATEAU }: { x: number; z: number; y?: number }) {
  return (
    <group position={[x, y, z]}>
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
  );
}

/** Cây phướn: cột cao treo dải phướn ngũ sắc. */
export function FlagPole({ position }: { position: XZ }) {
  const banner = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (banner.current) banner.current.rotation.y = Math.sin(clock.elapsedTime * 0.9 + position[0]) * 0.25;
  });
  const colors = [M.robeBlue, M.robeSaffron, M.robeRed, M.robeWhite, M.robeGreen];
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <mesh position={[0, 0.2, 0]} material={M.stone} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.4, 10]} />
      </mesh>
      <mesh position={[0, 4.4, 0]} material={M.wood} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 8.4, 8]} />
      </mesh>
      <mesh position={[0, 8.7, 0]} material={M.goldBright}>
        <coneGeometry args={[0.12, 0.4, 8]} />
      </mesh>
      <group ref={banner} position={[0, 6.3, 0]}>
        {colors.map((m, i) => (
          <mesh key={i} position={[0.06 + i * 0.12, -0.2 * i, 0]} material={m}>
            <boxGeometry args={[0.12, 3.4 - i * 0.2, 0.01]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Tháp đá nhỏ nhiều tầng trong sân. */
export function StoneStupa({ position, tiers = 5 }: { position: XZ; tiers?: number }) {
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <mesh position={[0, 0.25, 0]} material={M.stone} castShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
      </mesh>
      {Array.from({ length: tiers }, (_, i) => {
        const s = 1 - i * 0.14;
        const y = 0.5 + i * 0.55;
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh position={[0, 0.2, 0]} material={M.stoneDark} castShadow>
              <boxGeometry args={[0.8 * s, 0.4, 0.8 * s]} />
            </mesh>
            <mesh position={[0, 0.45, 0]} material={M.stone} castShadow>
              <boxGeometry args={[1.15 * s, 0.1, 1.15 * s]} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.5 + tiers * 0.55 + 0.25, 0]} material={M.stoneDark}>
        <coneGeometry args={[0.15, 0.5, 8]} />
      </mesh>
    </group>
  );
}

/** Bảo tháp 7 tầng: thân bát giác, mái cong mỗi tầng. */
export function BaoThap({ position }: { position: XZ }) {
  const tiers = 7;
  let y = 1.0;
  const levels = Array.from({ length: tiers }, (_, i) => {
    const s = 1 - i * 0.1;
    const h = 1.5 - i * 0.08;
    const level = { y, s, h };
    y += h + 0.25;
    return level;
  });
  return (
    <group position={[position[0], PLATEAU, position[1]]}>
      <mesh position={[0, 0.5, 0]} material={M.stone} castShadow receiveShadow>
        <cylinderGeometry args={[2.9, 3.1, 1.0, 8]} />
      </mesh>
      {levels.map((l, i) => (
        <group key={i} position={[0, l.y, 0]}>
          <mesh position={[0, l.h / 2, 0]} material={M.plaster} castShadow>
            <cylinderGeometry args={[1.5 * l.s, 1.6 * l.s, l.h, 8]} />
          </mesh>
          {/* Cửa vòm */}
          <mesh position={[0, l.h * 0.45, 1.52 * l.s]} material={M.lacquerDark}>
            <boxGeometry args={[0.45 * l.s, l.h * 0.55, 0.06]} />
          </mesh>
          <mesh position={[0, l.h + 0.08, 0]} material={M.roofTileDark} castShadow>
            <cylinderGeometry args={[1.75 * l.s, 2.25 * l.s, 0.3, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, y + 0.5, 0]} material={M.goldBright}>
        <coneGeometry args={[0.3, 1.2, 8]} />
      </mesh>
      <mesh position={[0, y + 1.2, 0]} material={M.goldBright}>
        <sphereGeometry args={[0.18, 10, 8]} />
      </mesh>
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
export { mulberry };
