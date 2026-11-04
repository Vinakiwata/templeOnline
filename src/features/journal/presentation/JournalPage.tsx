import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { clearActivityHistory, getActivityHistory, subscribeActivities } from "../application/activityService";
import { GENDER_LABELS, getGuestSession, updateGuestName, updateGuestProfile, type Gender } from "../../../shared/lib/guest";
import { ACTIVITY_LABELS, type ActivityRecord, type ActivityType } from "../../../shared/types/activity";
import { formatDuration, formatRelative } from "../../../shared/lib/format";
import { getSutra } from "../../sutra/data/sutras";
import { getInteractable } from "../../temple/domain/interactables";

/** Nhật ký tu tập + profile cơ bản cho guest. */
export function JournalPage() {
  const [history, setHistory] = useState<ActivityRecord[]>(() => getActivityHistory());
  const [guest, setGuest] = useState(() => getGuestSession());
  const [name, setName] = useState(guest.displayName);

  useEffect(() => subscribeActivities(() => setHistory(getActivityHistory())), []);

  const stats = useMemo(() => {
    const counts: Partial<Record<ActivityType, number>> = {};
    let meditationSeconds = 0;
    const days = new Set<string>();
    for (const a of history) {
      counts[a.activityType] = (counts[a.activityType] ?? 0) + 1;
      if (a.activityType === "meditate") meditationSeconds += Number(a.metadata?.durationSeconds ?? 0);
      days.add(a.completedAt.slice(0, 10));
    }
    return { counts, meditationSeconds, days: days.size };
  }, [history]);

  const saveName = () => {
    const g = updateGuestName(name);
    setGuest(g);
    setName(g.displayName);
  };

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Nhật ký tu tập</p>
        <h1>Xin chào, {guest.displayName}</h1>
        <p className="muted">
          Bạn đang dùng chế độ khách. Dữ liệu được lưu trên thiết bị này; khi có tài khoản, nhật ký có thể đồng bộ giữa các thiết bị.
        </p>
      </header>

      <section className="stats">
        <div className="stat">
          <span className="stat__num">{stats.days}</span>
          <span className="stat__label">Ngày tu tập</span>
        </div>
        <div className="stat">
          <span className="stat__num">{stats.counts.worship ?? 0}</span>
          <span className="stat__label">Lần lễ bái</span>
        </div>
        <div className="stat">
          <span className="stat__num">{stats.counts.read_sutra ?? 0}</span>
          <span className="stat__label">Bài kinh đã đọc</span>
        </div>
        <div className="stat">
          <span className="stat__num">{Math.round(stats.meditationSeconds / 60)}</span>
          <span className="stat__label">Phút thiền</span>
        </div>
      </section>

      <section className="card profile">
        <h2>Hồ sơ</h2>
        <div className="field">
          <span>Nhân vật đi chùa</span>
          <div className="filters" role="radiogroup" aria-label="Giới tính">
            {(["nam", "nu"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={guest.gender === g}
                className={`chip ${guest.gender === g ? "is-active" : ""}`}
                onClick={() => setGuest(updateGuestProfile({ gender: g }))}
              >
                {GENDER_LABELS[g]}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Tên hiển thị</span>
          <div className="field__row">
            <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveName()} />
            <button type="button" className="btn btn--primary" onClick={saveName} disabled={name.trim() === guest.displayName}>
              Lưu
            </button>
          </div>
        </label>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Hoạt động gần đây</h2>
          {history.length > 0 && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                if (window.confirm("Xoá toàn bộ nhật ký trên thiết bị này?")) clearActivityHistory();
              }}
            >
              Xoá nhật ký
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="empty">
            <p>Chưa có hoạt động nào. Hãy bắt đầu bằng một nén tâm hương.</p>
            <Link to="/chua" className="btn btn--primary">
              Vào chùa
            </Link>
          </div>
        ) : (
          <ul className="timeline">
            {history.slice(0, 50).map((a) => (
              <li key={a.id} className={`timeline__item timeline__item--${a.activityType}`}>
                <span className="timeline__dot" />
                <div>
                  <strong>{ACTIVITY_LABELS[a.activityType]}</strong>
                  <span className="timeline__detail">{describe(a)}</span>
                </div>
                <time dateTime={a.completedAt}>{formatRelative(a.completedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function describe(a: ActivityRecord): string {
  if (a.activityType === "read_sutra") return getSutra(a.objectId ?? "")?.title ?? "";
  if (a.activityType === "meditate") {
    const sec = Number(a.metadata?.durationSeconds ?? 0);
    return `${formatDuration(sec)}${a.objectId ? " · dưới cội Bồ Đề" : ""}`;
  }
  return getInteractable(a.objectId ?? null)?.name ?? "";
}
