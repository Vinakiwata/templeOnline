import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cameraState, input } from "../game/systems/runtime";

const RADIUS = 56;

/**
 * Mobile controls (PRD 5.2):
 * - Nửa trái: joystick nổi (xuất hiện tại chỗ chạm).
 * - Nửa phải: vuốt để xoay camera.
 */
export function TouchControls() {
  const [stick, setStick] = useState<{ x: number; y: number; kx: number; ky: number } | null>(null);
  const stickId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });

  const onStickDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== null) return;
    stickId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStick({ x: e.clientX, y: e.clientY, kx: 0, ky: 0 });
    input.joyActive = true;
    input.joyX = 0;
    input.joyY = 0;
  };
  const onStickMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== stickId.current || !stick) return;
    let dx = e.clientX - stick.x;
    let dy = e.clientY - stick.y;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) {
      dx = (dx / d) * RADIUS;
      dy = (dy / d) * RADIUS;
    }
    const nx = dx / RADIUS;
    const ny = -dy / RADIUS;
    const dead = Math.hypot(nx, ny) < 0.12;
    input.joyX = dead ? 0 : nx;
    input.joyY = dead ? 0 : ny;
    setStick({ ...stick, kx: dx, ky: dy });
  };
  const onStickUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== stickId.current) return;
    stickId.current = null;
    input.joyActive = false;
    input.joyX = 0;
    input.joyY = 0;
    setStick(null);
  };

  const onLookDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (lookId.current !== null) return;
    lookId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onLookMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== lookId.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    cameraState.yaw -= dx * 0.008;
    cameraState.pitch = Math.min(1.05, Math.max(0.05, cameraState.pitch + dy * 0.005));
    cameraState.lastManual = performance.now();
  };
  const onLookUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId === lookId.current) lookId.current = null;
  };

  return (
    <>
      <div
        className="touch-zone touch-zone--move"
        onPointerDown={onStickDown}
        onPointerMove={onStickMove}
        onPointerUp={onStickUp}
        onPointerCancel={onStickUp}
      >
        {stick ? (
          <div className="joystick" style={{ left: stick.x, top: stick.y }}>
            <div className="joystick__knob" style={{ transform: `translate(${stick.kx}px, ${stick.ky}px)` }} />
          </div>
        ) : (
          <div className="joystick joystick--hint" aria-hidden="true">
            <div className="joystick__knob" />
          </div>
        )}
      </div>
      <div
        className="touch-zone touch-zone--look"
        onPointerDown={onLookDown}
        onPointerMove={onLookMove}
        onPointerUp={onLookUp}
        onPointerCancel={onLookUp}
      />
    </>
  );
}
