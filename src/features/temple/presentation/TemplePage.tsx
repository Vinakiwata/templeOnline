import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { TempleScene } from "../game/scenes/TempleScene";
import { QUALITY_PROFILES } from "../game/systems/quality";
import { cameraState, isPlayerBusy, playerRuntime, resetPlayerRuntime } from "../game/systems/runtime";
import { useTempleStore } from "../application/templeStore";
import { endTempleMeditation } from "../application/actionHandler";
import { TempleHud } from "./TempleHud";
import { TouchControls } from "./TouchControls";
import { TempleFallback } from "./TempleFallback";
import { useKeyboardInput } from "./useTempleInput";
import { ErrorBoundary } from "../../../shared/ui/ErrorBoundary";
import { isTouchDevice, isWebGLAvailable } from "../../../shared/lib/webgl";
import { startAmbient, stopAmbient, unlockAudio } from "../../../shared/audio/sound";

export default function TemplePage() {
  const [supported] = useState(() => isWebGLAvailable());
  if (!supported) return <TempleFallback reason="webgl" />;
  return <TempleExperience />;
}

function TempleExperience() {
  const quality = useTempleStore((s) => s.quality);
  const showFps = useTempleStore((s) => s.showFps);
  const soundOn = useTempleStore((s) => s.soundOn);
  const profile = QUALITY_PROFILES[quality];
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const isTouch = useMemo(() => isTouchDevice(), []);
  const audioUnlocked = useRef(false);

  // Mỗi lần vào chùa: bắt đầu ở cổng.
  useState(() => {
    resetPlayerRuntime();
    cameraState.distance = isTouch ? 6.8 : 6;
    return null;
  });

  useEffect(() => {
    document.body.classList.add("is-temple");
    return () => {
      document.body.classList.remove("is-temple");
      stopAmbient();
      const s = useTempleStore.getState();
      s.setNearby(null);
      s.setBusy(false);
      if (s.panel !== "none" && s.panel !== "help") s.closePanel();
    };
  }, []);

  // Audio cần user gesture (iOS/Android).
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      audioUnlocked.current = true;
      if (useTempleStore.getState().soundOn) startAmbient();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!audioUnlocked.current) return;
    if (soundOn) startAmbient();
    else stopAmbient();
  }, [soundOn]);

  const handlers = useMemo(
    () => ({
      onInteract: () => {
        const s = useTempleStore.getState();
        if (s.panel === "none" && s.nearbyId && !isPlayerBusy() && playerRuntime.mode !== "meditating") {
          s.openPanel("menu", s.nearbyId);
        }
      },
      onEscape: () => {
        const s = useTempleStore.getState();
        if (s.panel === "meditation") endTempleMeditation();
        else if (s.panel !== "none") s.closePanel();
        else s.openPanel("settings");
      },
    }),
    [],
  );
  useKeyboardInput(handlers);

  // Desktop: kéo chuột để xoay camera, lăn chuột để zoom.
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    cameraState.yaw -= (e.clientX - d.x) * 0.005;
    cameraState.pitch = Math.min(1.05, Math.max(0.05, cameraState.pitch + (e.clientY - d.y) * 0.004));
    cameraState.lastManual = performance.now();
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    cameraState.distance = Math.min(10, Math.max(2.8, cameraState.distance + e.deltaY * 0.004));
  };

  const onReady = useCallback(() => setReady(true), []);

  if (lost) return <TempleFallback reason="lost" />;

  return (
    <div className="temple">
      <div
        className="temple__canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <ErrorBoundary fallback={<TempleFallback reason="error" />}>
          <Canvas
            key={quality}
            shadows={profile.shadows}
            dpr={profile.dpr}
            gl={{ antialias: profile.antialias, powerPreference: "high-performance" }}
            camera={{ fov: isTouch ? 62 : 55, near: 0.1, far: 400, position: [0, 4, 26] }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.domElement.addEventListener("webglcontextlost", (ev) => {
                ev.preventDefault();
                setLost(true);
              });
            }}
          >
            <Suspense fallback={null}>
              <TempleScene quality={profile} onReady={onReady} showFps={showFps} />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {isTouch && <TouchControls />}
      <TempleHud isTouch={isTouch} />

      <div className={`loading ${ready ? "is-done" : ""}`} aria-hidden={ready}>
        <div className="loading__mark" />
        <p>Đang mở cổng chùa…</p>
      </div>
    </div>
  );
}
