import { Link } from "react-router-dom";
import { CREDITS, PROJECT, ROADMAP, TEAM, TECH_STACK, isFilled, type TeamMember } from "../data/developer";

/**
 * Trang "Nhà phát triển" (/nha-phat-trien).
 * Nội dung lấy từ data/developer.ts. Khi chạy dev, các mục chưa điền được tô vàng để dễ nhận ra;
 * ở bản build production, mục chưa điền sẽ tự ẩn.
 */
const SHOW_PLACEHOLDERS = import.meta.env.DEV;

function Text({ value, as: Tag = "p", className = "" }: { value: string; as?: "p" | "span" | "h2" | "h3"; className?: string }) {
  if (isFilled(value)) return <Tag className={className}>{value}</Tag>;
  if (!SHOW_PLACEHOLDERS || !value.trim()) return null;
  return (
    <Tag className={`${className} placeholder`} title="Chưa điền — sửa trong src/features/about/data/developer.ts">
      {value}
    </Tag>
  );
}

export function DeveloperPage() {
  const email = isFilled(PROJECT.contactEmail) ? PROJECT.contactEmail : "";
  return (
    <div className="container about">
      <header className="page-head">
        <p className="eyebrow">Nhà phát triển</p>
        <h1>Về Chùa Online</h1>
        <p className="about__lead">{PROJECT.mission}</p>
      </header>

      {SHOW_PLACEHOLDERS && (
        <p className="about__devnote">
          Chế độ phát triển: các mục tô vàng chưa được điền. Sửa trong <code>src/features/about/data/developer.ts</code> — ở bản
          build chính thức, mục chưa điền sẽ tự ẩn.
        </p>
      )}

      <section className="about__block">
        <h2 className="section__title">Câu chuyện</h2>
        <Text value={PROJECT.story} className="about__story" />
      </section>

      <section className="about__block">
        <h2 className="section__title">{TEAM.length > 1 ? "Đội ngũ" : "Người thực hiện"}</h2>
        <div className="team">
          {TEAM.map((m, i) => (
            <MemberCard key={i} member={m} />
          ))}
        </div>
      </section>

      <section className="about__block">
        <h2 className="section__title">Nguyên tắc</h2>
        <div className="principles">
          {PROJECT.principles.map((p) => (
            <div key={p.title} className="principle">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about__block about__grid">
        <div>
          <h2 className="section__title">Lộ trình</h2>
          <ol className="roadmap">
            {ROADMAP.map((r) => (
              <li key={r.phase} className={`roadmap__item roadmap__item--${r.status}`}>
                <span className="roadmap__dot" />
                <div>
                  <span className="roadmap__phase">
                    {r.phase}
                    {r.status === "current" && <span className="badge">Đang làm</span>}
                    {r.status === "done" && <span className="badge badge--done">Xong</span>}
                  </span>
                  <strong>{r.title}</strong>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="section__title">Công nghệ</h2>
          <div className="stack">
            {TECH_STACK.map((g) => (
              <div key={g.group} className="stack__group">
                <span className="stack__label">{g.group}</span>
                <div className="stack__items">
                  {g.items.map((it) => (
                    <span key={it} className="tag">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about__block contact card">
        <div>
          <h2 className="section__title">Góp ý & liên hệ</h2>
          <p className="muted">
            Chùa Online đang ở giai đoạn thử nghiệm. Mọi góp ý về trải nghiệm, nội dung kinh sách hay lỗi kỹ thuật đều rất quý.
          </p>
          {!email && SHOW_PLACEHOLDERS && <p className="placeholder">{PROJECT.contactEmail}</p>}
        </div>
        <div className="contact__actions">
          {email && (
            <a className="btn btn--primary" href={`mailto:${email}?subject=${encodeURIComponent("Góp ý Chùa Online")}`}>
              Gửi email góp ý
            </a>
          )}
          {isFilled(PROJECT.feedbackUrl) && (
            <a className="btn btn--ghost" href={PROJECT.feedbackUrl} target="_blank" rel="noreferrer">
              Mẫu góp ý
            </a>
          )}
          {isFilled(PROJECT.sourceUrl) && (
            <a className="btn btn--ghost" href={PROJECT.sourceUrl} target="_blank" rel="noreferrer">
              Mã nguồn
            </a>
          )}
          <Link to="/chua" className="btn btn--ghost">
            Vào chùa
          </Link>
        </div>
      </section>

      <section className="about__block">
        <h2 className="section__title">Ghi nhận</h2>
        <ul className="credits">
          {CREDITS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="about__version">
          {PROJECT.name} · phiên bản {PROJECT.version}
        </p>
      </section>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const links = member.links.filter((l) => isFilled(l.url));
  const pendingLinks = member.links.filter((l) => !isFilled(l.url));
  return (
    <article className="member card">
      <div className="member__avatar" aria-hidden="true">
        {member.avatar ? <img src={member.avatar} alt="" /> : <span>{member.initials}</span>}
      </div>
      <div className="member__body">
        <Text value={member.name} as="h3" className="member__name" />
        <Text value={member.role} className="member__role" />
        <Text value={member.bio} className="member__bio" />
        {member.highlights && member.highlights.length > 0 && (
          <div className="member__highlights">
            {member.highlights.map((h) => (
              <span key={h} className="tag tag--accent">
                {h}
              </span>
            ))}
          </div>
        )}
        {(links.length > 0 || (SHOW_PLACEHOLDERS && pendingLinks.length > 0)) && (
          <div className="member__links">
            {links.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="tag tag--link">
                {l.label} ↗
              </a>
            ))}
            {SHOW_PLACEHOLDERS &&
              pendingLinks.map((l) => (
                <span key={l.label} className="tag placeholder" title="Chưa có URL">
                  {l.label}
                </span>
              ))}
          </div>
        )}
      </div>
    </article>
  );
}
