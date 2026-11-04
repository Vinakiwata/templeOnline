import { recordActivity } from "../../journal/application/activityService";

export const MEDITATION_DURATIONS = [3, 5, 10, 15] as const; // phút (PRD 3.6)

export interface MeditationResult {
  plannedSeconds: number;
  actualSeconds: number;
  completed: boolean;
  place: "temple" | "page";
}

/**
 * Lưu phiên thiền. Người dùng có thể dừng bất cứ lúc nào — không bị "phạt",
 * phiên ngắn hơn 20 giây không được ghi để tránh dữ liệu nhiễu.
 * Production: POST /api/v1/meditation/sessions
 */
export function saveMeditationSession(result: MeditationResult) {
  if (result.actualSeconds < 20) return null;
  return recordActivity({
    activityType: "meditate",
    objectId: result.place === "temple" ? "bodhi-meditation" : undefined,
    metadata: {
      durationSeconds: Math.round(result.actualSeconds),
      plannedSeconds: result.plannedSeconds,
      completed: result.completed,
    },
  });
}
