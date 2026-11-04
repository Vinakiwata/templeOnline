import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";

/** Tượng Phật Thích Ca ngồi kiết già trên tòa sen (dựng từ khối cơ bản). */
export function BuddhaStatue({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (halo.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.02;
      halo.current.scale.set(s, s, s);
    }
  });

  const outerPetals = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2);
  const innerPetals = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2 + 0.3);

  return (
    <group position={position} scale={scale}>
      {/* Tòa sen */}
      <mesh position={[0, 0.12, 0]} material={M.gold} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 0.8, 0.24, 28]} />
      </mesh>
      {outerPetals.map((a) => (
        <mesh
          key={`o${a}`}
          position={[Math.sin(a) * 0.86, 0.3, Math.cos(a) * 0.86]}
          rotation={[-0.55, a, 0, "YXZ"]}
          scale={[0.24, 0.13, 0.38]}
          material={M.gold}
          castShadow
        >
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      ))}
      {innerPetals.map((a) => (
        <mesh
          key={`i${a}`}
          position={[Math.sin(a) * 0.6, 0.42, Math.cos(a) * 0.6]}
          rotation={[-0.8, a, 0, "YXZ"]}
          scale={[0.2, 0.11, 0.3]}
          material={M.goldBright}
        >
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>
      ))}
      {/* Chân kiết già */}
      <mesh position={[0, 0.62, 0.05]} scale={[0.82, 0.26, 0.58]} material={M.gold} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {/* Thân */}
      <mesh position={[0, 1.1, -0.02]} scale={[0.46, 0.6, 0.34]} material={M.gold} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
      {/* Vai */}
      <mesh position={[0, 1.42, -0.02]} scale={[0.52, 0.18, 0.3]} material={M.gold} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      {/* Tay kết ấn thiền */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.36, 1.0, 0.18]}
          rotation={[0.2, 0, s * 0.5]}
          scale={[0.12, 0.34, 0.12]}
          material={M.gold}
        >
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 0.36]} scale={[0.2, 0.07, 0.12]} material={M.goldBright}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      {/* Cổ & đầu */}
      <mesh position={[0, 1.6, 0]} material={M.gold}>
        <cylinderGeometry args={[0.1, 0.12, 0.14, 14]} />
      </mesh>
      <mesh position={[0, 1.82, 0.02]} scale={[0.25, 0.29, 0.26]} material={M.gold} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
      <mesh position={[0, 2.1, 0]} material={M.gold}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.25, 1.76, 0]} scale={[0.045, 0.14, 0.07]} material={M.gold}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}
      {/* Hào quang */}
      <mesh ref={halo} position={[0, 1.85, -0.38]} material={M.halo}>
        <circleGeometry args={[0.62, 40]} />
      </mesh>
      <mesh position={[0, 1.85, -0.36]} material={M.goldBright}>
        <torusGeometry args={[0.62, 0.035, 8, 48]} />
      </mesh>
      <mesh position={[0, 1.25, -0.45]} material={M.gold}>
        <torusGeometry args={[1.25, 0.05, 8, 64, Math.PI]} />
      </mesh>
    </group>
  );
}

/** Đóa sen nhỏ (dùng cho ao sen và hoa dâng). */
export function LotusFlower({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const petals = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return (
    <group position={position} scale={scale}>
      {petals.map((a) => (
        <mesh
          key={a}
          position={[Math.sin(a) * 0.09, 0.08, Math.cos(a) * 0.09]}
          rotation={[0.45, a, 0, "YXZ"]}
          scale={[0.06, 0.12, 0.035]}
          material={M.lotusPink}
        >
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0]} material={M.lotusCenter}>
        <sphereGeometry args={[0.05, 8, 6]} />
      </mesh>
    </group>
  );
}
