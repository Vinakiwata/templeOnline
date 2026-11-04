/**
 * Nhân vật trong chùa: chư Tăng (thầy), chú tiểu và người hành hương.
 * Chỉ là dữ liệu — hình dáng và chuyển động được dựng trong game/entities/Npc.tsx.
 *
 * Toạ độ (x, z) là toạ độ thế giới; độ cao tự tính theo mặt đất / nền điện.
 * Đường đi đã được đặt để tránh cột, đèn lồng, tháp đá và các vật cản khác.
 */
import { GIANG_DUONG_MATS, PLAYER_CUSHION, PLAYER_MEAL_SEAT, POS, THIEN_CUSHIONS, TRAI_SEATS, roadX } from "./world";

export type NpcRole = "monk" | "novice" | "pilgrim";
export type NpcHead = "monk" | "novice" | "hairM" | "hairF" | "nonLa";
export type NpcProp = "none" | "broom" | "beads" | "incense" | "mo" | "tray" | "bag" | "bowl" | "ladle";
export type NpcPose = "stand" | "walk" | "bow" | "pray" | "sit" | "teach" | "woodfish" | "sweep" | "eat" | "cook";
/** Tên vật liệu trong materials.ts (giữ domain không phụ thuộc three.js). */
export type RobeKey = "robeSaffron" | "robeBrown" | "robeGrey" | "robe" | "robeDark" | "robeWhite" | "robeBlue" | "robeRed" | "robeGreen";

export interface NpcLook {
  robe: RobeKey;
  sash?: RobeKey;
  head: NpcHead;
  prop?: NpcProp;
  scale?: number;
}

export interface Waypoint {
  x: number;
  z: number;
  /** Dừng lại bao lâu (giây). */
  wait?: number;
  pose?: NpcPose;
  /** Điểm quay mặt về khi dừng. */
  face?: [number, number];
}

export interface NpcSpec {
  id: string;
  role: NpcRole;
  label: string;
  look: NpcLook;
  station?: { x: number; z: number; face: [number, number]; pose: NpcPose; seat?: number };
  path?: { points: Waypoint[]; speed: number; mode: "loop" | "pingpong"; start?: number };
}

// ── Trang phục mẫu ──────────────────────────────────────────────────────────
const MONK: NpcLook = { robe: "robeBrown", sash: "robeSaffron", head: "monk" };
const MONK_Y: NpcLook = { robe: "robeSaffron", head: "monk" };
const NOVICE: NpcLook = { robe: "robeGrey", head: "novice", scale: 0.74 };
const NOVICE_B: NpcLook = { robe: "robeBrown", head: "novice", scale: 0.72 };
const LAY_F: NpcLook = { robe: "robe", head: "hairF", scale: 0.95 };
const LAY_M: NpcLook = { robe: "robeDark", head: "hairM" };
const LAY_BROWN: NpcLook = { robe: "robeBrown", head: "hairF", scale: 0.95 };

// ── Đường lên chùa ──────────────────────────────────────────────────────────
function roadPath(offset: number): Waypoint[] {
  const pts: Waypoint[] = [];
  for (let z = 54; z >= 14; z -= 5) pts.push({ x: roadX(z) + offset, z });
  pts.push({ x: offset * 1.5, z: 8.5, wait: 7, pose: "bow", face: [0, 0] });
  pts[0] = { ...pts[0], wait: 4, pose: "stand", face: [roadX(60), 60] };
  return pts;
}

// ── Vòng viếng chùa trong sân ───────────────────────────────────────────────
const TOUR: Waypoint[] = [
  { x: 0, z: 1 },
  { x: 0, z: -11.6, wait: 6, pose: "bow", face: [0, -14] },
  { x: 2.2, z: -14 },
  { x: 0.4, z: -24.2, wait: 6, pose: "bow", face: [0, -30] },
  { x: -6, z: -18 },
  { x: -9.3, z: -13, wait: 7, pose: "pray", face: [POS.quanAm[0], POS.quanAm[1]] },
  { x: -6, z: -10 },
  { x: -1, z: -4 },
];

// ── Thiền hành quanh sân ────────────────────────────────────────────────────
const WALKING_MEDITATION: Waypoint[] = [
  { x: -5, z: -9.6 },
  { x: 5.4, z: -9.6 },
  { x: 5.4, z: -18.4 },
  { x: -4.6, z: -18.4, wait: 3, pose: "stand", face: [-4.6, -10] },
];

const seatedFace = (x: number, z: number, fx: number) => ({ x, z, face: [fx, z] as [number, number] });

/** Người ngồi thiền trong Thiền đường (chừa bồ đoàn của người chơi). */
const MEDITATORS: NpcSpec[] = THIEN_CUSHIONS.filter(
  ([x, z]) => !(x === PLAYER_CUSHION[0] && z === PLAYER_CUSHION[1]),
)
  .filter((_, i) => i % 3 !== 2) // để trống vài bồ đoàn cho tự nhiên
  .map(([x, z], i): NpcSpec => ({
    id: `thien-${i}`,
    role: i % 3 === 0 ? "monk" : i % 4 === 1 ? "novice" : "pilgrim",
    label: i % 3 === 0 ? "Thầy" : i % 4 === 1 ? "Chú tiểu" : "Thiền sinh",
    look: i % 3 === 0 ? MONK : i % 4 === 1 ? NOVICE : i % 2 ? LAY_F : LAY_M,
    station: { ...seatedFace(x, z, 40), pose: "sit", seat: 0.12 },
  }));

/** Đại chúng nghe pháp trong Giảng đường. */
const LISTENERS: NpcSpec[] = GIANG_DUONG_MATS.filter((_, i) => i !== 2 && i !== 5).map(([x, z], i): NpcSpec => ({
  id: `nghe-phap-${i}`,
  role: "pilgrim",
  label: "Phật tử",
  look: [LAY_F, LAY_M, LAY_BROWN, LAY_F, LAY_M, LAY_BROWN][i % 6],
  station: { ...seatedFace(x, z, 40), pose: "sit", seat: 0.1 },
}));

/** Đại chúng thọ trai (chừa chỗ của người chơi và vài chỗ trống). */
const DINERS: NpcSpec[] = TRAI_SEATS.filter(([x, z]) => !(x === PLAYER_MEAL_SEAT[0] && z === PLAYER_MEAL_SEAT[1]))
  .filter((_, i) => i % 2 === 0 || i % 5 === 1)
  .map(([x, z, tx], i): NpcSpec => {
    const kind = i % 4;
    const look = kind === 0 ? MONK : kind === 1 ? NOVICE_B : kind === 2 ? LAY_F : LAY_M;
    return {
      id: `tho-trai-${i}`,
      role: kind === 0 ? "monk" : kind === 1 ? "novice" : "pilgrim",
      label: kind === 0 ? "Thầy" : kind === 1 ? "Chú tiểu" : "Phật tử",
      look: { ...look, prop: "bowl" },
      station: { x, z, face: [tx, z], pose: "eat", seat: 0.02 },
    };
  });

/** Chỗ ngồi còn trống trong Trai đường — người chơi có thể ngồi xuống thọ trai ở bất kỳ chỗ nào. */
export const FREE_MEAL_SEATS: [number, number, number][] = TRAI_SEATS.filter(
  ([x, z]) => !DINERS.some((d) => d.station && d.station.x === x && d.station.z === z),
);

export const NPCS: NpcSpec[] = [
  // Đường lên chùa
  { id: "hanh-huong-1", role: "pilgrim", label: "Người hành hương", look: { robe: "robe", head: "nonLa", prop: "bag", scale: 0.95 }, path: { points: roadPath(0.9), speed: 1.0, mode: "pingpong", start: 0 } },
  { id: "hanh-huong-2", role: "pilgrim", label: "Người hành hương", look: { ...LAY_M, prop: "bag" }, path: { points: roadPath(1.4), speed: 1.1, mode: "pingpong", start: 4 } },
  { id: "hanh-huong-3", role: "pilgrim", label: "Người hành hương", look: { robe: "robeWhite", head: "nonLa", scale: 0.93 }, path: { points: roadPath(-1.0), speed: 0.95, mode: "pingpong", start: 7 } },

  // Sân chùa
  { id: "thien-hanh", role: "monk", label: "Thầy đang thiền hành", look: { ...MONK, prop: "beads" }, path: { points: WALKING_MEDITATION, speed: 0.45, mode: "loop" } },
  { id: "tieu-quet-san", role: "novice", label: "Chú tiểu quét sân", look: { ...NOVICE, prop: "broom" }, station: { x: 9, z: -19.5, face: [6, -19.5], pose: "sweep" } },
  { id: "dang-huong-1", role: "pilgrim", label: "Phật tử dâng hương", look: { ...LAY_F, prop: "incense" }, station: { x: 1.7, z: -12.3, face: [0, -14], pose: "pray" } },
  { id: "dang-huong-2", role: "pilgrim", label: "Phật tử", look: LAY_M, station: { x: -1.7, z: -12.3, face: [0, -14], pose: "bow" } },
  { id: "le-quan-am", role: "pilgrim", label: "Phật tử lễ Quán Âm", look: { ...LAY_BROWN, prop: "beads" }, station: { x: -9.5, z: -15.8, face: [POS.quanAm[0], POS.quanAm[1]], pose: "pray" } },
  { id: "thien-bo-de", role: "pilgrim", label: "Người ngồi thiền", look: LAY_M, station: { x: 17.7, z: -11.2, face: [POS.bodhi[0], POS.bodhi[1]], pose: "sit", seat: 0 } },
  { id: "vieng-chua-1", role: "pilgrim", label: "Người hành hương", look: { robe: "robeBlue", head: "hairF", scale: 0.95 }, path: { points: TOUR, speed: 0.9, mode: "loop", start: 0 } },
  { id: "vieng-chua-2", role: "pilgrim", label: "Người hành hương", look: LAY_BROWN, path: { points: TOUR, speed: 0.85, mode: "loop", start: 4 } },

  // Tiền đường
  { id: "le-duc-ong", role: "pilgrim", label: "Phật tử", look: LAY_F, station: { x: -6.6, z: -30.3, face: [-7.5, -33], pose: "bow" } },

  // Thượng điện
  { id: "thay-tung-kinh", role: "monk", label: "Thầy tụng kinh", look: { ...MONK_Y, prop: "mo" }, station: { x: -2.8, z: -42.4, face: [-2.8, -47], pose: "woodfish", seat: 0.05 } },
  { id: "tieu-tung-kinh", role: "novice", label: "Chú tiểu", look: { ...NOVICE_B, prop: "beads" }, station: { x: 2.8, z: -42.4, face: [2.8, -47], pose: "sit", seat: 0.05 } },
  { id: "le-phat-1", role: "pilgrim", label: "Phật tử", look: LAY_BROWN, station: { x: -5.2, z: -41.2, face: [-5.2, -46], pose: "bow" } },
  { id: "le-phat-2", role: "pilgrim", label: "Phật tử", look: LAY_M, station: { x: 5.2, z: -41.2, face: [5.2, -46], pose: "bow" } },

  // Hành lang
  {
    id: "vieng-la-han",
    role: "pilgrim",
    label: "Người hành hương",
    look: { robe: "robeGreen", head: "hairF", scale: 0.95 },
    path: {
      points: [
        { x: -19.3, z: -28 },
        { x: -19.3, z: -40.3, wait: 4, pose: "pray", face: [-22, -40.3] },
        { x: -19.3, z: -59.5, wait: 4, pose: "bow", face: [-22, -59.5] },
      ],
      speed: 0.8,
      mode: "pingpong",
    },
  },

  // Nhà Tổ
  { id: "tieu-dang-huong", role: "novice", label: "Chú tiểu dâng hương", look: { ...NOVICE, prop: "incense" }, station: { x: 2.6, z: -60.2, face: [2.6, -63], pose: "pray" } },
  {
    id: "thay-tang-xa",
    role: "monk",
    label: "Thầy",
    look: MONK,
    path: {
      points: [
        { x: -24.2, z: -32, wait: 5, pose: "stand", face: [-30, -32] },
        { x: -24.2, z: -48, wait: 5, pose: "stand", face: [-30, -48] },
      ],
      speed: 0.6,
      mode: "pingpong",
    },
  },

  // Giảng đường
  { id: "thay-giang-phap", role: "monk", label: "Thầy giảng pháp", look: { ...MONK, scale: 1.02 }, station: { x: 32.75, z: -52, face: [20, -52], pose: "teach", seat: 0.52 } },
  { id: "tieu-hau-thay", role: "novice", label: "Chú tiểu hầu thầy", look: { ...NOVICE, prop: "tray" }, station: { x: 32.4, z: -54.1, face: [20, -53], pose: "stand" } },
  ...LISTENERS,

  // Thiền đường
  { id: "thay-huong-dan-thien", role: "monk", label: "Thầy hướng dẫn thiền", look: { ...MONK, prop: "beads" }, station: { x: 31.2, z: -69, face: [20, -69], pose: "sit", seat: 0.28 } },
  ...MEDITATORS,

  // Trai đường & nhà trù
  { id: "thay-tru-tri", role: "monk", label: "Thầy trụ trì", look: { ...MONK_Y, prop: "bowl" }, station: { x: 29.75, z: -37.35, face: [29.75, -30], pose: "eat", seat: 0.06 } },
  ...DINERS,
  {
    id: "tieu-hanh-duong",
    role: "novice",
    label: "Chú tiểu hành đường",
    look: { ...NOVICE, prop: "tray" },
    path: {
      points: [
        { x: 29.75, z: -29.2, wait: 3, pose: "stand", face: [27, -29.2] },
        { x: 29.75, z: -32.5, wait: 3, pose: "stand", face: [32.5, -32.5] },
        { x: 29.75, z: -35.4, wait: 4, pose: "stand", face: [27, -35.4] },
      ],
      speed: 0.6,
      mode: "pingpong",
    },
  },
  { id: "tieu-nau-com", role: "novice", label: "Chú tiểu nấu cơm", look: { ...NOVICE_B, prop: "ladle" }, station: { x: 33.6, z: -40.55, face: [33.6, -41.65], pose: "cook" } },
  { id: "cong-qua-nhat-rau", role: "pilgrim", label: "Phật tử công quả", look: LAY_BROWN, station: { x: 28.3, z: -39.55, face: [28.3, -40.2], pose: "cook" } },
];
