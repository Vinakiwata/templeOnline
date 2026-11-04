/** Quality profiles (PRD 10.2). */
export type QualityLevel = "low" | "medium" | "high";

export interface QualityProfile {
  level: QualityLevel;
  label: string;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  antialias: boolean;
  smoke: number; // số hạt khói
  foliageDetail: number;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  low: {
    level: "low",
    label: "Thấp",
    dpr: [0.75, 1],
    shadows: false,
    shadowMapSize: 512,
    antialias: false,
    smoke: 8,
    foliageDetail: 0,
  },
  medium: {
    level: "medium",
    label: "Trung bình",
    dpr: [1, 1.5],
    shadows: true,
    shadowMapSize: 1024,
    antialias: true,
    smoke: 14,
    foliageDetail: 1,
  },
  high: {
    level: "high",
    label: "Cao",
    dpr: [1, 2],
    shadows: true,
    shadowMapSize: 2048,
    antialias: true,
    smoke: 22,
    foliageDetail: 1,
  },
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/** Ước lượng cấu hình thiết bị để chọn profile mặc định. */
export function detectQuality(): QualityLevel {
  if (typeof window === "undefined") return "medium";
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const mem = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (coarse && (mem <= 3 || cores <= 4)) return "low";
  if (coarse) return "medium";
  if (mem <= 4 || cores <= 4) return "medium";
  return "high";
}
