import { Link, NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Trang chủ", icon: "home", end: true },
  { to: "/chua", label: "Vào chùa", icon: "temple", end: false },
  { to: "/kinh", label: "Kinh sách", icon: "book", end: false },
  { to: "/thien", label: "Thiền", icon: "lotus", end: false },
  { to: "/nhat-ky", label: "Nhật ký", icon: "journal", end: false },
] as const;

export function AppLayout() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Chùa Online — trang chủ">
          <img src="/lotus.svg" alt="" width={32} height={32} />
          <span>Chùa Online</span>
        </Link>
        <nav className="topnav" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `topnav__link ${isActive ? "is-active" : ""}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Chùa Online · Không gian tu tập trực tuyến, miễn phí cho mọi người.</p>
        <nav className="footer__links" aria-label="Thông tin">
          <Link to="/nha-phat-trien">Về nhà phát triển</Link>
          <Link to="/kinh">Kinh sách</Link>
          <Link to="/nhat-ky">Nhật ký</Link>
        </nav>
      </footer>
      <nav className="tabbar" aria-label="Điều hướng">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `tabbar__item ${isActive ? "is-active" : ""}`}>
            <NavIcon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "temple":
      return (
        <svg {...common}>
          <path d="M3 9c3 0 5-2 9-5 4 3 6 5 9 5M5 9v11M19 9v11M3 20h18M9 20v-6h6v6M6 13h12" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7" />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path d="M12 5c2 2.5 3 5 0 10-3-5-2-7.5 0-10zM4 10c3 0 6 2 8 5-4 1-7-1-8-5zM20 10c-3 0-6 2-8 5 4 1 7-1 8-5zM4 18h16" />
        </svg>
      );
    case "journal":
      return (
        <svg {...common}>
          <path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM6 3v18M10 8h5M10 12h5" />
        </svg>
      );
  }
}
