/**
 * Bố cục thế giới: ngôi chùa lớn trên đồi, một con đường quanh co dẫn lên cổng Tam quan.
 *
 * Trục thần đạo (x = 0) từ ngoài vào trong (hướng −Z):
 *   Đường lên chùa → Tam quan → Sân chùa → Tiền đường → Thiêu hương → Thượng điện
 *   → Nhà Tổ (Hậu đường) → Điện Mẫu
 * Tiền đường + Thiêu hương + Thượng điện tạo mặt bằng chữ Công (工);
 * hai dãy Hành lang + Nhà Tổ khép lại thành chữ Quốc (国).
 * Khu phụ trợ hai bên: Tăng xá, Trai đường, Giảng đường, Bảo tháp.
 *
 * Dữ liệu tách khỏi component 3D để sau này có thể tải từ `GET /api/v1/temples/:id/scene`.
 */

/** Tên chùa (hiển thị trên cổng Tam quan, bia đá và giao diện). */
export const TEMPLE_NAME = "Thiện Phúc Tự";
export const TEMPLE_NAME_HAN = "善福寺";
/**
 * Câu đối cổng Tam quan (Chùa Online soạn, lồng tên chùa “Thiện – Phúc”).
 * [vế đầu – trụ bên trái người nhìn vào, vế sau – trụ bên phải].
 */
export const GATE_COUPLET: [string, string] = [
  "Thiện niệm khởi tâm, muôn nẻo an lành về cửa Phật",
  "Phúc duyên gieo hạt, ngàn đời hoan hỷ hướng đường Thiền",
];

// ── Địa hình ────────────────────────────────────────────────────────────────
export const PLATEAU = 9; // độ cao mặt bằng chùa trên đỉnh đồi
export const COMPOUND = { minX: -36, maxX: 36, minZ: -76, maxZ: 4 };
export const ROAD = { startZ: 4, endZ: 58, width: 5 };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Tim đường lên chùa (uốn lượn nhẹ). */
export function roadX(z: number): number {
  const t = (z - ROAD.startZ) / (ROAD.endZ - ROAD.startZ);
  return 4.5 * Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
}

/** Độ cao địa hình tự nhiên: đỉnh đồi bằng phẳng, sườn đồi thoải dần. */
export function terrainHeight(x: number, z: number): number {
  const dx = Math.max(Math.abs(x) - COMPOUND.maxX, 0);
  const dz = Math.max(z - COMPOUND.maxZ, COMPOUND.minZ - z, 0);
  const d = Math.hypot(dx, dz);
  const base = PLATEAU * (1 - smoothstep(0, 56, d));
  // Gợn nhẹ trên sườn đồi (không ảnh hưởng đường đi và mặt bằng chùa).
  const onRoad = z > COMPOUND.maxZ && Math.abs(x - roadX(z)) < 6;
  const ripple = onRoad ? 0 : Math.sin(x * 0.11) * Math.cos(z * 0.09) * 1.1 * smoothstep(6, 30, d);
  return base + ripple;
}

// ── Nền nâng của các công trình (độ cao so với mặt bằng chùa) ──────────────
export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
export interface Platform extends Rect {
  h: number;
}

const rect = (minX: number, maxX: number, minZ: number, maxZ: number): Rect => ({ minX, maxX, minZ, maxZ });

export const PLATFORMS: Platform[] = [
  { ...rect(-11.5, 11.5, -34, -25.5), h: 0.6 }, // Tiền đường
  { ...rect(-3.5, 3.5, -38.6, -33.9), h: 0.6 }, // Thiêu hương
  { ...rect(-10, 10, -51, -38.5), h: 0.6 }, // Thượng điện
  { ...rect(-23, -17, -62, -25.5), h: 0.3 }, // Hành lang trái
  { ...rect(17, 23, -62, -25.5), h: 0.3 }, // Hành lang phải
  { ...rect(-14, 14, -65, -56), h: 0.45 }, // Nhà Tổ
  { ...rect(-8, 8, -75, -67), h: 0.45 }, // Điện Mẫu
  { ...rect(24, 35, -58, -46), h: 0.3 }, // Giảng đường
  { ...rect(-12.5, -7.5, -7.5, -2.5), h: 0.3 }, // Gác chuông
  { ...rect(7.5, 12.5, -7.5, -2.5), h: 0.3 }, // Gác trống
  { ...rect(18, 35, -75, -63.5), h: 0.35 }, // Thiền đường
  { ...rect(24.2, 35.3, -42.9, -27.2), h: 0.3 }, // Trai đường + nhà trù
];

export const inRect = (r: Rect, x: number, z: number) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;

export function groundHeight(x: number, z: number): number {
  let h = terrainHeight(x, z);
  if (inRect(COMPOUND, x, z)) {
    let extra = 0;
    for (const p of PLATFORMS) if (inRect(p, x, z)) extra = Math.max(extra, p.h);
    h = PLATEAU + extra;
  }
  return h;
}

// ── Công trình (dùng cho bản đồ & thông tin) ───────────────────────────────
export type BuildingKind = "worship" | "support" | "gate" | "corridor";
export interface Building extends Rect {
  id: string;
  label: string;
  kind: BuildingKind;
}

export const BUILDINGS: Building[] = [
  { id: "tam_quan", label: "Tam quan", kind: "gate", ...rect(-7, 7, 2.2, 3.8) },
  { id: "gac_chuong", label: "Gác chuông", kind: "support", ...rect(-12.5, -7.5, -7.5, -2.5) },
  { id: "gac_trong", label: "Gác trống", kind: "support", ...rect(7.5, 12.5, -7.5, -2.5) },
  { id: "tien_duong", label: "Tiền đường", kind: "worship", ...rect(-11, 11, -33.5, -26.5) },
  { id: "thieu_huong", label: "Thiêu hương", kind: "worship", ...rect(-3, 3, -38.5, -33.5) },
  { id: "thuong_dien", label: "Thượng điện", kind: "worship", ...rect(-9.5, 9.5, -50.5, -38.5) },
  { id: "hanh_lang_trai", label: "Hành lang", kind: "corridor", ...rect(-22.5, -17.5, -61.5, -26) },
  { id: "hanh_lang_phai", label: "Hành lang", kind: "corridor", ...rect(17.5, 22.5, -61.5, -26) },
  { id: "nha_to", label: "Nhà Tổ", kind: "worship", ...rect(-13.5, 13.5, -64.5, -56.5) },
  { id: "dien_mau", label: "Điện Mẫu", kind: "worship", ...rect(-7.5, 7.5, -74.5, -67.5) },
  { id: "tang_xa", label: "Tăng xá", kind: "support", ...rect(-34.5, -26, -51.5, -28.5) },
  { id: "trai_duong", label: "Trai đường", kind: "support", ...rect(24.5, 35, -42.6, -27.6) },
  { id: "giang_duong", label: "Giảng đường", kind: "support", ...rect(24.5, 34.5, -57.5, -46.5) },
  { id: "thien_duong", label: "Thiền đường", kind: "worship", ...rect(18.5, 34.5, -74.5, -64) },
];

// ── Khu vực (hiển thị trên HUD) ────────────────────────────────────────────
export type AreaId =
  | "road"
  | "tam_quan"
  | "courtyard"
  | "gac_chuong"
  | "gac_trong"
  | "quan_am"
  | "bodhi"
  | "tien_duong"
  | "thieu_huong"
  | "thuong_dien"
  | "hanh_lang"
  | "nha_to"
  | "dien_mau"
  | "tang_xa"
  | "trai_duong"
  | "giang_duong"
  | "thien_duong"
  | "bao_thap";

export const AREA_LABELS: Record<AreaId, string> = {
  road: "Đường lên chùa",
  tam_quan: "Cổng Tam quan · Thiện Phúc Tự",
  courtyard: "Sân chùa",
  gac_chuong: "Gác chuông",
  gac_trong: "Gác trống",
  quan_am: "Ao sen · Quán Âm lộ thiên",
  bodhi: "Cội Bồ Đề",
  tien_duong: "Tiền đường",
  thieu_huong: "Thiêu hương",
  thuong_dien: "Thượng điện",
  hanh_lang: "Hành lang La Hán",
  nha_to: "Nhà Tổ",
  dien_mau: "Điện Mẫu",
  tang_xa: "Tăng xá",
  trai_duong: "Trai đường",
  giang_duong: "Giảng đường",
  thien_duong: "Thiền đường",
  bao_thap: "Bảo tháp",
};

/** Khu vực trang nghiêm: nhân vật luôn đi chậm. */
export const SOLEMN_AREAS: AreaId[] = ["tien_duong", "thieu_huong", "thuong_dien", "nha_to", "dien_mau", "thien_duong", "giang_duong"];

const near = (x: number, z: number, cx: number, cz: number, r: number) => Math.hypot(x - cx, z - cz) < r;
const grow = (r: Rect, m: number): Rect => rect(r.minX - m, r.maxX + m, r.minZ - m, r.maxZ + m);
const B = Object.fromEntries(BUILDINGS.map((b) => [b.id, b])) as Record<string, Building>;

export function getArea(x: number, z: number): AreaId {
  if (z > 4) return "road";
  if (z > -0.5 && Math.abs(x) < 8) return "tam_quan";
  if (inRect(grow(B.gac_chuong, 1), x, z)) return "gac_chuong";
  if (inRect(grow(B.gac_trong, 1), x, z)) return "gac_trong";
  if (near(x, z, -15, -14, 8)) return "quan_am";
  if (near(x, z, 15, -14, 5.5)) return "bodhi";
  if (inRect(B.tien_duong, x, z)) return "tien_duong";
  if (inRect(B.thieu_huong, x, z)) return "thieu_huong";
  if (inRect(B.thuong_dien, x, z)) return "thuong_dien";
  if (inRect(B.hanh_lang_trai, x, z) || inRect(B.hanh_lang_phai, x, z)) return "hanh_lang";
  if (inRect(B.nha_to, x, z)) return "nha_to";
  if (inRect(B.dien_mau, x, z)) return "dien_mau";
  if (inRect(grow(B.tang_xa, 3), x, z)) return "tang_xa";
  if (inRect(grow(B.trai_duong, 1), x, z)) return "trai_duong";
  if (inRect(grow(B.giang_duong, 1.5), x, z)) return "giang_duong";
  if (inRect(grow(B.thien_duong, 1), x, z)) return "thien_duong";
  if (near(x, z, -29, -68, 7)) return "bao_thap";
  return "courtyard";
}

// ── Vị trí đặt các vật thể ─────────────────────────────────────────────────
export const SPAWN = { x: roadX(54), z: 54, rotationY: Math.PI };

export const POS = {
  bell: [-10, -5] as [number, number],
  drum: [10, -5] as [number, number],
  incense: [0, -14] as [number, number],
  quanAm: [-15, -14] as [number, number],
  bodhi: [15, -14] as [number, number],
  baoThap: [-29, -68] as [number, number],
};
export const POND_RADIUS = 5;
export const FLAG_POLES: [number, number][] = [
  [-4.2, -6],
  [4.2, -6],
];
export const STONE_STUPAS: [number, number][] = [
  [-7, -21.5],
  [7, -21.5],
];
export const LANTERN_POSITIONS: [number, number][] = [
  [-2.6, -2],
  [2.6, -2],
  [-2.6, -8.5],
  [2.6, -8.5],
  [-2.6, -20],
  [2.6, -20],
  [-2.6, -53],
  [2.6, -53],
];
/** Cây trong khuôn viên: [x, z, scale] */
export const TREE_POSITIONS: [number, number, number][] = [
  [-29, -6, 1.1],
  [29, -6, 1.0],
  [-30, -18, 1.2],
  [30, -19, 1.1],
  [-24, -2, 0.9],
  [24, -2, 0.9],
  [34.2, -60.6, 0.9],
  [12, -74.5, 0.8],
  [-16, -72, 1.0],
  [-34, -60, 0.9],
];
/** Thập bát La Hán: 9 vị mỗi bên hành lang. */
export const LA_HAN_Z = Array.from({ length: 9 }, (_, i) => -29.5 - i * 3.6);
/** Bát bộ Kim Cương: 4 vị mỗi bên Tiền đường. */
export const KIM_CUONG_Z = [-27.6, -29.0, -30.4, -31.8];

// ── Collider ───────────────────────────────────────────────────────────────
export type BoxCollider = { kind: "box"; minX: number; maxX: number; minZ: number; maxZ: number };
export type CircleCollider = { kind: "circle"; x: number; z: number; r: number };
export type Collider = BoxCollider | CircleCollider;

const box = (minX: number, maxX: number, minZ: number, maxZ: number): BoxCollider => ({ kind: "box", minX, maxX, minZ, maxZ });
const circle = (x: number, z: number, r: number): CircleCollider => ({ kind: "circle", x, z, r });

/** Hàng cột mặt tiền: trả về toạ độ X các cột. */
export function columnXs(minX: number, maxX: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => minX + ((maxX - minX) * i) / (count - 1));
}
export const TIEN_DUONG_COLS = columnXs(-10.4, 10.4, 8);
export const NHA_TO_COLS = columnXs(-12.9, 12.9, 8);
export const DIEN_MAU_COLS = columnXs(-6.9, 6.9, 4);
export const HANH_LANG_COL_Z = Array.from({ length: 10 }, (_, i) => -27 - i * 3.8);
export const GIANG_DUONG_COL_Z = columnXs(-57, -47, 4);
export const TRAI_DUONG_COL_X = columnXs(24.9, 34.6, 5);
/** Hai dãy bàn ăn dài trong Trai đường (toạ độ X tâm bàn). */
export const TRAI_TABLE_X = [27.0, 32.5];
export const TRAI_ROW_Z = [-35.1, -33.8, -32.5, -31.2, -29.9];
/** Chỗ ngồi hai bên mỗi bàn: [x, z, hướng nhìn X của bàn]. */
export const TRAI_SEATS: [number, number, number][] = TRAI_TABLE_X.flatMap((tx) =>
  TRAI_ROW_Z.flatMap((z) => [
    [tx - 0.8, z, tx] as [number, number, number],
    [tx + 0.8, z, tx] as [number, number, number],
  ]),
);
/** Chỗ ngồi dành cho người chơi (dãy trong, gần cửa). */
export const PLAYER_MEAL_SEAT: [number, number] = [27.8, -29.9];
export const THIEN_DUONG_COL_Z = columnXs(-73.9, -64.6, 5);
/** Bồ đoàn trong Thiền đường: [x, z]. Bồ đoàn [0, 1] dành cho người chơi. */
export const THIEN_CUSHIONS: [number, number][] = [21.6, 24.0, 26.4, 28.8].flatMap((x) =>
  [-72, -69, -66].map((z) => [x, z] as [number, number]),
);
export const PLAYER_CUSHION: [number, number] = [21.6, -69];
/** Chiếu nghe pháp trong Giảng đường: [x, z]. */
export const GIANG_DUONG_MATS: [number, number][] = [27.0, 28.8].flatMap((x) =>
  [-56, -54.4, -49.6, -48].map((z) => [x, z] as [number, number]),
);

const wall = (minX: number, maxX: number, minZ: number, maxZ: number) => box(minX, maxX, minZ, maxZ);

export const COLLIDERS: Collider[] = [
  // Tường trước + cổng Tam quan (3 lối: giữa |x|<2, hai bên 3.6 < |x| < 5.6)
  wall(-36.5, -7, 2.7, 3.4),
  box(-7, -5.6, 2.2, 3.8),
  box(-3.6, -2.0, 2.2, 3.8),
  box(2.0, 3.6, 2.2, 3.8),
  box(5.6, 7, 2.2, 3.8),
  wall(7, 36.5, 2.7, 3.4),

  // Tiền đường: tường sau (chừa cửa giữa sang Thiêu hương), hai tường hồi
  wall(-11.3, -3.0, -33.9, -33.2),
  wall(3.0, 11.3, -33.9, -33.2),
  wall(-11.4, -10.7, -33.9, -26.4),
  wall(10.7, 11.4, -33.9, -26.4),
  ...TIEN_DUONG_COLS.map((x) => circle(x, -26.7, 0.32)),
  // Ban Đức Ông, ban Thánh Hiền, hương án giữa
  box(-9.6, -5.4, -33.3, -31.4),
  box(5.4, 9.6, -33.3, -31.4),
  box(-1.3, 1.3, -30.0, -29.1),
  // Bát bộ Kim Cương
  ...KIM_CUONG_Z.flatMap((z) => [circle(-10.0, z, 0.35), circle(10.0, z, 0.35)]),

  // Thiêu hương: tường hai bên, bàn hương
  wall(-3.4, -2.8, -38.5, -33.5),
  wall(2.8, 3.4, -38.5, -33.5),
  box(-0.7, 0.7, -36.5, -35.5),

  // Thượng điện: tường trước (chừa cửa giữa), tường hồi, tường sau, bàn thờ
  wall(-9.8, -3.0, -38.9, -38.2),
  wall(3.0, 9.8, -38.9, -38.2),
  wall(-9.8, -9.1, -50.8, -38.2),
  wall(9.1, 9.8, -50.8, -38.2),
  wall(-9.8, 9.8, -50.8, -50.1),
  box(-7.2, 7.2, -50.2, -43.6),

  // Hành lang: tường ngoài + bệ La Hán
  wall(-23.0, -22.3, -62, -25.8),
  wall(22.3, 23.0, -62, -25.8),
  box(-22.4, -20.6, -61, -28),
  box(20.6, 22.4, -61, -28),
  ...HANH_LANG_COL_Z.flatMap((z) => [circle(-17.7, z, 0.25), circle(17.7, z, 0.25)]),

  // Nhà Tổ
  wall(-13.8, 13.8, -64.9, -64.2),
  wall(-13.9, -13.2, -64.9, -56.4),
  wall(13.2, 13.9, -64.9, -56.4),
  ...NHA_TO_COLS.map((x) => circle(x, -56.7, 0.3)),
  box(-4.3, 4.3, -64.3, -61.6),

  // Điện Mẫu
  wall(-7.8, 7.8, -74.9, -74.2),
  wall(-7.9, -7.2, -74.9, -67.4),
  wall(7.2, 7.9, -74.9, -67.4),
  ...DIEN_MAU_COLS.map((x) => circle(x, -67.7, 0.3)),
  box(-4.8, 4.8, -74.3, -71.9),

  // Khu phụ trợ
  box(-34.5, -26, -51.5, -28.5), // Tăng xá (nhà kín)
  // Trai đường: tường hồi, tường sau, vách ngăn nhà trù (cửa ở x 32.3–34), cột hiên
  wall(24.2, 24.9, -42.9, -27.6),
  wall(34.6, 35.3, -42.9, -27.6),
  wall(24.2, 35.3, -42.9, -42.2),
  wall(24.2, 32.3, -39.1, -38.5),
  wall(34.0, 35.3, -39.1, -38.5),
  ...TRAI_DUONG_COL_X.map((x) => circle(x, -27.8, 0.26)),
  box(28.6, 30.9, -38.5, -37.8), // bàn Phật
  box(27.7, 31.8, -36.9, -36.3), // bàn trụ trì
  ...TRAI_TABLE_X.map((x) => box(x - 0.38, x + 0.38, -35.7, -29.3)), // bàn ăn dài
  // Nhà trù
  box(30.9, 34.5, -42.3, -41.0), // bếp lò
  box(25.0, 27.4, -42.2, -41.4), // kệ bát
  box(27.3, 29.3, -40.6, -39.8), // bàn sơ chế
  circle(25.6, -39.8, 0.42), // lu nước
  wall(34.2, 34.9, -57.8, -46.2), // Giảng đường: tường sau
  wall(24.3, 34.9, -57.9, -57.2),
  wall(24.3, 34.9, -46.8, -46.1),
  ...GIANG_DUONG_COL_Z.map((z) => circle(24.7, z, 0.3)),
  box(31.2, 34.2, -53.4, -50.6), // bục giảng

  // Gác chuông / gác trống (4 cột mỗi gác)
  ...[POS.bell, POS.drum].flatMap(([cx, cz]) => [
    circle(cx - 1.8, cz - 1.8, 0.3),
    circle(cx + 1.8, cz - 1.8, 0.3),
    circle(cx - 1.8, cz + 1.8, 0.3),
    circle(cx + 1.8, cz + 1.8, 0.3),
  ]),
  circle(POS.drum[0], POS.drum[1], 0.9), // trống đặt giữa

  // Sân chùa
  circle(POS.incense[0], POS.incense[1], 1.15),
  circle(POS.quanAm[0], POS.quanAm[1], POND_RADIUS + 0.25),
  circle(POS.bodhi[0], POS.bodhi[1], 1.35),
  ...FLAG_POLES.map(([x, z]) => circle(x, z, 0.35)),
  ...STONE_STUPAS.map(([x, z]) => circle(x, z, 0.85)),
  ...LANTERN_POSITIONS.map(([x, z]) => circle(x, z, 0.18)),
  ...TREE_POSITIONS.map(([x, z]) => circle(x, z, 0.6)),
  circle(POS.baoThap[0], POS.baoThap[1], 2.7),

  // Thiền đường: tường sau, hai tường hồi, cột hiên, bàn thờ
  wall(34.2, 34.9, -74.9, -63.6),
  wall(18.3, 34.9, -74.9, -74.2),
  wall(18.3, 34.9, -64.3, -63.6),
  ...THIEN_DUONG_COL_Z.map((z) => circle(18.7, z, 0.28)),
  box(32.4, 34.2, -70.6, -67.4),
];

/** Đẩy người chơi ra khỏi collider và giữ trong vùng đi được (đường + khuôn viên). */
export function resolveCollisions(pos: { x: number; z: number }, radius: number) {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of COLLIDERS) {
      if (c.kind === "circle") {
        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + radius;
        if (d < min) {
          const nx = d > 1e-5 ? dx / d : 1;
          const nz = d > 1e-5 ? dz / d : 0;
          pos.x = c.x + nx * min;
          pos.z = c.z + nz * min;
        }
      } else {
        const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
        const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
        const dx = pos.x - cx;
        const dz = pos.z - cz;
        const d = Math.hypot(dx, dz);
        if (d > 1e-5 && d < radius) {
          pos.x = cx + (dx / d) * radius;
          pos.z = cz + (dz / d) * radius;
        } else if (d <= 1e-5) {
          const pushL = pos.x - c.minX + radius;
          const pushR = c.maxX - pos.x + radius;
          const pushB = pos.z - c.minZ + radius;
          const pushF = c.maxZ - pos.z + radius;
          const m = Math.min(pushL, pushR, pushB, pushF);
          if (m === pushL) pos.x -= pushL;
          else if (m === pushR) pos.x += pushR;
          else if (m === pushB) pos.z -= pushB;
          else pos.z += pushF;
        }
      }
    }
  }
  // Vùng đi được
  if (pos.z > 3.4) {
    // Ngoài cổng: chỉ đi trên đường; sát cổng có sân trước rộng hơn.
    const half = pos.z < 12 ? 8 : ROAD.width / 2 + 0.2;
    const cx = pos.z < 12 ? 0 : roadX(pos.z);
    pos.x = Math.max(cx - half, Math.min(cx + half, pos.x));
    pos.z = Math.min(ROAD.endZ - 1, pos.z);
  } else {
    pos.x = Math.max(COMPOUND.minX + 0.6, Math.min(COMPOUND.maxX - 0.6, pos.x));
    pos.z = Math.max(COMPOUND.minZ + 0.6, pos.z);
  }
}

// ── Địa điểm để dịch chuyển nhanh trên bản đồ ──────────────────────────────
export interface Landmark {
  id: string;
  label: string;
  x: number;
  z: number;
  /** Hướng nhìn khi tới nơi (rotationY). */
  facing: number;
}
export const LANDMARKS: Landmark[] = [
  { id: "chan_doi", label: "Chân đồi", x: SPAWN.x, z: SPAWN.z, facing: Math.PI },
  { id: "tam_quan", label: "Cổng Tam quan", x: 0, z: 7, facing: Math.PI },
  { id: "san_chua", label: "Sân chùa", x: 0, z: -8, facing: Math.PI },
  { id: "gac_chuong", label: "Gác chuông", x: -10, z: -1.2, facing: Math.PI },
  { id: "gac_trong", label: "Gác trống", x: 10, z: -1.2, facing: Math.PI },
  { id: "quan_am", label: "Quán Âm lộ thiên", x: -15, z: -7.5, facing: Math.PI },
  { id: "bodhi", label: "Cội Bồ Đề", x: 15, z: -8.5, facing: Math.PI },
  { id: "tien_duong", label: "Tiền đường", x: 0, z: -24, facing: Math.PI },
  { id: "thuong_dien", label: "Thượng điện", x: 0, z: -40.5, facing: Math.PI },
  { id: "hanh_lang", label: "Hành lang La Hán", x: -19.2, z: -27, facing: Math.PI },
  { id: "nha_to", label: "Nhà Tổ", x: 0, z: -54.5, facing: Math.PI },
  { id: "dien_mau", label: "Điện Mẫu", x: 0, z: -66, facing: Math.PI },
  { id: "bao_thap", label: "Bảo tháp", x: -29, z: -61.5, facing: Math.PI },
  { id: "giang_duong", label: "Giảng đường", x: 22.6, z: -52, facing: Math.PI / 2 },
  { id: "tang_xa", label: "Tăng xá", x: -23.8, z: -40, facing: -Math.PI / 2 },
  { id: "trai_duong", label: "Trai đường", x: 29.75, z: -25.4, facing: Math.PI },
  { id: "thien_duong", label: "Thiền đường", x: 16.2, z: -69, facing: Math.PI / 2 },
];
