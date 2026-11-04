/**
 * Dữ liệu bố cục thế giới — collider, khu vực, độ cao mặt đất.
 * Tách khỏi component 3D để có thể tải từ `GET /api/v1/temples/:id/scene` sau này.
 */
export type AreaId = "courtyard" | "main_hall" | "bell_tower" | "lotus_pond" | "bodhi" | "quan_am";

export const AREA_LABELS: Record<AreaId, string> = {
  courtyard: "Sân chùa",
  main_hall: "Chánh điện",
  bell_tower: "Lầu chuông",
  lotus_pond: "Ao sen",
  bodhi: "Cội Bồ Đề",
  quan_am: "Tượng Quán Âm",
};

export const SPAWN = { x: 0, z: 19, rotationY: Math.PI };

export const BOUNDS = { minX: -15.4, maxX: 15.4, minZ: -15.4, maxZ: 21 };

/** Chánh điện: nền nâng cao. */
export const HALL = { minX: -8.5, maxX: 8.5, minZ: -14.5, maxZ: -1.5, floorY: 0.35, stepsToZ: -0.6 };

export type BoxCollider = { kind: "box"; minX: number; maxX: number; minZ: number; maxZ: number };
export type CircleCollider = { kind: "circle"; x: number; z: number; r: number };
export type Collider = BoxCollider | CircleCollider;

const box = (minX: number, maxX: number, minZ: number, maxZ: number): BoxCollider => ({
  kind: "box",
  minX,
  maxX,
  minZ,
  maxZ,
});
const circle = (x: number, z: number, r: number): CircleCollider => ({ kind: "circle", x, z, r });

export const HALL_FRONT_COLUMNS_X = [-7.4, -4.4, -1.8, 1.8, 4.4, 7.4];
export const HALL_INNER_COLUMNS: [number, number][] = [
  [-4.4, -6],
  [4.4, -6],
  [-4.4, -10.4],
  [4.4, -10.4],
];
export const LANTERN_POSITIONS: [number, number][] = [
  [-2.6, 16],
  [2.6, 16],
  [-2.6, 10.5],
  [2.6, 10.5],
  [-2.6, 4],
  [2.6, 4],
];
export const TREE_POSITIONS: [number, number, number][] = [
  [-13.8, -3.5, 1.1],
  [13.8, -3.5, 1.0],
  [-13.6, 19.5, 0.9],
  [13.6, 19.5, 1.0],
  [13.8, 9, 0.8],
  [-14, 9.5, 0.85],
];

export const COLLIDERS: Collider[] = [
  // Chánh điện: tường sau, hai tường bên
  box(-8.2, 8.2, -14.2, -13.5),
  box(-8.3, -7.6, -14.2, -2.4),
  box(7.6, 8.3, -14.2, -2.4),
  // Bàn thờ + hương án
  box(-3.3, 3.3, -14, -9.7),
  // Tủ kinh
  box(-7.7, -6.6, -10.4, -7.6),
  // Cột
  ...HALL_FRONT_COLUMNS_X.map((x) => circle(x, -2.6, 0.38)),
  ...HALL_INNER_COLUMNS.map(([x, z]) => circle(x, z, 0.38)),
  // Lư hương
  circle(0, 8, 1.15),
  // Lầu chuông (4 cột)
  circle(8.2, 2.2, 0.3),
  circle(11.8, 2.2, 0.3),
  circle(8.2, 5.8, 0.3),
  circle(11.8, 5.8, 0.3),
  // Ao sen
  circle(-10, 5, 3.6),
  // Cây Bồ Đề
  circle(-10, 12.6, 1.35),
  // Tượng Quán Âm
  circle(10, 14, 1.05),
  // Cây, đèn lồng
  ...TREE_POSITIONS.map(([x, z]) => circle(x, z, 0.6)),
  ...LANTERN_POSITIONS.map(([x, z]) => circle(x, z, 0.18)),
];

export function groundHeight(x: number, z: number): number {
  if (x < HALL.minX || x > HALL.maxX) return 0;
  if (z >= HALL.minZ && z <= HALL.maxZ) return HALL.floorY;
  if (z > HALL.maxZ && z < HALL.stepsToZ) {
    const t = (z - HALL.maxZ) / (HALL.stepsToZ - HALL.maxZ);
    return HALL.floorY * (1 - t);
  }
  return 0;
}

export function getArea(x: number, z: number): AreaId {
  if (x > -8.2 && x < 8.2 && z > -14 && z < -1.6) return "main_hall";
  if (Math.hypot(x - 10, z - 4) < 4.2) return "bell_tower";
  if (Math.hypot(x + 10, z - 5) < 5.2) return "lotus_pond";
  if (Math.hypot(x + 10, z - 14) < 4.4) return "bodhi";
  if (Math.hypot(x - 10, z - 14) < 3.6) return "quan_am";
  return "courtyard";
}

/** Đẩy hình tròn (người chơi) ra khỏi các collider. */
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
          // tâm nằm trong hộp: đẩy ra theo trục gần nhất
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
  pos.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, pos.x));
  pos.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, pos.z));
}
