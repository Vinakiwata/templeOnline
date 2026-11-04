import { Link } from "react-router-dom";
import { SHORT_SERVICE, getSutra } from "../sutra/data/sutras";

const CARDS = [
  {
    to: "/chua",
    title: "Vào chùa 3D",
    text: "Đi qua cổng tam quan, dâng hương, thỉnh chuông và lễ Phật trong chánh điện.",
    tag: "Trải nghiệm",
  },
  {
    to: "/kinh",
    title: "Đọc kinh",
    text: "Tâm Kinh, kệ khai kinh, hồi hướng — đọc trên điện thoại, có thể nghe đọc to.",
    tag: "Kinh sách",
  },
  {
    to: "/thien",
    title: "Thiền định",
    text: "Phiên thiền 3, 5, 10 hoặc 15 phút với hơi thở được dẫn dắt nhẹ nhàng.",
    tag: "An tịnh",
  },
  {
    to: "/nhat-ky",
    title: "Nhật ký tu tập",
    text: "Xem lại những lần lễ bái, đọc kinh và thiền định của bạn.",
    tag: "Hành trình",
  },
];

export function HomePage() {
  const service = SHORT_SERVICE.map((id) => getSutra(id)!).filter(Boolean);
  return (
    <div className="home">
      <section className="hero">
        <div className="hero__art" aria-hidden="true">
          <TempleSilhouette />
        </div>
        <div className="hero__content">
          <p className="eyebrow eyebrow--light">Thiện Phúc Tự · Chùa Online</p>
          <h1>
            Một ngôi chùa
            <br />
            luôn mở cửa.
          </h1>
          <p className="hero__lead">
            Ghé thăm chùa bất cứ lúc nào: lễ bái, đọc kinh, ngồi thiền và tìm lại sự bình an — ngay trên trình duyệt.
          </p>
          <div className="hero__actions">
            <Link to="/chua" className="btn btn--gold btn--lg">
              Bước vào chùa
            </Link>
            <Link to="/kinh" className="btn btn--light btn--lg">
              Đọc kinh
            </Link>
          </div>
          <p className="hero__note">Không cần đăng ký · Miễn phí</p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Hôm nay bạn muốn…</h2>
        <div className="cards">
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to} className="card card--link">
              <span className="card__tag">{c.tag}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span className="card__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--split">
        <div>
          <h2 className="section__title">Thời kinh ngắn</h2>
          <p className="muted">Khoảng 6 phút. Phù hợp buổi sáng trước khi làm việc hoặc buổi tối trước khi ngủ.</p>
        </div>
        <ol className="service">
          {service.map((s, i) => (
            <li key={s.id}>
              <Link to={`/kinh/${s.id}`} className="service__item">
                <span className="service__num">{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.subtitle}</small>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function TempleSilhouette() {
  return (
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a2418" />
          <stop offset="0.55" stopColor="#8d4a26" />
          <stop offset="1" stopColor="#e3a157" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="1" stopColor="#ffe3a3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#sky)" />
      <circle cx="560" cy="250" r="120" fill="url(#sun)" opacity="0.7" />
      <circle cx="560" cy="250" r="34" fill="#ffe0a0" opacity="0.9" />
      <g fill="#2a1912">
        {/* mái tầng trên */}
        <path d="M300 205 Q330 196 345 172 L455 172 Q470 196 500 205 Q505 196 512 194 L500 212 L300 212 L288 194 Q295 196 300 205 Z" />
        <rect x="355" y="212" width="90" height="16" />
        {/* mái tầng dưới */}
        <path d="M230 262 Q275 250 300 226 L500 226 Q525 250 570 262 Q578 250 586 247 L570 272 L230 272 L214 247 Q222 250 230 262 Z" />
        <rect x="250" y="272" width="300" height="80" />
        <circle cx="400" cy="160" r="7" />
        {/* tam quan + tường */}
        <rect x="0" y="330" width="800" height="70" />
        <path d="M80 330 Q100 322 108 308 L172 308 Q180 322 200 330 Z" />
        <path d="M620 330 Q640 322 648 308 L712 308 Q720 322 740 330 Z" />
        {/* cây */}
        <circle cx="130" cy="270" r="50" />
        <circle cx="95" cy="295" r="38" />
        <circle cx="690" cy="275" r="46" />
        <circle cx="730" cy="300" r="34" />
      </g>
      <g fill="#f3b25a" opacity="0.85">
        <rect x="390" y="292" width="20" height="30" rx="10" />
        <rect x="320" y="296" width="14" height="22" rx="7" />
        <rect x="466" y="296" width="14" height="22" rx="7" />
      </g>
    </svg>
  );
}
