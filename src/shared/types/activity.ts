/**
 * Shared types — tương ứng packages/shared-types trong monorepo (PRD mục 8).
 * Khi tách backend NestJS, file này có thể chuyển sang package dùng chung.
 */
export type InteractionAction =
  | "worship"
  | "offer_flower"
  | "light_incense"
  | "ring_bell"
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
  worship: "Lễ bái",
  offer_flower: "Dâng hoa",
  light_incense: "Thắp hương",
  ring_bell: "Thỉnh chuông",
  read_sutra: "Đọc kinh",
  meditate: "Thiền định",
};
