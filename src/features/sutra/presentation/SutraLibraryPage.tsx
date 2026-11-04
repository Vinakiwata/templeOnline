import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SUTRAS, type Sutra } from "../data/sutras";
import { getAllProgress } from "../application/sutraProgress";

const FILTERS: ("Tất cả" | Sutra["category"])[] = ["Tất cả", "Kinh", "Kệ", "Giáo lý"];

/** Thư viện kinh (SUT-001). Đọc kinh không cần vào chùa 3D (PRD 3.5). */
export function SutraLibraryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tất cả");
  const progress = useMemo(() => getAllProgress(), []);
  const list = SUTRAS.filter((s) => filter === "Tất cả" || s.category === filter);

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Kinh sách</p>
        <h1>Thư viện kinh</h1>
        <p className="muted">Đọc ở bất cứ đâu, không cần vào chùa 3D. Tiến trình được lưu trên thiết bị này.</p>
      </header>

      <div className="filters" role="tablist" aria-label="Lọc theo loại">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`chip ${filter === f ? "is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="sutra-list">
        {list.map((s) => {
          const p = progress[s.id];
          const status = p?.completedAt ? "Đã đọc xong" : p ? "Đang đọc" : null;
          return (
            <li key={s.id}>
              <Link to={`/kinh/${s.id}`} className="sutra-item">
                <div className="sutra-item__main">
                  <span className="sutra-item__cat">{s.category}</span>
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                </div>
                <div className="sutra-item__meta">
                  <span>{s.readingMinutes} phút</span>
                  {status && <span className={`badge ${p?.completedAt ? "badge--done" : ""}`}>{status}</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
