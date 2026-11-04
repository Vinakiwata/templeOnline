import { readJSON, uid, writeJSON } from "./storage";

/**
 * Guest session được tạo phía client (PRD 7.2).
 * Đây KHÔNG phải danh tính đã xác thực — chỉ dùng để lưu tiến trình trên thiết bị.
 * Khi có backend, guest progress có thể được chuyển sang tài khoản lúc đăng ký.
 */
export interface GuestSession {
  id: string;
  displayName: string;
  createdAt: string;
}

const KEY = "chua.guest";

export function getGuestSession(): GuestSession {
  const existing = readJSON<GuestSession | null>(KEY, null);
  if (existing?.id) return existing;
  const session: GuestSession = {
    id: uid(),
    displayName: "Thiện hữu",
    createdAt: new Date().toISOString(),
  };
  writeJSON(KEY, session);
  return session;
}

export function updateGuestName(displayName: string): GuestSession {
  const session = { ...getGuestSession(), displayName: displayName.trim() || "Thiện hữu" };
  writeJSON(KEY, session);
  return session;
}
