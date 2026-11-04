import { useMemo } from "react";
import * as THREE from "three";
import { M } from "./materials";

/**
 * Bộ phận người dùng chung cho tượng thờ, chư Tăng, chú tiểu, phật tử và nhân vật người chơi.
 *  - Khuôn mặt vẽ bằng texture (mắt, mày, môi, má hồng) trên khối đầu — đẹp mà chỉ tốn 1 mesh.
 *  - Mũi và tai là khối nổi nhỏ để nhìn nghiêng vẫn có hình.
 *  - Áo giao lĩnh (cổ chéo), tay áo rộng, vạt áo có nếp, bàn tay có ngón cái.
 */

export type V3 = [number, number, number];
export type FaceKind =
  | "calm" // phật tử nam
  | "lady" // phật tử nữ
  | "monk" // thầy: mắt hiền, khép hờ
  | "elder" // thầy lớn tuổi / Tổ sư: mày bạc dài
  | "novice" // chú tiểu: mắt tròn, má hồng
  | "serene" // tượng Bồ Tát, thị giả
  | "arhat" // La Hán: mày rậm, cười hiền
  | "fierce" // Hộ pháp Kim Cương
  | "lord" // Đức Ông: nghiêm, ria mép
  | "mother"; // Thánh Mẫu

export type HairKind =
  | "none"
  | "monk"
  | "novice"
  | "hairM"
  | "hairF"
  | "nonLa"
  | "topknot"
  | "crown"
  | "helmet"
  | "hat"
  | "khanChau";

// ── Vật liệu phụ ─────────────────────────────────────────────────────────────
const stubble = new THREE.MeshStandardMaterial({ color: "#8f8378", roughness: 0.95 });
const hairMat = new THREE.MeshStandardMaterial({ color: "#221b16", roughness: 0.78, metalness: 0.02 });
const straw = new THREE.MeshStandardMaterial({ color: "#e2cf98", roughness: 0.85, side: THREE.DoubleSide });
const strawLine = new THREE.MeshStandardMaterial({ color: "#b49a5c", roughness: 0.9 });
const gold = M.goldBright;

const darkCache = new Map<string, THREE.Material>();
/** Biến thể tối hơn của một vật liệu (cổ áo, viền tay). */
export function darker(mat: THREE.Material, k = 0.7): THREE.Material {
  const key = `${mat.uuid}:${k}`;
  let m = darkCache.get(key);
  if (!m) {
    const c = (mat as THREE.MeshStandardMaterial).clone();
    c.color.multiplyScalar(k);
    darkCache.set(key, c);
    m = c;
  }
  return m;
}

// ── Texture khuôn mặt ────────────────────────────────────────────────────────
const W = 512;
const H = 256;
const CX = 128; // phía trước mặt (u = 0.25 trên SphereGeometry)
const EY = 134; // ngang mắt

function paintFace(kind: FaceKind, skin: string) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = skin;
  g.fillRect(0, 0, W, H);
  g.lineCap = "round";
  g.lineJoin = "round";

  const blush = (alpha: number, color = "232,120,120") => {
    for (const s of [-1, 1]) {
      const x = CX + s * 33;
      const y = EY + 22;
      const r = g.createRadialGradient(x, y, 1, x, y, 15);
      r.addColorStop(0, `rgba(${color},${alpha})`);
      r.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = r;
      g.beginPath();
      g.arc(x, y, 15, 0, Math.PI * 2);
      g.fill();
    }
  };
  const brows = (y: number, w: number, lift: number, color: string, thick: number, inner = 0) => {
    g.strokeStyle = color;
    g.lineWidth = thick;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(CX + s * (9 + inner), y + inner * 0.6);
      g.quadraticCurveTo(CX + s * (9 + w * 0.5), y - lift, CX + s * (9 + w), y + 2);
      g.stroke();
    }
  };
  const eyesOpen = (rx: number, ry: number, color = "#2a1d16", hi = true) => {
    for (const s of [-1, 1]) {
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(CX + s * 21, EY, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
      if (hi) {
        g.fillStyle = "rgba(255,255,255,0.9)";
        g.beginPath();
        g.arc(CX + s * 21 - rx * 0.35, EY - ry * 0.4, Math.max(1.2, rx * 0.32), 0, Math.PI * 2);
        g.fill();
      }
    }
  };
  /** Mắt khép hờ nhìn xuống: cung cong xuống, có mí trên. */
  const eyesCalm = (w: number, color = "#3a271c", lid = true) => {
    g.strokeStyle = color;
    g.lineWidth = 2.6;
    for (const s of [-1, 1]) {
      const x = CX + s * 21;
      g.beginPath();
      g.moveTo(x - w, EY - 1);
      g.quadraticCurveTo(x, EY + 5, x + w, EY - 1);
      g.stroke();
      if (lid) {
        g.lineWidth = 1.2;
        g.strokeStyle = "rgba(90,55,40,0.45)";
        g.beginPath();
        g.moveTo(x - w * 0.9, EY - 5);
        g.quadraticCurveTo(x, EY - 8, x + w * 0.9, EY - 5);
        g.stroke();
        g.lineWidth = 2.6;
        g.strokeStyle = color;
      }
    }
  };
  const smile = (y: number, w: number, depth: number, color = "#9a4a3a", thick = 2.2) => {
    g.strokeStyle = color;
    g.lineWidth = thick;
    g.beginPath();
    g.moveTo(CX - w, y);
    g.quadraticCurveTo(CX, y + depth, CX + w, y);
    g.stroke();
  };
  const lips = (y: number, w: number, color: string) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(CX - w, y);
    g.quadraticCurveTo(CX - w * 0.5, y - 4, CX, y - 1.5);
    g.quadraticCurveTo(CX + w * 0.5, y - 4, CX + w, y);
    g.quadraticCurveTo(CX, y + 6, CX - w, y);
    g.fill();
  };

  // Phóng to cụm nét mặt quanh tâm mặt cho dễ nhìn ở khoảng cách chơi game.
  g.save();
  g.translate(CX, EY + 4);
  g.scale(1.32, 1.32);
  g.translate(-CX, -EY);
  switch (kind) {
    case "calm":
      brows(EY - 15, 15, 3, "#2b211b", 3.2);
      eyesOpen(3.6, 4.4);
      smile(EY + 27, 8, 3);
      blush(0.12);
      break;
    case "lady":
      brows(EY - 16, 15, 5, "#3a2a20", 2.2);
      eyesOpen(3.8, 4.8);
      g.strokeStyle = "#2a1d16";
      g.lineWidth = 1.6;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(CX + s * 25, EY - 4);
        g.lineTo(CX + s * 29, EY - 7);
        g.stroke();
      }
      lips(EY + 27, 7, "#c4545a");
      blush(0.28);
      break;
    case "monk":
      brows(EY - 15, 15, 3, "#4a382c", 2.6);
      eyesCalm(7);
      smile(EY + 27, 7, 3);
      blush(0.08);
      break;
    case "elder":
      // Mày bạc dài rủ xuống, nếp trán
      g.strokeStyle = "#e8e2d6";
      g.lineWidth = 3.6;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(CX + s * 9, EY - 13);
        g.quadraticCurveTo(CX + s * 22, EY - 19, CX + s * 34, EY - 6);
        g.stroke();
      }
      g.strokeStyle = "rgba(120,80,60,0.35)";
      g.lineWidth = 1.2;
      for (const dy of [0, 6]) {
        g.beginPath();
        g.moveTo(CX - 16, EY - 30 - dy);
        g.quadraticCurveTo(CX, EY - 33 - dy, CX + 16, EY - 30 - dy);
        g.stroke();
      }
      eyesCalm(6.5);
      smile(EY + 27, 7, 3);
      break;
    case "novice":
      brows(EY - 15, 12, 4, "#3b2c22", 2.2);
      eyesOpen(4.6, 5.6);
      smile(EY + 26, 6, 5, "#a24c40", 2.4);
      blush(0.42);
      break;
    case "serene":
      brows(EY - 16, 17, 6, "#3b2a20", 2.2);
      eyesCalm(8, "#2a1d16");
      lips(EY + 27, 6, "#b8423c");
      // Bạch hào
      g.fillStyle = "#c0392b";
      g.beginPath();
      g.arc(CX, EY - 18, 2.4, 0, Math.PI * 2);
      g.fill();
      blush(0.16);
      break;
    case "arhat":
      brows(EY - 15, 17, 7, "#2b211b", 4.2);
      eyesCalm(7);
      smile(EY + 26, 10, 6, "#8a3e30", 2.6);
      blush(0.14);
      break;
    case "lord":
      brows(EY - 15, 17, -2, "#1d1612", 4.4, 2);
      eyesOpen(4.2, 4.6);
      // Ria mép
      g.strokeStyle = "#1d1612";
      g.lineWidth = 3.4;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(CX, EY + 27);
        g.quadraticCurveTo(CX + s * 10, EY + 25, CX + s * 17, EY + 34);
        g.stroke();
      }
      lips(EY + 35, 5, "#8a3a30");
      break;
    case "mother":
      brows(EY - 16, 16, 6, "#2a1d16", 2.2);
      eyesCalm(7.5, "#2a1d16");
      lips(EY + 27, 6.5, "#c2343a");
      blush(0.3);
      break;
    case "fierce": {
      // Mắt trợn: lòng trắng, con ngươi, viền đỏ; mày xếch dày; miệng gầm
      for (const s of [-1, 1]) {
        const x = CX + s * 22;
        g.fillStyle = "#fbf3e2";
        g.strokeStyle = "#5a1a10";
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(x, EY, 8.5, 7, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = "#1a120e";
        g.beginPath();
        g.arc(x - s * 1.5, EY, 3.8, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = "#1a120e";
      g.lineWidth = 6;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(CX + s * 6, EY - 6);
        g.quadraticCurveTo(CX + s * 18, EY - 18, CX + s * 36, EY - 20);
        g.stroke();
      }
      g.fillStyle = "#5a1410";
      g.beginPath();
      g.ellipse(CX, EY + 34, 12, 6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#f6efe2";
      g.fillRect(CX - 9, EY + 29, 18, 3);
      blush(0.35, "200,60,40");
      break;
    }
  }
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const faceCache = new Map<string, THREE.MeshStandardMaterial>();
export function faceMaterial(kind: FaceKind, skin: THREE.Material) {
  const sm = skin as THREE.MeshStandardMaterial;
  const hex = `#${sm.color.getHexString()}`;
  const key = `${kind}:${hex}`;
  let m = faceCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      map: paintFace(kind, hex),
      roughness: sm.roughness,
      metalness: sm.metalness,
    });
    faceCache.set(key, m);
  }
  return m;
}

// ── Hình học dùng chung ──────────────────────────────────────────────────────
const lazy = <T,>(make: () => T) => {
  let v: T | null = null;
  return () => (v ??= make());
};

function foldedLathe(points: [number, number][], segs: number, folds: number, amp: (y: number) => number, zScale = 1) {
  const g = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segs,
  );
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const th = Math.atan2(x, z);
    const k = 1 + amp(y) * Math.sin(th * folds + y * 2);
    p.setXYZ(i, x * k, y, z * k * zScale);
  }
  g.computeVertexNormals();
  return g;
}

/** Vạt áo dài (tâm ở gốc, cao 1, như cylinder cũ để giữ hoạt ảnh co giãn). */
export const skirtGeo = lazy(() =>
  foldedLathe(
    // Thứ tự điểm từ dưới lên để mặt lưới hướng ra ngoài (không bị nhìn xuyên).
    [
      [0.0, -0.5],
      [0.3, -0.5],
      [0.31, -0.47],
      [0.285, -0.32],
      [0.245, 0.0],
      [0.215, 0.3],
      [0.2, 0.5],
      [0.0, 0.5],
    ],
    32,
    9,
    (y) => (y < 0.4 ? 0.035 * (0.45 - y) : 0),
    0.86,
  ),
);

/** Thân trên áo tràng: hông → vai, ngực đầy, vai tròn. Gốc ở hông. */
export const torsoGeo = lazy(() =>
  foldedLathe(
    [
      [0.0, 0.0],
      [0.205, 0.0],
      [0.205, 0.14],
      [0.198, 0.3],
      [0.214, 0.45],
      [0.225, 0.54],
      [0.21, 0.6],
      [0.15, 0.655],
      [0.06, 0.675],
      [0.0, 0.68],
    ],
    28,
    7,
    (y) => (y < 0.4 ? 0.012 : 0),
    0.76,
  ),
);

/** Tay áo rộng (gốc ở vai, rủ xuống −y). */
export const sleeveGeo = lazy(() =>
  foldedLathe(
    // Từ cổ tay lên vai: mặt ngoài hướng ra ngoài; cổ tay khép kín.
    [
      [0.0, -0.49],
      [0.05, -0.49],
      [0.07, -0.5],
      [0.12, -0.5],
      [0.118, -0.46],
      [0.095, -0.3],
      [0.078, -0.12],
      [0.07, 0.0],
      [0.0, 0.02],
    ],
    16,
    5,
    (y) => (y < -0.2 ? 0.04 : 0),
  ),
);

/** Khối đầu trái xoan: thu nhẹ hàm và cằm, giữ UV của SphereGeometry cho texture mặt. */
export const headGeo = lazy(() => {
  const g = new THREE.SphereGeometry(0.13, 36, 28);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i) / 0.13;
    const z = p.getZ(i);
    const jaw = y < 0 ? 1 - 0.2 * Math.pow(-y, 1.6) : 1;
    // Gò má đầy nhẹ ở ngang mũi
    const cheek = 1 + 0.035 * Math.exp(-(((y + 0.25) / 0.25) ** 2));
    p.setXYZ(i, x * jaw * cheek, p.getY(i), z * (y < 0 ? 1 - 0.08 * Math.pow(-y, 2) : 1));
  }
  g.computeVertexNormals();
  return g;
});

// ── Thành phần ───────────────────────────────────────────────────────────────
/** Khối thon nối hai điểm (cánh tay, cẳng chân, dải lụa). */
export function Limb({
  from,
  to,
  r1,
  r2,
  material,
  caps = true,
}: {
  from: V3;
  to: V3;
  r1: number;
  r2: number;
  material: THREE.Material;
  caps?: boolean;
}) {
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
        <cylinderGeometry args={[r2, r1, len, 12]} />
      </mesh>
      {caps && (
        <>
          <mesh position={[0, len / 2, 0]} material={material}>
            <sphereGeometry args={[r2, 10, 8]} />
          </mesh>
          <mesh position={[0, -len / 2, 0]} material={material}>
            <sphereGeometry args={[r1, 10, 8]} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Bàn tay: lòng bàn tay + ngón cái. Hướng ngón tay theo −y của nhóm. */
export function Hand({ skin, side = 1, at = [0, 0, 0], rot = [0, 0, 0] }: { skin: THREE.Material; side?: number; at?: V3; rot?: V3 }) {
  return (
    <group position={at} rotation={rot}>
      <mesh position={[0, -0.035, 0]} scale={[0.04, 0.062, 0.024]} material={skin}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh position={[side * -0.03, -0.022, 0.016]} rotation-z={side * 0.6} scale={[0.013, 0.03, 0.013]} material={skin}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
    </group>
  );
}

/** Bán kính thân áo tại độ cao y (khớp torsoGeo). */
const TORSO_PROFILE: [number, number][] = [
  [0.0, 0.205],
  [0.14, 0.205],
  [0.3, 0.198],
  [0.45, 0.214],
  [0.54, 0.225],
  [0.6, 0.21],
  [0.655, 0.15],
  [0.675, 0.06],
];
function torsoR(y: number) {
  for (let i = 1; i < TORSO_PROFILE.length; i++) {
    const [y1, r1] = TORSO_PROFILE[i];
    const [y0, r0] = TORSO_PROFILE[i - 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0.06;
}
/** Điểm trên mặt thân áo (góc a: 0 = chính giữa phía trước). */
function onTorso(a: number, y: number, out: number) {
  const r = torsoR(y) + out;
  return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r * 0.76 + (out > 0 ? out * 0.3 : 0));
}
const collarGeo = lazy(() => {
  // Vạt trái (nằm dưới) và vạt phải (đè lên), ôm theo ngực
  const under = new THREE.CatmullRomCurve3([onTorso(-0.95, 0.645, 0.008), onTorso(-0.45, 0.55, 0.01), onTorso(0.05, 0.43, 0.01), onTorso(0.3, 0.34, 0.01)]);
  const over = new THREE.CatmullRomCurve3([onTorso(0.95, 0.645, 0.014), onTorso(0.45, 0.55, 0.016), onTorso(-0.05, 0.42, 0.016), onTorso(-0.38, 0.3, 0.016)]);
  const back = new THREE.CatmullRomCurve3([onTorso(0.95, 0.645, 0.01), onTorso(Math.PI * 0.6, 0.665, 0.01), onTorso(Math.PI, 0.67, 0.01), onTorso(-Math.PI * 0.6, 0.665, 0.01), onTorso(-0.95, 0.645, 0.01)]);
  const flat = (g: THREE.TubeGeometry) => g;
  return [
    flat(new THREE.TubeGeometry(under, 24, 0.014, 6, false)),
    flat(new THREE.TubeGeometry(over, 24, 0.015, 6, false)),
    flat(new THREE.TubeGeometry(back, 20, 0.014, 6, false)),
  ];
});

/** Cổ áo giao lĩnh: hai vạt chéo ôm ngực (vạt phải đè vạt trái) và cổ sau. */
export function CrossCollar({ material, y = 0, w = 1 }: { material: THREE.Material; y?: number; w?: number }) {
  const [under, over, back] = collarGeo();
  return (
    <group position={[0, y, 0]} scale={[w, 1, w]}>
      <mesh geometry={under} material={material} />
      <mesh geometry={over} material={material} />
      <mesh geometry={back} material={material} />
    </group>
  );
}

/**
 * Đầu người: khối đầu có mặt vẽ, mũi, tai và kiểu tóc/mũ.
 * Gốc ở tâm đầu; bán kính chuẩn 0.13.
 */
export function Head({
  face,
  hair,
  skin,
  r = 0.13,
  beard,
  accent,
  neck = true,
}: {
  face: FaceKind;
  hair: HairKind;
  skin: THREE.Material;
  r?: number;
  /** Râu: "black" | "white" */
  beard?: "black" | "white";
  /** Màu phụ cho mũ/khăn (theo áo). */
  accent?: THREE.Material;
  neck?: boolean;
}) {
  const fm = faceMaterial(face, skin);
  const k = r / 0.13;
  const acc = accent ?? M.robeRed;
  return (
    <group scale={k}>
      {neck && (
        <mesh position={[0, -0.13, -0.005]} material={skin}>
          <cylinderGeometry args={[0.048, 0.056, 0.12, 12]} />
        </mesh>
      )}
      <mesh geometry={headGeo()} scale={[0.93, 1.08, 0.98]} material={fm} castShadow />
      {/* Mũi nhỏ, sống mũi thanh */}
      <mesh position={[0, -0.042, 0.121]} rotation-x={0.35} scale={[0.011, 0.017, 0.011]} material={skin}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {/* Tai */}
      {hair !== "helmet" &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.113, -0.012, -0.005]} rotation-y={s * 0.45} scale={[0.012, face === "serene" || face === "arhat" ? 0.05 : 0.03, 0.022]} material={skin}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        ))}
      {beard && (
        <group>
          {/* Chòm râu cằm thon và ria mép mảnh */}
          <mesh position={[0, -0.16, 0.07]} rotation-x={Math.PI + 0.35} material={beard === "white" ? M.robeWhite : M.beard} castShadow>
            <coneGeometry args={[0.038, beard === "white" ? 0.2 : 0.16, 10]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.026, -0.072, 0.113]}
              rotation={[0, s * 0.35, s * -0.35]}
              scale={[0.027, 0.0065, 0.008]}
              material={beard === "white" ? M.robeWhite : M.beard}
            >
              <sphereGeometry args={[1, 8, 6]} />
            </mesh>
          ))}
        </group>
      )}
      <HairPiece hair={hair} accent={acc} />
    </group>
  );
}

function HairPiece({ hair, accent }: { hair: HairKind; accent: THREE.Material }) {
  switch (hair) {
    case "none":
      return null;
    case "monk":
    case "novice":
      return (
        <group>
          {/* Đầu cạo: chân tóc xanh mờ */}
          <mesh position={[0, 0.008, -0.004]} rotation-x={-0.4} scale={[0.95, 1.07, 1.0]} material={stubble}>
            <sphereGeometry args={[0.1315, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          {hair === "novice" && (
            <>
              {/* Chỏm tóc trước trán */}
              <mesh position={[0, 0.12, 0.06]} rotation-x={0.5} scale={[0.04, 0.026, 0.05]} material={hairMat}>
                <sphereGeometry args={[1, 12, 8]} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.1, 0.075, -0.035]} scale={[0.022, 0.03, 0.028]} material={hairMat}>
                  <sphereGeometry args={[1, 10, 8]} />
                </mesh>
              ))}
            </>
          )}
        </group>
      );
    case "hairM":
      return (
        <group>
          <mesh position={[0, 0.018, -0.004]} rotation={[-0.5, 0, 0.06]} scale={[0.98, 1.12, 1.04]} material={hairMat} castShadow>
            <sphereGeometry args={[0.133, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
          </mesh>
          <mesh position={[0, -0.02, -0.03]} scale={[0.97, 1.0, 0.97]} material={hairMat}>
            <sphereGeometry args={[0.13, 24, 12, Math.PI * 1.15, Math.PI * 0.7, 0.3, Math.PI * 0.4]} />
          </mesh>
        </group>
      );
    case "hairF":
    case "nonLa":
      return (
        <group>
          <mesh position={[0, 0.018, -0.006]} rotation-x={-0.52} scale={[0.99, 1.12, 1.04]} material={hairMat} castShadow>
            <sphereGeometry args={[0.134, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {/* Tóc mai hai bên má */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.113, -0.035, 0.015]} rotation-z={s * 0.08} scale={[0.018, 0.06, 0.024]} material={hairMat}>
              <sphereGeometry args={[1, 10, 10]} />
            </mesh>
          ))}
          {/* Búi tóc thấp sau gáy + trâm */}
          <mesh position={[0, -0.03, -0.135]} scale={[1.1, 0.9, 0.8]} material={hairMat} castShadow>
            <sphereGeometry args={[0.062, 14, 10]} />
          </mesh>
          <mesh position={[0.0, -0.02, -0.17]} rotation-z={Math.PI / 2 - 0.3} material={gold}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 6]} />
          </mesh>
          {hair === "nonLa" && (
            <group position={[0, 0.075, 0]} rotation-x={-0.08}>
              <mesh position={[0, 0.07, 0]} material={straw} castShadow>
                <coneGeometry args={[0.33, 0.19, 24, 1, true]} />
              </mesh>
              {[0.25, 0.17, 0.09].map((rr, i) => (
                <mesh key={rr} position={[0, 0.015 + i * 0.045, 0]} rotation-x={Math.PI / 2} material={strawLine}>
                  <torusGeometry args={[rr, 0.0035, 4, 28]} />
                </mesh>
              ))}
              {/* Quai nón */}
              <mesh position={[0, -0.12, 0.03]} rotation-x={0.2} material={M.robeWhite}>
                <torusGeometry args={[0.115, 0.006, 4, 20, Math.PI]} />
              </mesh>
            </group>
          )}
        </group>
      );
    case "topknot":
      return (
        <group>
          <mesh position={[0, 0.014, -0.006]} rotation-x={-0.36} scale={[0.98, 1.09, 1.03]} material={hairMat}>
            <sphereGeometry args={[0.134, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <mesh position={[0, 0.15, -0.015]} material={hairMat}>
            <sphereGeometry args={[0.05, 14, 10]} />
          </mesh>
          <mesh position={[0, 0.125, -0.015]} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[0.045, 0.009, 6, 18]} />
          </mesh>
        </group>
      );
    case "crown":
      return (
        <group>
          <mesh position={[0, 0.014, -0.006]} rotation-x={-0.36} scale={[0.98, 1.09, 1.03]} material={hairMat}>
            <sphereGeometry args={[0.134, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <mesh position={[0, 0.17, -0.015]} scale={[1, 1.2, 1]} material={hairMat}>
            <sphereGeometry args={[0.055, 14, 10]} />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation-x={Math.PI / 2 - 0.1} scale={[0.95, 1, 1]} material={gold}>
            <torusGeometry args={[0.13, 0.012, 6, 28]} />
          </mesh>
          {[-0.75, 0, 0.75].map((a) => (
            <mesh
              key={a}
              position={[Math.sin(a) * 0.12, 0.13, Math.cos(a) * 0.12]}
              rotation={[-0.15, a, 0]}
              scale={[0.042, a === 0 ? 0.075 : 0.058, 0.01]}
              material={gold}
            >
              <sphereGeometry args={[1, 12, 10]} />
            </mesh>
          ))}
          <mesh position={[0, 0.13, 0.13]} material={M.lanternRed}>
            <sphereGeometry args={[0.012, 8, 6]} />
          </mesh>
        </group>
      );
    case "helmet":
      return (
        <group>
          <mesh position={[0, 0.03, 0]} scale={[1.02, 1.0, 1.04]} material={gold} castShadow>
            <sphereGeometry args={[0.142, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>
          {/* Vành mũ, che tai */}
          <mesh position={[0, 0.02, 0]} rotation-x={Math.PI / 2} material={accent}>
            <torusGeometry args={[0.14, 0.02, 6, 28]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.13, -0.05, -0.01]} rotation-z={s * 0.15} scale={[0.02, 0.08, 0.075]} material={gold}>
              <sphereGeometry args={[1, 10, 8]} />
            </mesh>
          ))}
          {/* Chóp và chùm tua đỏ */}
          <mesh position={[0, 0.2, 0]} material={gold}>
            <coneGeometry args={[0.03, 0.12, 8]} />
          </mesh>
          <mesh position={[0, 0.28, -0.03]} scale={[0.05, 0.07, 0.05]} material={M.lanternRed}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          <mesh position={[0, 0.06, 0.135]} material={M.lanternRed}>
            <sphereGeometry args={[0.018, 8, 6]} />
          </mesh>
        </group>
      );
    case "hat":
      // Mũ cánh chuồn của quan
      return (
        <group>
          <mesh position={[0, 0.08, -0.01]} material={M.beard} castShadow>
            <cylinderGeometry args={[0.125, 0.14, 0.11, 20]} />
          </mesh>
          <mesh position={[0, 0.15, -0.045]} scale={[1, 0.9, 0.8]} material={M.beard}>
            <sphereGeometry args={[0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0, 0.08, 0.002]} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[0.137, 0.008, 6, 28]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.24, 0.13, -0.08]} rotation={[0, 0, s * 0.12]} scale={[0.11, 0.04, 0.008]} material={M.beard}>
              <sphereGeometry args={[1, 14, 8]} />
            </mesh>
          ))}
          <mesh position={[0, 0.1, 0.137]} material={gold}>
            <sphereGeometry args={[0.02, 10, 8]} />
          </mesh>
        </group>
      );
    case "khanChau":
      // Khăn chầu Thánh Mẫu: vành khăn quấn nhiều lớp, cài phượng, tua rủ
      return (
        <group>
          <mesh position={[0, 0.014, -0.006]} rotation-x={-0.36} scale={[0.98, 1.09, 1.03]} material={hairMat}>
            <sphereGeometry args={[0.134, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.05 + i * 0.035, -0.01]} rotation-x={Math.PI / 2 - 0.12} scale={[1, 1, 1]} material={i === 1 ? gold : accent}>
              <torusGeometry args={[0.138 - i * 0.008, 0.024, 8, 30]} />
            </mesh>
          ))}
          <mesh position={[0, 0.13, -0.02]} scale={[1, 0.6, 1]} material={accent}>
            <sphereGeometry args={[0.12, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* Phượng cài trước */}
          <mesh position={[0, 0.15, 0.13]} rotation-x={-0.3} scale={[0.04, 0.06, 0.01]} material={gold}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.14, -0.04, 0.02]} material={gold}>
              <cylinderGeometry args={[0.006, 0.012, 0.12, 6]} />
            </mesh>
          ))}
        </group>
      );
  }
}

/** Giày vải mũi tròn. */
export function Shoe({ at }: { at: V3 }) {
  return (
    <mesh position={at} scale={[0.055, 0.04, 0.115]} material={M.shoe} castShadow>
      <sphereGeometry args={[1, 12, 8]} />
    </mesh>
  );
}
