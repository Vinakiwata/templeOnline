import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTempleStore } from "../application/templeStore";
import { ACTION_LABELS, getInteractable } from "../domain/interactables";
import { AREA_LABELS } from "../domain/world";
import { endTempleMeditation, startAction } from "../application/actionHandler";
import { QUALITY_PROFILES, type QualityLevel } from "../game/systems/quality";
import { MeditationTimer } from "../../meditation/presentation/MeditationTimer";
import { isPlayerBusy } from "../game/systems/runtime";
import { MapPanel, MiniMap } from "./TempleMap";
import { DharmaPanel } from "./DharmaPanel";
import { ProfilePanel } from "./ProfilePanel";
import { MealPanel } from "./MealPanel";

export function TempleHud({ isTouch }: { isTouch: boolean }) {
  const navigate = useNavigate();
  const area = useTempleStore((s) => s.currentArea);
  const nearbyId = useTempleStore((s) => s.nearbyId);
  const panel = useTempleStore((s) => s.panel);
  const panelTargetId = useTempleStore((s) => s.panelTargetId);
  const busy = useTempleStore((s) => s.busy);
  const toast = useTempleStore((s) => s.toast);
  const soundOn = useTempleStore((s) => s.soundOn);
  const showFps = useTempleStore((s) => s.showFps);
  const { openPanel, closePanel, setSound, clearToast } = useTempleStore.getState();

  const nearby = getInteractable(nearbyId);
  const target = getInteractable(panelTargetId) ?? nearby;

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 4600);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  // Quản lý focus: mở bảng thì đưa focus vào hành động đầu tiên,
  // đóng bảng thì trả focus về chỗ cũ (WCAG 2.4.3).
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (panel === "none") {
      const el = returnFocus.current;
      returnFocus.current = null;
      if (el && el !== document.body && document.contains(el)) el.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    if (active && !active.closest(".sheet")) returnFocus.current = active;
    const raf = requestAnimationFrame(() => {
      const sheet = document.querySelector<HTMLElement>(".hud .sheet");
      if (!sheet || sheet.contains(document.activeElement)) return;
      const first =
        sheet.querySelector<HTMLElement>(
          '[data-autofocus], .action-btn, input, [role="radio"][aria-checked="true"], button:not(.icon-close), a[href]',
        ) ?? sheet.querySelector<HTMLElement>(".icon-close");
      if (!first) sheet.tabIndex = -1;
      (first ?? sheet).focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [panel, panelTargetId]);

  const openMenu = () => {
    if (nearby && !isPlayerBusy()) openPanel("menu", nearby.id);
  };

  return (
    <div className="hud">
      {/* Thanh trên */}
      <div className="hud__top">
        <Link to="/" className="hud-btn" aria-label="Rời chùa">
          <span aria-hidden="true">←</span>
          <span className="hud-btn__label">Rời chùa</span>
        </Link>
        <div className="hud__area" aria-live="polite">
          <span className="hud__area-dot" />
          {AREA_LABELS[area]}
        </div>
        <div className="hud__top-right">
          {showFps && <span id="fps-meter" className="hud__fps">— FPS</span>}
          <button
            type="button"
            className="hud-btn hud-btn--icon"
            aria-label="Âm thanh"
            aria-pressed={soundOn}
            onClick={() => setSound(!soundOn)}
          >
            {soundOn ? <IconSound /> : <IconMute />}
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--icon"
            aria-label="Bản đồ"
            aria-expanded={panel === "map"}
            onClick={() => openPanel(panel === "map" ? "none" : "map")}
          >
            <IconMap />
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--icon"
            aria-label="Cài đặt"
            aria-expanded={panel === "settings"}
            onClick={() => openPanel(panel === "settings" ? "none" : "settings")}
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {!isTouch && panel === "none" && <MiniMap />}

      {/* Toast */}
      {toast && (
        <div className="hud__toast" key={toast.id} role="status">
          <strong>{toast.title}</strong>
          {toast.text && <span>{toast.text}</span>}
        </div>
      )}

      {/* Gợi ý tương tác */}
      {nearby && panel === "none" && !busy && (
        <div className={`hud__prompt ${isTouch ? "hud__prompt--touch" : ""}`}>
          {isTouch ? (
            <button type="button" className="interact-btn" onClick={openMenu}>
              <span className="interact-btn__ring" />
              <span className="interact-btn__label">{nearby.name}</span>
              <span className="interact-btn__cta">Chạm để tương tác</span>
            </button>
          ) : (
            <button type="button" className="prompt" onClick={openMenu}>
              <kbd>E</kbd>
              <span>
                <strong>{nearby.name}</strong>
                <small>{nearby.summary}</small>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Menu hành động */}
      {panel === "menu" && target && (
        <div className="sheet" role="dialog" aria-label={target.name}>
          <div className="sheet__head">
            <div>
              <p className="eyebrow">{target.summary}</p>
              <h2>{target.name}</h2>
            </div>
            <button type="button" className="icon-close" aria-label="Đóng" onClick={closePanel}>
              ×
            </button>
          </div>
          <div className="sheet__actions">
            {target.actions.map((action) => (
              <button
                key={action}
                type="button"
                className={`action-btn ${action === "learn" ? "action-btn--quiet" : ""}`}
                onClick={() => startAction(action, target, { navigate })}
              >
                <span className="action-btn__label">{ACTION_LABELS[action].label}</span>
                <span className="action-btn__hint">{ACTION_LABELS[action].hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin tìm hiểu */}
      {panel === "info" && target && (
        <div className="sheet sheet--info" role="dialog" aria-label={target.name}>
          <div className="sheet__head">
            <div>
              <p className="eyebrow">Tìm hiểu</p>
              <h2>{target.name}</h2>
            </div>
            <button type="button" className="icon-close" aria-label="Đóng" onClick={closePanel}>
              ×
            </button>
          </div>
          <p className="sheet__body">{target.description}</p>
          <div className="sheet__footer">
            <button type="button" className="btn btn--ghost" onClick={() => openPanel("menu", target.id)}>
              ← Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Thiền trong chùa */}
      {panel === "meditation" && (
        <div className="sheet sheet--meditation" role="dialog" aria-label="Thiền định">
          <MeditationTimer place="temple" variant="overlay" onClose={endTempleMeditation} />
        </div>
      )}

      {panel === "profile" && <ProfilePanel />}
      {panel === "meal" && <MealPanel />}
      {panel === "map" && <MapPanel onClose={closePanel} />}
      {panel === "dharma" && <DharmaPanel onClose={closePanel} />}
      {panel === "settings" && <SettingsPanel onClose={closePanel} onHelp={() => openPanel("help")} />}
      {panel === "help" && <HelpPanel isTouch={isTouch} onClose={closePanel} />}
    </div>
  );
}

function SettingsPanel({ onClose, onHelp }: { onClose: () => void; onHelp: () => void }) {
  const quality = useTempleStore((s) => s.quality);
  const showFps = useTempleStore((s) => s.showFps);
  const soundOn = useTempleStore((s) => s.soundOn);
  const { setQuality, setShowFps, setSound } = useTempleStore.getState();
  return (
    <div className="sheet sheet--settings" role="dialog" aria-label="Cài đặt">
      <div className="sheet__head">
        <div>
          <p className="eyebrow">Cài đặt</p>
          <h2>Trải nghiệm</h2>
        </div>
        <button type="button" className="icon-close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>
      </div>
      <fieldset className="field">
        <legend>Chất lượng hình ảnh</legend>
        <div className="seg">
          {(Object.keys(QUALITY_PROFILES) as QualityLevel[]).map((q) => (
            <button
              key={q}
              type="button"
              className={`seg__item ${quality === q ? "is-active" : ""}`}
              onClick={() => setQuality(q)}
            >
              {QUALITY_PROFILES[q].label}
            </button>
          ))}
        </div>
        <p className="field__hint">Chọn “Thấp” nếu máy nóng hoặc hình bị giật.</p>
      </fieldset>
      <label className="toggle">
        <input type="checkbox" checked={soundOn} onChange={(e) => setSound(e.target.checked)} />
        <span>Âm thanh chùa</span>
      </label>
      <label className="toggle">
        <input type="checkbox" checked={showFps} onChange={(e) => setShowFps(e.target.checked)} />
        <span>Hiển thị FPS (kiểm thử hiệu năng)</span>
      </label>
      <div className="sheet__footer">
        <button type="button" className="btn btn--ghost" onClick={() => useTempleStore.getState().openPanel("profile")}>
          Đổi nhân vật
        </button>
        <button type="button" className="btn btn--ghost" onClick={onHelp}>
          Hướng dẫn điều khiển
        </button>
        <Link to="/kinh" className="btn btn--ghost">
          Thư viện kinh
        </Link>
      </div>
    </div>
  );
}

function HelpPanel({ isTouch, onClose }: { isTouch: boolean; onClose: () => void }) {
  return (
    <div className="sheet sheet--help" role="dialog" aria-label="Hướng dẫn">
      <p className="eyebrow">Chào mừng đến Chùa Online</p>
      <h2>Bước chậm, nhìn quanh, và dừng lại nơi bạn muốn.</h2>
      {isTouch ? (
        <ul className="help-list">
          <li>
            <span className="help-key">Nửa trái</span> Chạm và kéo để đi
          </li>
          <li>
            <span className="help-key">Nửa phải</span> Vuốt để xoay góc nhìn
          </li>
          <li>
            <span className="help-key">Nút tròn</span> Tương tác khi đến gần tượng, chuông, lư hương
          </li>
        </ul>
      ) : (
        <ul className="help-list">
          <li>
            <span className="help-key">W A S D</span> Đi lại (hoặc phím mũi tên)
          </li>
          <li>
            <span className="help-key">Shift</span> Đi nhanh — trong chánh điện luôn đi chậm
          </li>
          <li>
            <span className="help-key">Kéo chuột</span> Xoay góc nhìn · Lăn chuột: gần / xa
          </li>
          <li>
            <span className="help-key">E</span> Tương tác · <span className="help-key">Esc</span> Menu
          </li>
        </ul>
      )}
      <p className="muted">
        Bạn bắt đầu ở chân đồi Thiện Phúc Tự. Đi theo con đường lên cổng Tam quan, dâng hương giữa sân, rồi lần lượt vào Tiền đường,
        Thiêu hương và Thượng điện. Mở <strong>Bản đồ</strong> để đi nhanh tới bất kỳ khu nào.
      </p>
      <div className="sheet__footer">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Vào chùa
        </button>
      </div>
    </div>
  );
}

function IconSound() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" stroke="none" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}
function IconMute() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
