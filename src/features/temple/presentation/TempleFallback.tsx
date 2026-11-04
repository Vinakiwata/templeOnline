import { Link } from "react-router-dom";

/** Fallback khi thiết bị không chạy được 3D (TEM-006, PER-005). */
export function TempleFallback({ reason }: { reason: "webgl" | "error" | "lost" }) {
  const message =
    reason === "webgl"
      ? "Thiết bị hoặc trình duyệt này chưa hỗ trợ WebGL nên không thể mở chùa 3D."
      : reason === "lost"
        ? "Trình duyệt đã tạm dừng đồ hoạ 3D (có thể do thiếu bộ nhớ)."
        : "Đã có lỗi khi khởi tạo không gian 3D.";
  return (
    <div className="fallback">
      <div className="fallback__card">
        <p className="eyebrow">Chùa Online</p>
        <h1>Cửa chùa vẫn luôn mở</h1>
        <p>{message} Bạn vẫn có thể đọc kinh và ngồi thiền như bình thường.</p>
        <div className="fallback__actions">
          <Link to="/kinh" className="btn btn--primary">
            Đọc kinh
          </Link>
          <Link to="/thien" className="btn btn--ghost">
            Ngồi thiền
          </Link>
          {reason !== "webgl" && (
            <button type="button" className="btn btn--ghost" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          )}
        </div>
        <Link to="/" className="fallback__home">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
