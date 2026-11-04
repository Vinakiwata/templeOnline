import { readJSON, writeJSON } from "../../../shared/lib/storage";

/**
 * Tiến trình đọc kinh (bảng sutra_progress trong PRD).
 * Production: PUT /api/v1/sutras/:id/progress khi đã đăng nhập.
 */
export interface SutraProgress {
  sutraId: string;
  currentPosition: number; // index section đang đọc
  completedAt: string | null;
  updatedAt: string;
}

const KEY = "chua.sutraProgress";

type ProgressMap = Record<string, SutraProgress>;

export function getAllProgress(): ProgressMap {
  return readJSON<ProgressMap>(KEY, {});
}

export function getProgress(sutraId: string): SutraProgress | null {
  return getAllProgress()[sutraId] ?? null;
}

export function saveProgress(sutraId: string, patch: Partial<Omit<SutraProgress, "sutraId">>) {
  const all = getAllProgress();
  const prev = all[sutraId] ?? {
    sutraId,
    currentPosition: 0,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
  all[sutraId] = { ...prev, ...patch, sutraId, updatedAt: new Date().toISOString() };
  writeJSON(KEY, all);
  return all[sutraId];
}
