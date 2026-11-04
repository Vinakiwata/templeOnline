import { useState } from "react";
import { useTempleStore } from "../application/templeStore";
import { DEFAULT_NAME, MAX_NAME_LENGTH, type Gender } from "../../../shared/lib/guest";
import { TEMPLE_NAME } from "../domain/world";

/** Chọn nhân vật người đi chùa: Nam / Nữ và tên hiển thị. */
export function ProfilePanel() {
  const profileChosen = useTempleStore((s) => s.profileChosen);
  const currentName = useTempleStore((s) => s.playerName);
  const currentGender = useTempleStore((s) => s.playerGender);
  const setProfile = useTempleStore((s) => s.setProfile);
  const closePanel = useTempleStore((s) => s.closePanel);
  const [gender, setGender] = useState<Gender>(currentGender);
  const [name, setName] = useState(currentName || DEFAULT_NAME);

  const submit = () => setProfile({ name: name || DEFAULT_NAME, gender });

  return (
    <div className="sheet sheet--profile" role="dialog" aria-label="Chọn nhân vật">
      <p className="eyebrow">{profileChosen ? "Đổi nhân vật" : `Chào mừng đến ${TEMPLE_NAME}`}</p>
      <h2>Người đi chùa hôm nay là ai?</h2>
      <div className="gender-pick" role="radiogroup" aria-label="Giới tính">
        {(["nam", "nu"] as Gender[]).map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={gender === g}
            className={`gender-card ${gender === g ? "is-active" : ""}`}
            onClick={() => setGender(g)}
          >
            <Avatar gender={g} />
            <span>{g === "nam" ? "Nam" : "Nữ"}</span>
          </button>
        ))}
      </div>
      <label className="field">
        <span>Tên của bạn</span>
        <input
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder={DEFAULT_NAME}
          autoComplete="nickname"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <span className="field__hint">Tên hiện trên đầu nhân vật và trong nhật ký. Chỉ lưu trên thiết bị này.</span>
      </label>
      <div className="sheet__footer">
        {profileChosen && (
          <button type="button" className="btn btn--ghost" onClick={closePanel}>
            Huỷ
          </button>
        )}
        <button type="button" className="btn btn--primary" onClick={submit}>
          {profileChosen ? "Lưu" : "Bước vào chùa"}
        </button>
      </div>
    </div>
  );
}

/** Hình minh hoạ đơn giản: người mặc áo tràng lam, nữ vấn tóc. */
function Avatar({ gender }: { gender: Gender }) {
  const female = gender === "nu";
  return (
    <svg viewBox="0 0 80 96" width="72" height="86" aria-hidden="true">
      <ellipse cx="40" cy="90" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      <path d="M22 88 L28 52 Q40 44 52 52 L58 88 Z" fill="#5b6e86" />
      <path d="M28 56 Q40 50 52 56 L50 62 Q40 58 30 62 Z" fill="#4a5b70" />
      <rect x="36" y="38" width="8" height="8" rx="3" fill="#e7c3a0" />
      <circle cx="40" cy="30" r="12" fill="#e7c3a0" />
      {female ? (
        <>
          <path d="M27 30 Q27 15 40 16 Q53 15 53 30 Q50 22 40 22 Q30 22 27 30 Z" fill="#2a211b" />
          <circle cx="40" cy="15" r="6" fill="#2a211b" />
          <circle cx="40" cy="15" r="2" fill="#e9b04d" />
        </>
      ) : (
        <path d="M28 28 Q28 17 40 17 Q52 17 52 28 Q48 22 40 22 Q32 22 28 28 Z" fill="#2a211b" />
      )}
    </svg>
  );
}
