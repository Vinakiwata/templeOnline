import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { M } from "./materials";

/**
 * Tượng Phật ngồi kiết già — dựng theo các tướng hảo truyền thống của tượng Phật Việt:
 *  - Nhục kế (u trên đỉnh đầu), tóc xoắn ốc màu xanh đen, minh châu trước nhục kế.
 *  - Bạch hào giữa hai chân mày, mắt khép hờ nhìn xuống, miệng thoáng mỉm cười.
 *  - Tai dài chấm cằm, cổ ba ngấn (tam đạo), vai rộng tròn đầy.
 *  - Y cà sa vắt vai trái, chữ Vạn trên ngực.
 *  - Ấn thiền (hai tay chồng nhau trên lòng) hoặc ấn xúc địa (tay phải chạm đất).
 *  - Tòa sen nhiều tầng cánh nhọn, hào quang đầu viền lửa, hào quang thân hình lá bồ đề.
 *
 * Hình học dùng chung ở cấp module; cánh sen và lọn tóc dùng InstancedMesh để ít draw-call.
 */

type V3 = [number, number, number];
export type Mudra = "thien" | "xuc_dia";
export type Aureole = "full" | "head" | "none";

// ── Vật liệu ────────────────────────────────────────────────────────────────
const gilt = new THREE.MeshStandardMaterial({
  color: "#dcab4c",
  roughness: 0.3,
  metalness: 0.5,
  emissive: "#4d3207",
  emissiveIntensity: 0.6,
});
const giltSide = gilt.clone();
giltSide.side = THREE.DoubleSide;
const giltBright = new THREE.MeshStandardMaterial({
  color: "#f3cb6a",
  roughness: 0.28,
  metalness: 0.45,
  emissive: "#6e4a0a",
  emissiveIntensity: 0.75,
  side: THREE.DoubleSide,
});
const giltShade = new THREE.MeshStandardMaterial({ color: "#6e4614", roughness: 0.55, metalness: 0.3 });
const lapis = new THREE.MeshStandardMaterial({
  color: "#2a3550",
  roughness: 0.42,
  metalness: 0.25,
  emissive: "#0c1222",
  emissiveIntensity: 0.4,
});
const jewel = new THREE.MeshStandardMaterial({
  color: "#d0402c",
  roughness: 0.2,
  metalness: 0.3,
  emissive: "#5c120a",
  emissiveIntensity: 0.7,
});
const mandorlaInner = new THREE.MeshStandardMaterial({
  color: "#8c2a1f",
  roughness: 0.5,
  emissive: "#2a0804",
  emissiveIntensity: 0.4,
});

// ── Hình học dùng chung (tạo một lần) ───────────────────────────────────────
const lazy = <T,>(make: () => T) => {
  let v: T | null = null;
  return () => (v ??= make());
};

/** Cánh sen nhọn, hơi cong ra ngoài (trục +z). Gốc ở y=0, ngọn ở y≈1.3. */
const petalGeo = lazy(() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.42, 0.02, 0.6, 0.62, 0.0, 1.3);
  s.bezierCurveTo(-0.6, 0.62, -0.42, 0.02, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
    curveSegments: 14,
  });
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    // Lòng cánh võng, ngọn cong ra ngoài
    p.setZ(i, p.getZ(i) + 0.2 * y * y - 0.28 * x * x);
  }
  g.computeVertexNormals();
  return g;
});

/** Thân trên: lathe dẹt trước-sau, có nếp y rất nhẹ. */
const torsoGeo = lazy(() => {
  const pts = [
    [0, 0.08],
    [0.27, 0.08],
    [0.295, 0.18],
    [0.275, 0.34],
    [0.282, 0.5],
    [0.302, 0.63],
    [0.318, 0.72],
    [0.3, 0.79],
    [0.22, 0.845],
    [0.1, 0.87],
    [0, 0.875],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 48);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const th = Math.atan2(x, z);
    const k = 1 + (y < 0.6 ? 0.012 * Math.sin(th * 13 + y * 6) : 0);
    p.setXYZ(i, x * k, y, z * k * 0.66);
  }
  g.computeVertexNormals();
  return g;
});

/** Vạt y phủ xuống mặt trước tòa sen. */
const hemGeo = lazy(() => {
  const pts = [
    [0.46, 0.06],
    [0.48, 0.0],
    [0.5, -0.07],
    [0.53, -0.13],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 28, -0.95, 1.9);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const th = Math.atan2(x, z);
    const k = 1 + 0.06 * Math.sin(th * 9) * Math.max(0, -y) * 6;
    // Mép dưới lượn sóng
    p.setXYZ(i, x * k, y - (y < -0.1 ? 0.03 * Math.cos(th * 9) : 0), z * k * 0.8);
  }
  g.computeVertexNormals();
  return g;
});

/** Hào quang thân hình lá bồ đề (đáy phẳng, ngọn nhọn). */
const LEAF_H = 2.05;
const leafShape = (w: number, h: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w * 0.78, 0);
  s.lineTo(w * 0.78, 0);
  s.bezierCurveTo(w * 1.08, h * 0.32, w * 1.0, h * 0.58, w * 0.52, h * 0.8);
  s.bezierCurveTo(w * 0.24, h * 0.9, w * 0.06, h * 0.95, 0, h);
  s.bezierCurveTo(-w * 0.06, h * 0.95, -w * 0.24, h * 0.9, -w * 0.52, h * 0.8);
  s.bezierCurveTo(-w * 1.0, h * 0.58, -w * 1.08, h * 0.32, -w * 0.78, 0);
  return s;
};
const mandorlaGeo = lazy(
  () => new THREE.ExtrudeGeometry(leafShape(0.74, LEAF_H), { depth: 0.04, bevelEnabled: false, curveSegments: 24 }),
);
const mandorlaInnerGeo = lazy(() => new THREE.ShapeGeometry(leafShape(0.6, LEAF_H - 0.2), 24));
/** Ngọn lửa viền hào quang: các điểm dọc theo mép lá. */
const flamePoints = lazy(() => {
  const pts = leafShape(0.74, LEAF_H).getSpacedPoints(46);
  const out: { x: number; y: number; a: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    if (p.y < 0.08) continue; // không đặt lửa ở cạnh đáy
    const q = pts[i + 1];
    const tx = q.x - p.x;
    const ty = q.y - p.y;
    // pháp tuyến hướng ra ngoài (đường viền đi ngược chiều kim đồng hồ)
    out.push({ x: p.x, y: p.y, a: Math.atan2(-tx, ty) });
  }
  return out;
});

/** Lọn tóc xoắn ốc trên mặt cầu đầu (toạ độ chuẩn hoá theo đầu). */
const curlPoints = lazy(() => {
  const out: V3[] = [];
  const n = 560;
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * ga;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    // Chân tóc: cao ở trán, thấp dần ra sau gáy
    const hairline = 0.3 + 0.18 * Math.max(0, z) - 0.55 * Math.max(0, -z);
    if (y > hairline && Math.abs(x) < 0.97) out.push([x, y, z]);
  }
  return out;
});

// ── Thành phần phụ ──────────────────────────────────────────────────────────
function Limb({ from, to, r1, r2, material = gilt }: { from: V3; to: V3; r1: number; r2: number; material?: THREE.Material }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const d = new THREE.Vector3().subVectors(b, a);
    const l = d.length();
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
      len: l,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <group position={pos} quaternion={quat}>
      <mesh material={material} castShadow>
        <cylinderGeometry args={[r2, r1, len, 16]} />
      </mesh>
      <mesh position={[0, len / 2, 0]} material={material}>
        <sphereGeometry args={[r2, 14, 10]} />
      </mesh>
      <mesh position={[0, -len / 2, 0]} material={material}>
        <sphereGeometry args={[r1, 14, 10]} />
      </mesh>
    </group>
  );
}

/** Dải viền y theo đường cong (ống dẹt). */
function Band({ points, radius = 0.018, material = gilt }: { points: V3[]; radius?: number; material?: THREE.Material }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 40, radius, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <mesh geometry={geo} material={material} castShadow />;
}

/** Cung tròn mảnh (lông mày, mí mắt, khoé môi). `up` = cung vồng lên. */
function Arc({
  at,
  radius,
  arc,
  tube = 0.004,
  up = true,
  rotY = 0,
  material = giltShade,
}: {
  at: V3;
  radius: number;
  arc: number;
  tube?: number;
  up?: boolean;
  rotY?: number;
  material?: THREE.Material;
}) {
  // Đặt tâm cung sao cho đỉnh cung nằm đúng `at`
  const cy = up ? -radius : radius;
  const rz = (up ? Math.PI / 2 : -Math.PI / 2) - arc / 2;
  return (
    <group position={at} rotation-y={rotY}>
      <mesh position={[0, cy, 0]} rotation-z={rz} material={material}>
        <torusGeometry args={[radius, tube, 6, 20, arc]} />
      </mesh>
    </group>
  );
}

/** Vòng cánh sen dạng instanced. */
function PetalRing({
  count,
  radius,
  y,
  tilt,
  size,
  offset = 0,
  down = false,
  material = giltSide,
}: {
  count: number;
  radius: number;
  y: number;
  tilt: number;
  size: [number, number];
  offset?: number;
  down?: boolean;
  material?: THREE.Material;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + offset;
      o.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
      o.rotation.set(down ? Math.PI - tilt : tilt, a, 0, "YXZ");
      o.scale.set(size[0], size[1], size[0] * (down ? -1 : 1));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, radius, y, tilt, size, offset, down]);
  return <instancedMesh ref={ref} args={[undefined, undefined, count]} geometry={petalGeo()} material={material} castShadow />;
}

/** Chuỗi hạt quanh bệ. */
function BeadRing({ count, radius, y, r }: { count: number; radius: number; y: number; r: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      o.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
      o.scale.setScalar(r);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, radius, y, r]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={giltBright}>
      <sphereGeometry args={[1, 8, 6]} />
    </instancedMesh>
  );
}

// ── Đầu ─────────────────────────────────────────────────────────────────────
/**
 * Mặt tròn đầy (mặt trăng rằm): nở nhẹ ở vùng má – hàm dưới, cằm tròn đầy,
 * chuyển tiếp mềm, không có khối lồi riêng.
 */
const faceGeo = lazy(() => {
  const g = new THREE.SphereGeometry(1, 48, 36);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    // Má đầy: nở ngang mềm quanh y ≈ -0.3
    const cheek = 0.1 * Math.exp(-(((y + 0.3) / 0.38) ** 2));
    // Cằm tròn: nhô nhẹ ra trước ở nửa dưới phía trước
    const chin = z > 0 ? 0.06 * Math.exp(-(((y + 0.72) / 0.25) ** 2)) * z : 0;
    p.setXYZ(i, x * (1 + cheek), y, z * (1 + cheek * 0.5) + chin);
  }
  g.computeVertexNormals();
  return g;
});

const HEAD_R: V3 = [0.142, 0.165, 0.142];

function Curls() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pts = curlPoints();
  // Lọn tóc trên nhục kế
  const top = useMemo(() => {
    const out: V3[] = [];
    const n = 120;
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 1.3;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      out.push([Math.cos(i * ga) * r, y, Math.sin(i * ga) * r]);
    }
    return out;
  }, []);
  const count = pts.length + top.length;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let k = 0;
    for (const [x, y, z] of pts) {
      o.position.set(x * HEAD_R[0] * 1.03, y * HEAD_R[1] * 1.03 + 0.004, z * HEAD_R[2] * 1.03 - 0.004);
      o.scale.setScalar(0.0142);
      o.updateMatrix();
      m.setMatrixAt(k++, o.matrix);
    }
    for (const [x, y, z] of top) {
      o.position.set(x * 0.084, 0.165 + y * 0.074, z * 0.084 - 0.012);
      o.scale.setScalar(0.0128);
      o.updateMatrix();
      m.setMatrixAt(k++, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [pts, top]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={lapis}>
      <sphereGeometry args={[1, 7, 5]} />
    </instancedMesh>
  );
}

function BuddhaHead() {
  return (
    <group position={[0, 1.06, 0.015]} rotation-x={0.1}>
      {/* Khuôn mặt phúc hậu: một khối liền, má đầy và cằm tròn */}
      <mesh geometry={faceGeo()} scale={HEAD_R} material={gilt} castShadow />
      {/* Nền tóc xanh đen + lọn tóc xoắn */}
      <mesh position={[0, 0.004, -0.004]} rotation-x={-0.42} scale={[HEAD_R[0] * 1.01, HEAD_R[1] * 1.0, HEAD_R[2] * 1.01]} material={lapis}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
      </mesh>
      <mesh position={[0, -0.03, -0.03]} scale={[HEAD_R[0] * 1.0, HEAD_R[1] * 0.92, HEAD_R[2] * 0.95]} material={lapis}>
        <sphereGeometry args={[1, 28, 14, Math.PI * 1.12, Math.PI * 0.76, 0.2, Math.PI * 0.46]} />
      </mesh>
      {/* Nhục kế */}
      <mesh position={[0, 0.165, -0.012]} scale={[1, 0.88, 1]} material={lapis} castShadow>
        <sphereGeometry args={[0.082, 24, 16]} />
      </mesh>
      <Curls />
      {/* Minh châu trước nhục kế và trên đỉnh */}
      <mesh position={[0, 0.125, 0.112]} material={jewel}>
        <sphereGeometry args={[0.02, 14, 10]} />
      </mesh>
      <mesh position={[0, 0.125, 0.104]} rotation-x={Math.PI / 2 - 0.5} material={giltBright}>
        <torusGeometry args={[0.022, 0.005, 6, 18]} />
      </mesh>
      <mesh position={[0, 0.245, -0.012]} material={giltBright}>
        <sphereGeometry args={[0.016, 12, 8]} />
      </mesh>

      {/* Bạch hào */}
      <mesh position={[0, 0.032, 0.14]} material={giltBright}>
        <sphereGeometry args={[0.0085, 10, 8]} />
      </mesh>
      {/* Chân mày cong dài */}
      {[-1, 1].map((s) => (
        <Arc key={`br${s}`} at={[s * 0.05, 0.04, 0.128]} radius={0.06} arc={1.25} tube={0.0045} rotY={s * 0.42} />
      ))}
      {/* Mí mắt khép hờ nhìn xuống */}
      {[-1, 1].map((s) => (
        <group key={`ey${s}`}>
          <mesh position={[s * 0.049, 0.004, 0.124]} rotation-y={s * 0.36} scale={[0.03, 0.012, 0.014]} material={gilt}>
            <sphereGeometry args={[1, 14, 8]} />
          </mesh>
          <Arc at={[s * 0.049, -0.006, 0.136]} radius={0.034} arc={1.05} tube={0.0042} up={false} rotY={s * 0.36} />
        </group>
      ))}
      {/* Sống mũi thẳng, cánh mũi */}
      <mesh position={[0, -0.03, 0.138]} rotation-x={0.18} scale={[0.016, 0.044, 0.019]} material={gilt}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh position={[0, -0.066, 0.136]} scale={[0.028, 0.013, 0.018]} material={gilt}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
      {/* Môi: khoé môi thoáng cười */}
      <mesh position={[0, -0.094, 0.128]} scale={[0.028, 0.008, 0.012]} material={gilt}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
      <Arc at={[0, -0.1, 0.134]} radius={0.05} arc={0.75} tube={0.0032} up={false} />
      <mesh position={[0, -0.108, 0.124]} scale={[0.022, 0.009, 0.012]} material={gilt}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
      {/* Tai dài chấm cằm */}
      {[-1, 1].map((s) => (
        <group key={`ear${s}`} position={[s * 0.136, -0.03, -0.004]} rotation-y={s * 0.32}>
          <mesh scale={[0.02, 0.07, 0.042]} material={gilt} castShadow>
            <sphereGeometry args={[1, 14, 12]} />
          </mesh>
          <mesh position={[s * 0.004, -0.088, 0.004]} scale={[0.017, 0.052, 0.026]} material={gilt}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
          <mesh position={[s * 0.012, 0.0, 0.004]} scale={[0.006, 0.045, 0.024]} material={giltShade}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Chữ Vạn 卍 (hướng trái, chữ Vạn nhà Phật) ──────────────────────────────
function Van({ at, size }: { at: V3; size: number }) {
  const t = size * 0.16;
  const h = size / 2;
  const bars: [number, number, number, number][] = [
    [0, 0, t, size],
    [0, 0, size, t],
    // Đầu trên quặt trái, trái quặt xuống, dưới quặt phải, phải quặt lên
    [-h / 2, h, h, t],
    [-h, -h / 2, t, h],
    [h / 2, -h, h, t],
    [h, h / 2, t, h],
  ];
  return (
    <group position={at} rotation-x={-0.25}>
      {bars.map(([x, y, w, hh], i) => (
        <mesh key={i} position={[x, y, 0]} material={jewel}>
          <boxGeometry args={[w, hh, 0.006]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Thân ────────────────────────────────────────────────────────────────────
function Body({ mudra }: { mudra: Mudra }) {
  return (
    <group>
      {/* Chân kiết già phủ y */}
      <mesh position={[0, 0.12, 0.09]} scale={[0.53, 0.14, 0.33]} material={gilt} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 18]} />
      </mesh>
      <Limb from={[0.43, 0.1, 0.24]} to={[-0.16, 0.18, 0.2]} r1={0.085} r2={0.075} />
      <Limb from={[-0.43, 0.11, 0.25]} to={[0.16, 0.2, 0.22]} r1={0.085} r2={0.075} />
      {/* Hai bàn chân ngửa trên đùi */}
      <mesh position={[-0.24, 0.235, 0.2]} rotation={[0, 0.5, 0.1]} scale={[0.1, 0.035, 0.052]} material={gilt}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      <mesh position={[0.24, 0.245, 0.22]} rotation={[0, -0.5, -0.1]} scale={[0.1, 0.035, 0.052]} material={gilt}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      {/* Vạt y phủ trước tòa */}
      <mesh geometry={hemGeo()} position={[0, 0.02, 0.0]} material={giltSide} castShadow />

      {/* Thân trên */}
      <mesh geometry={torsoGeo()} position={[0, 0, -0.03]} material={gilt} castShadow />
      {/* Ngực đầy */}
      <mesh position={[0, 0.62, 0.1]} scale={[0.25, 0.12, 0.1]} material={gilt}>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      {/* Y cà sa vắt vai trái: mép y chéo ngực, vạt vai */}
      <Band
        points={[
          [-0.26, 0.82, -0.08],
          [-0.2, 0.78, 0.12],
          [-0.06, 0.62, 0.2],
          [0.12, 0.47, 0.19],
          [0.27, 0.4, 0.08],
        ]}
        radius={0.022}
      />
      <Band
        points={[
          [-0.3, 0.77, -0.1],
          [-0.34, 0.6, 0.02],
          [-0.33, 0.44, 0.12],
        ]}
        radius={0.03}
      />
      {/* Nếp y trên ngực trái */}
      {[0.05, 0.1].map((d, i) => (
        <Band
          key={i}
          points={[
            [-0.24, 0.72 - d, 0.1],
            [-0.1, 0.6 - d, 0.18],
            [0.06, 0.48 - d, 0.18],
          ]}
          radius={0.008}
        />
      ))}
      {/* Đai y trong ngang bụng */}
      <Band
        points={[
          [-0.24, 0.32, 0.12],
          [0, 0.3, 0.19],
          [0.24, 0.32, 0.12],
        ]}
        radius={0.012}
      />
      <Van at={[0.05, 0.6, 0.203]} size={0.05} />

      {/* Cổ ba ngấn */}
      <mesh position={[0, 0.9, -0.005]} material={gilt}>
        <cylinderGeometry args={[0.058, 0.07, 0.12, 20]} />
      </mesh>
      {[0.875, 0.9, 0.925].map((y) => (
        <mesh key={y} position={[0, y, -0.005]} rotation-x={Math.PI / 2} material={giltShade}>
          <torusGeometry args={[0.064 - (y - 0.875) * 0.15, 0.003, 4, 24]} />
        </mesh>
      ))}

      {/* Tay */}
      {/* Vai & cánh tay trên (tay trái phủ y dày hơn) */}
      <Limb from={[-0.28, 0.74, -0.03]} to={[-0.35, 0.44, 0.05]} r1={0.088} r2={0.08} />
      <Limb from={[0.28, 0.74, -0.03]} to={[0.34, 0.44, 0.05]} r1={0.078} r2={0.07} />
      {/* Vạt y rủ từ khuỷu tay trái */}
      <mesh position={[-0.37, 0.3, 0.09]} rotation={[0.1, 0, 0.08]} scale={[0.07, 0.16, 0.09]} material={gilt} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      {/* Cẳng tay trái về lòng */}
      <Limb from={[-0.35, 0.44, 0.05]} to={[-0.1, 0.27, 0.26]} r1={0.068} r2={0.05} />
      {mudra === "thien" ? (
        <>
          <Limb from={[0.34, 0.44, 0.05]} to={[0.1, 0.29, 0.26]} r1={0.062} r2={0.048} />
          {/* Hai bàn tay chồng nhau, ngửa, hai ngón cái chạm */}
          <mesh position={[0, 0.265, 0.27]} scale={[0.115, 0.026, 0.07]} material={gilt}>
            <sphereGeometry args={[1, 18, 10]} />
          </mesh>
          <mesh position={[0, 0.29, 0.275]} scale={[0.11, 0.024, 0.066]} material={gilt}>
            <sphereGeometry args={[1, 18, 10]} />
          </mesh>
          <mesh position={[0, 0.322, 0.29]} rotation-x={-0.2} material={gilt}>
            <torusGeometry args={[0.03, 0.011, 8, 16, Math.PI]} />
          </mesh>
        </>
      ) : (
        <>
          {/* Ấn xúc địa: tay trái ngửa trên lòng, tay phải úp trên gối chạm đất */}
          <mesh position={[-0.04, 0.27, 0.27]} scale={[0.11, 0.026, 0.068]} material={gilt}>
            <sphereGeometry args={[1, 18, 10]} />
          </mesh>
          <Limb from={[0.34, 0.44, 0.05]} to={[0.41, 0.16, 0.33]} r1={0.062} r2={0.046} />
          <mesh position={[0.42, 0.08, 0.4]} rotation={[0.3, 0, -0.1]} scale={[0.05, 0.1, 0.03]} material={gilt}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
        </>
      )}

      <BuddhaHead />
    </group>
  );
}

// ── Hào quang ───────────────────────────────────────────────────────────────
function HeadHalo({ z = -0.2, radius = 0.32 }: { z?: number; radius?: number }) {
  const flames = 18;
  return (
    <group position={[0, 1.08, z]}>
      <mesh material={M.halo}>
        <circleGeometry args={[radius, 40]} />
      </mesh>
      {[1, 0.78, 0.55].map((k) => (
        <mesh key={k} position={[0, 0, 0.005]} material={giltBright}>
          <torusGeometry args={[radius * k, 0.008 + 0.006 * k, 6, 56]} />
        </mesh>
      ))}
      {Array.from({ length: flames }, (_, i) => {
        const a = (i / flames) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * (radius + 0.035), Math.cos(a) * (radius + 0.035), 0]}
            rotation-z={-a}
            scale={[1, 1, 0.3]}
            material={giltBright}
          >
            <coneGeometry args={[0.028, 0.08, 6]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Mandorla() {
  const pts = flamePoints();
  return (
    <group position={[0, -0.02, -0.34]}>
      <mesh geometry={mandorlaGeo()} position={[0, 0, -0.04]} material={gilt} castShadow />
      <mesh geometry={mandorlaInnerGeo()} position={[0, 0.06, 0.003]} material={mandorlaInner} />
      {/* Đường chỉ vàng trong lòng hào quang */}
      {[0.5, 0.38].map((w, i) => (
        <mesh key={i} position={[0, 0.1 + i * 0.1, 0.006]} material={giltBright}>
          <shapeGeometry args={[leafShape(w, LEAF_H - 0.45 - i * 0.2), 18]} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0.01]} material={mandorlaInner}>
        <shapeGeometry args={[leafShape(0.48, LEAF_H - 0.55), 18]} />
      </mesh>
      {pts.map((p, i) => (
        <mesh
          key={i}
          position={[p.x + Math.cos(p.a) * 0.035, p.y + Math.sin(p.a) * 0.035, -0.02]}
          rotation-z={p.a - Math.PI / 2}
          scale={[1, 1, 0.35]}
          material={giltBright}
        >
          <coneGeometry args={[0.035, 0.11, 5]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Tòa sen & bệ Tu Di ──────────────────────────────────────────────────────
export const THRONE_H = 0.62;

function LotusThrone() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} material={gilt} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.7, 0.1, 40]} />
      </mesh>
      <BeadRing count={40} radius={0.63} y={0.12} r={0.026} />
      <mesh position={[0, 0.19, 0]} material={M.lacquer}>
        <cylinderGeometry args={[0.5, 0.56, 0.12, 40]} />
      </mesh>
      {/* Sen úp */}
      <PetalRing count={20} radius={0.56} y={0.3} tilt={0.55} size={[0.16, 0.13]} down />
      {/* Sen ngửa hai lớp, so le */}
      <PetalRing count={18} radius={0.58} y={0.33} tilt={0.4} size={[0.21, 0.2]} />
      <PetalRing count={14} radius={0.47} y={0.4} tilt={0.18} size={[0.19, 0.17]} offset={0.22} material={giltBright} />
      <mesh position={[0, THRONE_H - 0.03, 0]} material={gilt}>
        <cylinderGeometry args={[0.5, 0.46, 0.06, 40]} />
      </mesh>
    </group>
  );
}

/** Bệ Tu Di bát giác sơn son thếp vàng (đặt dưới tòa sen). */
export const SUMERU_H = 0.5;
function SumeruBase() {
  const tiers: [number, number, number, THREE.Material][] = [
    [0.84, 0.0, 0.1, gilt],
    [0.78, 0.1, 0.06, M.lacquerDark],
    [0.64, 0.16, 0.2, M.lacquer],
    [0.74, 0.36, 0.06, M.lacquerDark],
    [0.8, 0.42, 0.08, gilt],
  ];
  return (
    <group>
      {tiers.map(([r, y, h, mat], i) => (
        <mesh key={i} position={[0, y + h / 2, 0]} rotation-y={Math.PI / 8} material={mat} castShadow receiveShadow>
          <cylinderGeometry args={[r, r, h, 8]} />
        </mesh>
      ))}
      {/* Ô hộc thếp vàng trên thân bệ */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.6, 0.26, Math.cos(a) * 0.6]} rotation-y={a} material={giltBright}>
            <boxGeometry args={[0.3, 0.12, 0.012]} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Tượng hoàn chỉnh ────────────────────────────────────────────────────────
export function BuddhaFigure({
  position,
  scale = 1,
  rotationY = 0,
  mudra = "thien",
  aureole = "full",
  sumeru = false,
}: {
  position: V3;
  scale?: number;
  rotationY?: number;
  mudra?: Mudra;
  aureole?: Aureole;
  sumeru?: boolean;
}) {
  const lift = sumeru ? SUMERU_H : 0;
  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      {sumeru && <SumeruBase />}
      <group position={[0, lift, 0]}>
        <LotusThrone />
        <group position={[0, THRONE_H, 0]}>
          <Body mudra={mudra} />
          {aureole !== "none" && <HeadHalo z={aureole === "full" ? -0.27 : -0.2} />}
          {aureole === "full" && <Mandorla />}
        </group>
      </group>
    </group>
  );
}
