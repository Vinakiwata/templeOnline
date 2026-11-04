import type { ActivityRecord, ActivityType } from "../../../shared/types/activity";
import { readJSON, removeKey, uid, writeJSON } from "../../../shared/lib/storage";

/**
 * Application service cho hoạt động tu tập.
 *
 * Prototype: lưu trên thiết bị (localStorage) cho guest.
 * Production: thay phần thân bằng `POST /api/v1/activities` và
 * `GET /api/v1/activities/history` (PRD mục 7). Interface giữ nguyên nên
 * UI và game không cần sửa.
 */
const KEY = "chua.activities";
const MAX = 500;
export const TEMPLE_ID = "temple-main";

type Listener = () => void;
const listeners = new Set<Listener>();

export interface RecordActivityInput {
  activityType: ActivityType;
  templeId?: string;
  objectId?: string;
  metadata?: Record<string, unknown>;
}

export function recordActivity(input: RecordActivityInput): ActivityRecord {
  const record: ActivityRecord = {
    id: uid(),
    activityType: input.activityType,
    templeId: input.templeId ?? TEMPLE_ID,
    objectId: input.objectId,
    completedAt: new Date().toISOString(),
    metadata: input.metadata,
  };
  const list = readJSON<ActivityRecord[]>(KEY, []);
  list.unshift(record);
  writeJSON(KEY, list.slice(0, MAX));
  listeners.forEach((l) => l());
  return record;
}

export function getActivityHistory(): ActivityRecord[] {
  return readJSON<ActivityRecord[]>(KEY, []);
}

export function clearActivityHistory() {
  removeKey(KEY);
  listeners.forEach((l) => l());
}

export function subscribeActivities(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
