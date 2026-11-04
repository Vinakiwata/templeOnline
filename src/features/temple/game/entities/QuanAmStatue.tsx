import { useMemo } from "react";
import * as THREE from "three";

/**
 * Tượng Bồ Tát Quán Thế Âm — đá trắng, dáng đứng trên tòa sen.
 * Theo mẫu tượng Quán Âm đá trắng phổ biến ở chùa Việt:
 *  - Toàn thân một màu trắng ngọc, không thếp vàng.
 *  - Búi tóc cao với mão, có hình Phật A Di Đà nhỏ phía trước.
 *  - Hai tay nâng tịnh bình trước ngực.
 *  - Y phục thướt tha, khăn choàng và dải lụa rủ dài hai bên.
 *  - Tòa sen hai tầng (sen ngửa, sen úp) trên bệ tròn viền hạt châu.
 * Dựng bằng hình học thủ tục; khi có model GLB thì thay component này.
 */

// ── Vật liệu đá trắng ──────────────────────────────────────────────────────
const stone = new THREE.MeshStandardMaterial({
  color: "#f7f6f2",
  roughness: 0.48,
  metalness: 0,
  emissive: "#57544d",
  emissiveIntensity: 0.28,
});
const stoneCloth = new THREE.MeshStandardMaterial({
  color: "#f9f8f4",
  roughness: 0.52,
  emissive: "#57544d",
  emissiveIntensity: 0.24,
  side: THREE.DoubleSide,
});
const stoneShade = new THREE.MeshStandardMaterial({
  color: "#e6e3dc",
  roughness: 0.55,
  emissive: "#57544d",
  emissiveIntensity: 0.18,
});
const faceLine = new THREE.MeshStandardMaterial({ color: "#9a958b", roughness: 0.7 });

type V3 = [number, number, number];
const v2 = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));

/** Khối thon nối hai điểm — cánh tay, dải lụa. `flat` < 1 để dẹt như vải. */
function Limb({
  from,
  to,
  r1,
  r2,
  flat = 1,
  material = stone,
}: {
  from: V3;
  to: V3;
  r1: number;
  r2: number;
  flat?: number;
  material?: THREE.Material;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: len };
  }, [from, to]);
  return (
    <group position={position} quaternion={quaternion}>
      <mesh scale={[1, 1, flat]} material={material} castShadow>
        <cylinderGeometry args={[r2, r1, length, 14]} />
      </mesh>
    </group>
  );
}

/**
 * Lathe có nếp vải: đẩy bán kính theo sin(góc · folds), biên độ thay đổi theo chiều cao.
 * Tạo nếp áo rủ tự nhiên thay vì khối trụ trơn.
 */
function useFoldedLathe(
  points: [number, number][],
  segments: number,
  folds: number,
  amp: (y: number) => number,
  phiStart = 0,
  phiLength = Math.PI * 2,
) {
  return useMemo(() => {
    const geo = new THREE.LatheGeometry(v2(points), segments, phiStart, phiLength);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-4) continue;
      const theta = Math.atan2(x, z);
      const k = 1 + amp(y) * Math.sin(theta * folds + y * 1.5);
      pos.setXYZ(i, x * k, y, z * k);
    }
    geo.computeVertexNormals();
    return geo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Dải lụa mềm theo đường cong. */
function Drape({ points, radius = 0.026, flat = 0.4 }: { points: V3[]; radius?: number; flat?: number }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 48, radius, 10, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <mesh geometry={geo} scale={[1, 1, 1]} material={stoneCloth} castShadow userData={{ flat }} />;
}

// Vạt áo trong: thon, eo cao, gấu loe phủ lên tòa sen.
const ROBE: [number, number][] = [
  [0.0, 0.0],
  [0.34, 0.0],
  [0.345, 0.02],
  [0.31, 0.07],
  [0.28, 0.3],
  [0.255, 0.6],
  [0.23, 0.9],
  [0.195, 1.12],
  [0.19, 1.25],
  [0.198, 1.38],
  [0.192, 1.5],
  [0.165, 1.6],
  [0.115, 1.66],
  [0.045, 1.69],
  [0.0, 1.7],
];
// Áo khoác ngoài, mở phía trước.
const OVERROBE: [number, number][] = [
  [0.36, 0.03],
  [0.33, 0.2],
  [0.295, 0.55],
  [0.265, 0.9],
  [0.235, 1.15],
  [0.225, 1.35],
];
// Khăn choàng phủ vai, rủ tới khuỷu tay.
const CAPE: [number, number][] = [
  [0.232, 1.38],
  [0.238, 1.47],
  [0.205, 1.56],
  [0.14, 1.64],
  [0.07, 1.69],
];
// Ống tay rộng rủ xuống (gốc ở dưới).
const SLEEVE: [number, number][] = [
  [0.0, 0.0],
  [0.04, 0.0],
  [0.085, 0.035],
  [0.11, 0.11],
  [0.108, 0.24],
  [0.085, 0.38],
  [0.05, 0.5],
];
// Tịnh bình.
const VASE = v2([
  [0.0, 0.0],
  [0.035, 0.0],
  [0.055, 0.04],
  [0.06, 0.085],
  [0.04, 0.13],
  [0.018, 0.17],
  [0.016, 0.2],
  [0.026, 0.215],
  [0.0, 0.22],
]);

// ── Bệ và tòa sen ──────────────────────────────────────────────────────────
function petalRing(count: number, radius: number, y: number, tilt: number, scale: V3, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + offset;
    return (
      <mesh
        key={`${radius}-${i}`}
        position={[Math.sin(a) * radius, y, Math.cos(a) * radius]}
        rotation={[tilt, a, 0, "YXZ"]}
        scale={scale}
        material={stone}
        castShadow
      >
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
    );
  });
}

function LotusPedestal() {
  const beads = Array.from({ length: 40 }, (_, i) => (i / 40) * Math.PI * 2);
  return (
    <group>
      {/* Bệ tròn */}
      <mesh position={[0, 0.11, 0]} material={stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.92, 0.96, 0.22, 48]} />
      </mesh>
      {beads.map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.84, 0.27, Math.cos(a) * 0.84]} material={stone}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, 0]} material={stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.82, 0.24, 48]} />
      </mesh>
      <mesh position={[0, 0.54, 0]} material={stoneShade}>
        <cylinderGeometry args={[0.84, 0.8, 0.05, 48]} />
      </mesh>
      {/* Sen úp */}
      {petalRing(18, 0.74, 0.64, 0.55, [0.19, 0.1, 0.3])}
      {/* Sen ngửa: hai lớp cánh */}
      {petalRing(16, 0.66, 0.86, -0.75, [0.19, 0.12, 0.32], 0.1)}
      {petalRing(12, 0.47, 0.98, -1.05, [0.16, 0.1, 0.26], 0.35)}
      <mesh position={[0, 0.99, 0]} material={stone}>
        <cylinderGeometry args={[0.42, 0.4, 0.06, 32]} />
      </mesh>
    </group>
  );
}

// ── Đầu, búi tóc, mão ──────────────────────────────────────────────────────
function Head() {
  return (
    <group position={[0, 1.86, 0.01]} rotation-x={0.1}>
      <mesh scale={[0.88, 1.2, 0.95]} material={stone} castShadow>
        <sphereGeometry args={[0.1, 32, 24]} />
      </mesh>
      {/* Tóc */}
      <mesh position={[0, 0.012, -0.006]} rotation-x={-0.3} scale={[0.92, 1.2, 0.98]} material={stoneShade}>
        <sphereGeometry args={[0.103, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
      </mesh>
      {/* Mắt khép nhìn xuống, mũi, môi, bạch hào */}
      {[-1, 1].map((sx) => (
        <mesh
          key={sx}
          position={[sx * 0.03, 0.01, 0.094]}
          rotation={[0, sx * 0.32, sx * -0.18]}
          scale={[0.016, 0.003, 0.005]}
          material={faceLine}
        >
          <sphereGeometry args={[1, 12, 6]} />
        </mesh>
      ))}
      <mesh position={[0, -0.012, 0.098]} rotation-x={0.25} material={stoneShade}>
        <coneGeometry args={[0.009, 0.034, 8]} />
      </mesh>
      <mesh position={[0, -0.042, 0.09]} scale={[0.015, 0.005, 0.006]} material={faceLine}>
        <sphereGeometry args={[1, 10, 6]} />
      </mesh>
      <mesh position={[0, 0.044, 0.09]} material={stoneShade}>
        <sphereGeometry args={[0.005, 8, 6]} />
      </mesh>
      {/* Tai dài */}
      {[-1, 1].map((sx) => (
        <mesh key={`ear${sx}`} position={[sx * 0.086, -0.008, 0]} scale={[0.012, 0.042, 0.02]} material={stone}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}
      {/* Búi tóc cao nhiều tầng */}
      <mesh position={[0, 0.15, -0.01]} material={stoneShade} castShadow>
        <cylinderGeometry args={[0.05, 0.072, 0.12, 20]} />
      </mesh>
      <mesh position={[0, 0.235, -0.01]} scale={[1, 0.85, 1]} material={stoneShade} castShadow>
        <sphereGeometry args={[0.062, 18, 14]} />
      </mesh>
      <mesh position={[0, 0.3, -0.01]} scale={[1, 0.85, 1]} material={stoneShade}>
        <sphereGeometry args={[0.042, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.355, -0.01]} material={stoneShade}>
        <coneGeometry args={[0.025, 0.07, 12]} />
      </mesh>
      {/* Vành mão */}
      <mesh position={[0, 0.065, 0]} rotation-x={Math.PI / 2 - 0.08} scale={[0.9, 1, 1]} material={stone}>
        <torusGeometry args={[0.1, 0.01, 8, 40]} />
      </mesh>
      {/* Lá mão giữa có Phật A Di Đà, hai lá bên */}
      <group position={[0, 0.145, 0.07]} rotation-x={-0.15}>
        <mesh scale={[0.05, 0.08, 0.012]} material={stone} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <mesh position={[0, -0.016, 0.012]} scale={[1.2, 0.6, 0.6]} material={stoneShade}>
          <sphereGeometry args={[0.014, 10, 8]} />
        </mesh>
        <mesh position={[0, 0.003, 0.012]} scale={[0.8, 1.1, 0.6]} material={stoneShade}>
          <sphereGeometry args={[0.011, 10, 8]} />
        </mesh>
        <mesh position={[0, 0.021, 0.012]} material={stoneShade}>
          <sphereGeometry args={[0.007, 8, 6]} />
        </mesh>
      </group>
      {[-1, 1].map((sx) => (
        <mesh
          key={`leaf${sx}`}
          position={[sx * 0.065, 0.11, 0.05]}
          rotation={[-0.2, sx * 0.6, sx * 0.3]}
          scale={[0.032, 0.05, 0.009]}
          material={stone}
        >
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Figure() {
  const robe = useFoldedLathe(ROBE, 72, 9, (y) => (y < 1.1 ? 0.055 * (1 - y / 1.15) + 0.008 : 0.006));
  const overrobe = useFoldedLathe(OVERROBE, 64, 7, (y) => 0.045 * (1 - y / 1.4) + 0.01, Math.PI * 0.28, Math.PI * 1.44);
  const cape = useFoldedLathe(CAPE, 64, 11, (y) => (y < 1.5 ? 0.03 : 0.008), Math.PI * 0.2, Math.PI * 1.6);
  const sleeve = useFoldedLathe(SLEEVE, 40, 6, (y) => 0.09 * (1 - y / 0.55));

  return (
    <group>
      {/* Y phục: vạt trong, áo ngoài, khăn choàng vai */}
      <mesh geometry={robe} scale={[1, 1, 0.8]} material={stone} castShadow receiveShadow />
      <mesh geometry={overrobe} scale={[1, 1, 0.82]} material={stoneCloth} castShadow />
      <mesh geometry={cape} scale={[1, 1, 0.82]} material={stoneCloth} castShadow />
      {/* Đai lưng & dải lụa rủ giữa */}
      <mesh position={[0, 1.12, 0]} scale={[1, 1, 0.8]} rotation-x={Math.PI / 2} material={stoneShade}>
        <torusGeometry args={[0.2, 0.014, 8, 36]} />
      </mesh>
      <Limb from={[0.0, 1.1, 0.16]} to={[0.03, 0.1, 0.27]} r1={0.026} r2={0.04} flat={0.35} material={stoneShade} />
      {/* Dải lụa vắt chữ U trước thân */}
      <Drape points={[[-0.26, 1.08, 0.08], [-0.16, 0.8, 0.22], [0, 0.66, 0.26], [0.16, 0.8, 0.22], [0.26, 1.08, 0.08]]} />
      <Drape points={[[-0.29, 0.78, 0.09], [-0.18, 0.46, 0.25], [0, 0.36, 0.29], [0.18, 0.46, 0.25], [0.29, 0.78, 0.09]]} />
      {/* Chuỗi ngọc trên ngực */}
      <mesh position={[0, 1.5, 0.155]} scale={[1, 1.2, 0.6]} material={stoneShade}>
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>
      <Drape points={[[-0.11, 1.64, 0.08], [-0.06, 1.55, 0.145], [0, 1.52, 0.158], [0.06, 1.55, 0.145], [0.11, 1.64, 0.08]]} radius={0.007} />

      {/* Cổ, đầu, tóc rủ sau vai */}
      <mesh position={[0, 1.73, 0]} material={stone}>
        <cylinderGeometry args={[0.036, 0.045, 0.11, 12]} />
      </mesh>
      <Head />
      {[-1, 1].map((sx) => (
        <Limb key={`hair${sx}`} from={[sx * 0.055, 1.85, -0.06]} to={[sx * 0.12, 1.6, -0.09]} r1={0.035} r2={0.03} flat={0.5} material={stoneShade} />
      ))}

      {/* Tay: cẳng tay đưa vào giữa ngực, tay phải trên, tay trái đỡ bình */}
      {[-1, 1].map((sx) => (
        <group key={`arm${sx}`}>
          <Limb from={[sx * 0.2, 1.6, 0]} to={[sx * 0.25, 1.3, 0.07]} r1={0.058} r2={0.05} material={stoneCloth} />
          <Limb from={[sx * 0.24, 1.3, 0.08]} to={[sx * 0.06, sx < 0 ? 1.42 : 1.3, 0.2]} r1={0.05} r2={0.036} material={stoneCloth} />
          {/* Ống tay rộng rủ xuống tới gối */}
          <mesh geometry={sleeve} position={[sx * 0.255, 0.76, 0.06]} rotation={[0.08, 0, sx * -0.1]} scale={[0.95, 1.1, 0.5]} material={stoneCloth} castShadow />
        </group>
      ))}
      <mesh position={[-0.05, 1.43, 0.215]} scale={[0.9, 0.7, 1.1]} material={stone}>
        <sphereGeometry args={[0.032, 12, 10]} />
      </mesh>
      <mesh position={[0.05, 1.28, 0.22]} scale={[1.1, 0.6, 1.1]} material={stone}>
        <sphereGeometry args={[0.034, 12, 10]} />
      </mesh>
      <mesh position={[0.01, 1.28, 0.225]} scale={0.9} material={stone} castShadow>
        <latheGeometry args={[VASE, 24]} />
      </mesh>
    </group>
  );
}

export function QuanAmStatue({
  position = [10, 0, 14],
  rotationY = -0.35,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <LotusPedestal />
      <group position={[0, 1.02, 0]} scale={1.32}>
        <Figure />
      </group>
    </group>
  );
}
