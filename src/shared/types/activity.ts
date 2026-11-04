/**
 * Shared types — tương ứng packages/shared-types trong monorepo (PRD mục 8).
 * Khi tách backend NestJS, file này có thể chuyển sang package dùng chung.
 */
export type InteractionAction =
  | "worship"
  | "kneel_bow"
  | "offer_flower"
  | "light_incense"
  | "ring_bell"
  | "beat_drum"
  | "listen_dharma"
  | "have_meal"
  | "read_sutra"
  | "meditate"
  | "learn";

export type ActivityType = Exclude<InteractionAction, "learn">;

export interface ActivityRecord {
  id: string;
  activityType: ActivityType;
  templeId: string;
  objectId?: string;
  completedAt: string;
  metadata?: Record<string, unknown>;
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  worship: "Vái lạy",
  kneel_bow: "Quỳ lạy",
  offer_flower: "Dâng hoa",
  light_incense: "Thắp hương",
  ring_bell: "Thỉnh chuông",
  beat_drum: "Đánh trống",
  listen_dharma: "Nghe giảng",
  have_meal: "Thọ trai",
  read_sutra: "Đọc kinh",
  meditate: "Thiền định",
};
