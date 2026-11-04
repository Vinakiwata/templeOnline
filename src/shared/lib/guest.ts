import { readJSON, uid, writeJSON } from "./storage";

/**
 * Guest session được tạo phía client (PRD 7.2).
 * Đây KHÔNG phải danh tính đã xác thực — chỉ dùng để lưu tiến trình trên thiết bị.
 * Khi có backend, guest progress có thể được chuyển sang tài khoản lúc đăng ký.
 */
export type Gender = "nam" | "nu";

export interface GuestSession {
  id: string;
  displayName: string;
  gender: Gender;
  /** Người dùng đã tự chọn nhân vật (giới tính + tên) hay chưa. */
  profileChosen: boolean;
  createdAt: string;
}

const KEY = "chua.guest";
export const DEFAULT_NAME = "Tâm Phúc";
/** Tên mặc định của phiên bản cũ — tự đổi sang tên mặc định mới nếu người dùng chưa tự đặt. */
const LEGACY_DEFAULT_NAME = "Thiện hữu";
export const MAX_NAME_LENGTH = 24;

export function getGuestSession(): GuestSession {
  const existing = readJSON<Partial<GuestSession> | null>(KEY, null);
  if (existing?.id) {
    // Bổ sung trường mới cho dữ liệu đã lưu từ phiên bản trước.
    return {
      id: existing.id,
      displayName:
        !existing.displayName || (existing.displayName === LEGACY_DEFAULT_NAME && !existing.profileChosen)
          ? DEFAULT_NAME
          : existing.displayName,
      gender: existing.gender === "nu" ? "nu" : "nam",
      profileChosen: !!existing.profileChosen,
      createdAt: existing.createdAt ?? new Date().toISOString(),
    };
  }
  const session: GuestSession = {
    id: uid(),
    displayName: DEFAULT_NAME,
    gender: "nam",
    profileChosen: false,
    createdAt: new Date().toISOString(),
  };
  writeJSON(KEY, session);
  return session;
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH) || DEFAULT_NAME;
}

export function updateGuestProfile(patch: { displayName?: string; gender?: Gender }): GuestSession {
  const current = getGuestSession();
  const session: GuestSession = {
    ...current,
    displayName: patch.displayName !== undefined ? cleanName(patch.displayName) : current.displayName,
    gender: patch.gender ?? current.gender,
    profileChosen: true,
  };
  writeJSON(KEY, session);
  return session;
}

/** Giữ tương thích với trang Nhật ký. */
export function updateGuestName(displayName: string): GuestSession {
  return updateGuestProfile({ displayName });
}

export const GENDER_LABELS: Record<Gender, string> = { nam: "Nam", nu: "Nữ" };
