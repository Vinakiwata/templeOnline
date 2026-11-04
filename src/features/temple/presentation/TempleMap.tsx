import { useEffect, useMemo, useRef } from "react";
import { BUILDINGS, COMPOUND, LANDMARKS, POND_RADIUS, POS, ROAD, groundHeight, roadX, type Landmark } from "../domain/world";
import { cameraState, isPlayerBusy, playerRuntime } from "../game/systems/runtime";
import { useTempleStore } from "../application/templeStore";

/** Dịch chuyển nhanh tới một địa điểm (không dùng khi đang hành lễ / thiền). */
export function teleportTo(l: Landmark) {
  if (isPlayerBusy() || playerRuntime.mode === "meditating") return false;
  playerRuntime.position.set(l.x, groundHeight(l.x, l.z), l.z);
  playerRuntime.rotationY = l.facing;
  playerRuntime.speed = 0;
  cameraState.yaw = l.facing + Math.PI;
  cameraState.lastManual = performance.now();
  return true;
}

const VIEW = { minX: -40, maxX: 40, minZ: -80, maxZ: ROAD.endZ + 2 };

/** Bản đồ khuôn viên (SVG). Mũi tên người chơi cập nhật qua requestAnimationFrame, không qua React state. */
export function MapSvg({ onPick, showLabels = false }: { onPick?: (l: Landmark) => void; showLabels?: boolean }) {
  const marker = useRef<SVGGElement>(null);
  const roadPath = useMemo(() => {
    const pts: string[] = [];
    for (let z = ROAD.endZ; z >= COMPOUND.maxZ; z -= 2) pts.push(`${roadX(z).toFixed(2)},${z}`);
    return pts.join(" ");
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = playerRuntime.position;
      const r = playerRuntime.rotationY;
      const angle = (Math.atan2(Math.sin(r), -Math.cos(r)) * 180) / Math.PI;
      marker.current?.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.z.toFixed(2)}) rotate(${angle.toFixed(1)})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const fill = (kind: string) =>
    kind === "worship" ? "#9b2a22" : kind === "corridor" ? "#b0763a" : kind === "gate" ? "#c9973a" : "#8a7a62";

  return (
    <svg
      className="map-svg"
      viewBox={`${VIEW.minX} ${VIEW.minZ} ${VIEW.maxX - VIEW.minX} ${VIEW.maxZ - VIEW.minZ}`}
      role="img"
      aria-label="Bản đồ khuôn viên chùa"
    >
      <rect x={VIEW.minX} y={VIEW.minZ} width={VIEW.maxX - VIEW.minX} height={VIEW.maxZ - VIEW.minZ} fill="#7f9a52" />
      <polyline points={roadPath} fill="none" stroke="#d8ccb4" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <rect
        x={COMPOUND.minX}
        y={COMPOUND.minZ}
        width={COMPOUND.maxX - COMPOUND.minX}
        height={COMPOUND.maxZ - COMPOUND.minZ}
        fill="#e4d3b2"
        stroke="#a8873f"
        strokeWidth={0.8}
      />
      <circle cx={POS.quanAm[0]} cy={POS.quanAm[1]} r={POND_RADIUS} fill="#5f97a0" />
      <circle cx={POS.bodhi[0]} cy={POS.bodhi[1]} r={2.6} fill="#4c7a3a" />
      <circle cx={POS.baoThap[0]} cy={POS.baoThap[1]} r={3} fill="#efe3c8" stroke="#8a7a62" strokeWidth={0.6} />
      <circle cx={POS.incense[0]} cy={POS.incense[1]} r={1.2} fill="#6f4c2c" />
      {BUILDINGS.map((b) => (
        <rect
          key={b.id}
          x={b.minX}
          y={b.minZ}
          width={b.maxX - b.minX}
          height={b.maxZ - b.minZ}
          rx={0.4}
          fill={fill(b.kind)}
          opacity={0.92}
        />
      ))}
      {showLabels &&
        LANDMARKS.filter((l) => l.id !== "chan_doi").map((l) => (
          <g key={l.id} className="map-pin" onClick={() => onPick?.(l)}>
            <circle cx={l.x} cy={l.z} r={1.6} />
            <text x={l.x} y={l.z - 2.4} textAnchor="middle">
              {l.label}
            </text>
          </g>
        ))}
      <g ref={marker}>
        <circle r={3.2} fill="rgba(255,247,234,0.35)" />
        <path d="M0,-2.6 L1.8,2 L0,1 L-1.8,2 Z" fill="#fff7ea" stroke="#2b2118" strokeWidth={0.5} />
      </g>
    </svg>
  );
}

/** Bản đồ nhỏ góc màn hình (desktop). */
export function MiniMap() {
  const openPanel = useTempleStore((s) => s.openPanel);
  return (
    <button type="button" className="minimap" onClick={() => openPanel("map")} aria-label="Mở bản đồ">
      <MapSvg />
    </button>
  );
}

/** Bảng bản đồ đầy đủ + danh sách “Đi tới”. */
export function MapPanel({ onClose }: { onClose: () => void }) {
  const showToast = useTempleStore((s) => s.showToast);
  const go = (l: Landmark) => {
    if (teleportTo(l)) {
      onClose();
      showToast(l.label);
    }
  };
  return (
    <div className="sheet sheet--map" role="dialog" aria-label="Bản đồ chùa">
      <div className="sheet__head">
        <div>
          <p className="eyebrow">Bản đồ</p>
          <h2>Khuôn viên chùa</h2>
        </div>
        <button type="button" className="icon-close" aria-label="Đóng" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="map-layout">
        <div className="map-frame">
          <MapSvg showLabels onPick={go} />
        </div>
        <ul className="map-list">
          {LANDMARKS.map((l) => (
            <li key={l.id}>
              <button type="button" className="map-go" onClick={() => go(l)}>
                <span>{l.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
