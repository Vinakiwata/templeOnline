import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { Roof } from "./Roof";
import { BuddhaStatue, LotusFlower } from "./BuddhaStatue";
import { HALL, HALL_FRONT_COLUMNS_X, HALL_INNER_COLUMNS } from "../../domain/world";
import { useTempleStore } from "../../application/templeStore";

const FY = HALL.floorY;
const WALL_H = 5.0;

function Column({ x, z, height = WALL_H }: { x: number; z: number; height?: number }) {
  return (
    <group position={[x, FY, z]}>
      <mesh position={[0, 0.12, 0]} material={M.stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.24, 12]} />
      </mesh>
      <mesh position={[0, height / 2, 0]} material={M.lacquer} castShadow>
        <cylinderGeometry args={[0.24, 0.27, height, 14]} />
      </mesh>
      <mesh position={[0, height - 0.25, 0]} material={M.gold}>
        <cylinderGeometry args={[0.28, 0.25, 0.12, 14]} />
      </mesh>
    </group>
  );
}

function Candle({ x, z, y }: { x: number; z: number; y: number }) {
  const flame = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!flame.current) return;
    const t = clock.elapsedTime * 9 + x * 10;
    flame.current.scale.y = 1 + Math.sin(t) * 0.15 + Math.sin(t * 2.3) * 0.08;
  });
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.06, 0]} material={M.bronze}>
        <cylinderGeometry args={[0.1, 0.12, 0.12, 10]} />
      </mesh>
      <mesh position={[0, 0.32, 0]} material={M.candle}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 10]} />
      </mesh>
      <mesh ref={flame} position={[0, 0.58, 0]} material={M.flame}>
        <coneGeometry args={[0.035, 0.12, 8]} />
      </mesh>
    </group>
  );
}

function HallLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime;
    light.current.intensity = 26 + Math.sin(t * 7) * 1.2 + Math.sin(t * 13.3) * 0.8;
  });
  return <pointLight ref={light} position={[0, 3.2, -9.4]} color="#ffb565" distance={16} decay={2} intensity={26} />;
}

function OfferedFlowers() {
  const count = useTempleStore((s) => s.flowerCount);
  const shown = Math.min(count, 8);
  const slots: [number, number][] = [
    [-0.55, 0],
    [0.55, 0],
    [-0.85, -0.2],
    [0.85, -0.2],
    [-0.3, -0.25],
    [0.3, -0.25],
    [-1.1, 0.1],
    [1.1, 0.1],
  ];
  return (
    <group position={[0, FY + 0.95, -10.3]}>
      {slots.slice(0, shown).map(([x, z], i) => (
        <LotusFlower key={i} position={[x, 0, z]} scale={1.4} />
      ))}
    </group>
  );
}

function SutraShelf() {
  const books: { y: number; z: number; m: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      books.push({ y: 0.45 + row * 0.62, z: -1.05 + i * 0.32 + (row % 2) * 0.08, m: (i + row) % 4 });
    }
  }
  return (
    <group position={[-7.25, FY, -9]}>
      <mesh position={[0, 1.15, 0]} material={M.wood} castShadow receiveShadow>
        <boxGeometry args={[0.7, 2.3, 2.7]} />
      </mesh>
      {books.map((b, i) => (
        <mesh key={i} position={[0.3, b.y, b.z]} material={M.book[b.m]}>
          <boxGeometry args={[0.28, 0.42, 0.18]} />
        </mesh>
      ))}
      <mesh position={[0.36, 2.35, 0]} material={M.gold}>
        <boxGeometry args={[0.06, 0.14, 2.4]} />
      </mesh>
    </group>
  );
}

export function MainHall() {
  const zCenter = (HALL.minZ + HALL.maxZ) / 2; // -8
  return (
    <group>
      {/* Nền chánh điện */}
      <mesh position={[0, FY / 2, zCenter]} material={M.stone} castShadow receiveShadow>
        <boxGeometry args={[HALL.maxX - HALL.minX, FY, HALL.maxZ - HALL.minZ]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, FY + 0.004, -8.1]} material={M.floorTile} receiveShadow>
        <planeGeometry args={[15.4, 11.4]} />
      </mesh>
      {/* Bậc thềm */}
      <mesh position={[0, 0.12, -1.3]} material={M.stoneDark} receiveShadow castShadow>
        <boxGeometry args={[17, 0.24, 0.4]} />
      </mesh>
      <mesh position={[0, 0.06, -0.85]} material={M.stone} receiveShadow>
        <boxGeometry args={[17, 0.12, 0.5]} />
      </mesh>

      {/* Tường */}
      <mesh position={[0, FY + WALL_H / 2, -13.85]} material={M.ochreWall} castShadow receiveShadow userData={{ camBlock: true }}>
        <boxGeometry args={[16.4, WALL_H, 0.4]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 7.95, FY + WALL_H / 2, -8.15]}
          material={M.ochreWall}
          castShadow
          receiveShadow
          userData={{ camBlock: true }}
        >
          <boxGeometry args={[0.4, WALL_H, 11.5]} />
        </mesh>
      ))}
      {/* Cột */}
      {HALL_FRONT_COLUMNS_X.map((x) => (
        <Column key={`f${x}`} x={x} z={-2.6} />
      ))}
      {HALL_INNER_COLUMNS.map(([x, z]) => (
        <Column key={`i${x}${z}`} x={x} z={z} />
      ))}
      {/* Xà ngang mặt tiền + hoành phi */}
      <mesh position={[0, FY + WALL_H - 0.1, -2.6]} material={M.lacquerDark} castShadow>
        <boxGeometry args={[16.3, 0.5, 0.5]} />
      </mesh>
      <group position={[0, FY + 3.95, -2.3]}>
        <mesh material={M.gold}>
          <boxGeometry args={[3.2, 0.82, 0.06]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={M.lacquer}>
          <boxGeometry args={[3.0, 0.66, 0.04]} />
        </mesh>
        {[-0.9, -0.3, 0.3, 0.9].map((x) => (
          <mesh key={x} position={[x, 0, 0.07]} material={M.goldBright}>
            <boxGeometry args={[0.3, 0.36, 0.02]} />
          </mesh>
        ))}
      </group>
      {/* Phướn hai bên tượng */}
      {[-1, 1].map((s) => (
        <mesh key={`b${s}`} position={[s * 3.6, FY + 2.8, -13.6]} material={M.lacquer}>
          <boxGeometry args={[0.7, 3.6, 0.04]} />
        </mesh>
      ))}

      {/* Mái hai tầng */}
      <Roof width={20} depth={15.2} height={2.3} position={[0, FY + WALL_H, -8.1]} ridge={false} />
      <mesh position={[0, FY + WALL_H + 2.0, -8.1]} material={M.ochreWallDark} castShadow userData={{ camBlock: true }}>
        <boxGeometry args={[10, 1.4, 6.2]} />
      </mesh>
      <Roof width={13} depth={8.6} height={2.0} position={[0, FY + WALL_H + 2.65, -8.1]} pearl />

      {/* Bàn thờ */}
      <mesh position={[0, FY + 0.3, -12.3]} material={M.lacquer} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.6, 3.2]} />
      </mesh>
      <mesh position={[0, FY + 0.62, -10.72]} material={M.gold}>
        <boxGeometry args={[6.4, 0.06, 0.06]} />
      </mesh>
      <mesh position={[0, FY + 0.85, -12.6]} material={M.lacquerDark} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.5, 2.3]} />
      </mesh>
      <BuddhaStatue position={[0, FY + 1.1, -12.4]} scale={1.3} />

      {/* Hương án */}
      <mesh position={[0, FY + 0.46, -10.25]} material={M.lacquer} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.92, 1.0]} />
      </mesh>
      <mesh position={[0, FY + 0.94, -10.25]} material={M.gold}>
        <boxGeometry args={[3.0, 0.05, 1.08]} />
      </mesh>
      <group position={[0, FY + 0.97, -10.35]}>
        <mesh position={[0, 0.14, 0]} material={M.bronze}>
          <cylinderGeometry args={[0.2, 0.15, 0.28, 16]} />
        </mesh>
      </group>
      <Candle x={-1.25} z={-10.35} y={FY + 0.96} />
      <Candle x={1.25} z={-10.35} y={FY + 0.96} />
      <OfferedFlowers />
      <SutraShelf />
      <HallLight />
    </group>
  );
}
