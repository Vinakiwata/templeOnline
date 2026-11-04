import * as THREE from "three";

/**
 * Vật liệu dùng chung — tái sử dụng để giảm số lượng material/shader
 * và draw-call state changes (PRD 10.3).
 */
const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });

export const M = {
  grass: std("#7f9150", { roughness: 1 }),
  courtyard: std("#d9c4a0", { roughness: 0.95 }),
  pathStone: std("#bdb3a3", { roughness: 0.9 }),
  stone: std("#a99f90", { roughness: 0.9 }),
  stoneDark: std("#7d7468", { roughness: 0.9 }),
  ochreWall: std("#e2b24f", { roughness: 0.8 }),
  ochreWallDark: std("#c8973a", { roughness: 0.85 }),
  lacquer: std("#9b2a22", { roughness: 0.45 }),
  lacquerDark: std("#6e1c17", { roughness: 0.5 }),
  roofTile: std("#5a4638", { roughness: 0.75, flatShading: true, side: THREE.DoubleSide }),
  roofTileDark: std("#3f3129", { roughness: 0.8 }),
  floorTile: std("#8e432d", { roughness: 0.6 }),
  wood: std("#5b3a22", { roughness: 0.7 }),
  woodLight: std("#8a5a33", { roughness: 0.7 }),
  gold: std("#d6a03d", { roughness: 0.38, metalness: 0.45, emissive: "#3b2604", emissiveIntensity: 0.6 }),
  goldBright: std("#f0c25a", { roughness: 0.3, metalness: 0.4, emissive: "#6b4708", emissiveIntensity: 0.8 }),
  bronze: std("#6f4c2c", { roughness: 0.45, metalness: 0.55 }),
  bronzeDark: std("#4a3220", { roughness: 0.5, metalness: 0.5 }),
  whiteJade: std("#f2eee5", { roughness: 0.55 }),
  water: std("#4f8789", { roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.88 }),
  lilyPad: std("#4f7d3a", { roughness: 0.8 }),
  lotusPink: std("#f1a6b5", { roughness: 0.6, emissive: "#40121a", emissiveIntensity: 0.25 }),
  lotusCenter: std("#f2cd4e", { roughness: 0.6 }),
  leaf: std("#4d7a3b", { roughness: 0.9, flatShading: true }),
  leafDark: std("#3d6531", { roughness: 0.9, flatShading: true }),
  trunk: std("#5d4532", { roughness: 1 }),
  cushion: std("#c98a2b", { roughness: 0.9 }),
  lanternRed: std("#cf3b2b", { roughness: 0.6, emissive: "#ff5a2a", emissiveIntensity: 0.9 }),
  candle: std("#f4ead8", { roughness: 0.6 }),
  flame: new THREE.MeshBasicMaterial({ color: "#ffcf6b" }),
  incenseTip: new THREE.MeshBasicMaterial({ color: "#ff6a2a" }),
  incenseStick: std("#b8452e", { roughness: 0.8 }),
  // Nhân vật
  robe: std("#5b6e86", { roughness: 0.85 }),
  robeDark: std("#4a5b70", { roughness: 0.85 }),
  skin: std("#e7c3a0", { roughness: 0.75 }),
  hair: std("#2a211b", { roughness: 0.9 }),
  shoe: std("#2f2a26", { roughness: 0.9 }),
  halo: new THREE.MeshBasicMaterial({ color: "#ffd98a", transparent: true, opacity: 0.32, depthWrite: false }),
  book: [std("#7d2a1f"), std("#2f4f6b"), std("#7a6a2e"), std("#3c5a3f")],
};
