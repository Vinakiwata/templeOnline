import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "../entities/Environment";
import { MainHall } from "../entities/MainHall";
import {
  BellTower,
  BodhiTree,
  Gate,
  IncenseBurner,
  Lanterns,
  LotusPond,
  QuanAmStatue,
  Trees,
} from "../entities/Courtyard";
import { Player } from "../entities/Player";
import { CameraController } from "../controllers/CameraController";
import { InteractionSystem } from "../interactions/InteractionSystem";
import type { QualityProfile } from "../systems/quality";

/** Temple Main Scene (PRD 5.1). */
export function TempleScene({
  quality,
  onReady,
  showFps,
}: {
  quality: QualityProfile;
  onReady: () => void;
  showFps: boolean;
}) {
  return (
    <>
      <Environment quality={quality} />
      <group name="Temple">
        <MainHall />
        <Gate />
        <BellTower />
        <LotusPond />
        <BodhiTree detail={quality.foliageDetail} />
        <QuanAmStatue />
        <IncenseBurner smokeCount={quality.smoke} />
        <Lanterns />
        <Trees detail={quality.foliageDetail} />
      </group>
      <Player />
      <CameraController />
      <InteractionSystem />
      <ReadySignal onReady={onReady} />
      {showFps && <FpsProbe />}
    </>
  );
}

/** Báo "đã sẵn sàng" sau vài frame đầu tiên để ẩn màn hình loading. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current++;
    if (frames.current > 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/** Đo FPS và ghi thẳng vào DOM (không qua React state). */
function FpsProbe() {
  const acc = useRef({ t: 0, n: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    a.t += dt;
    a.n++;
    if (a.t >= 0.5) {
      const el = document.getElementById("fps-meter");
      if (el) el.textContent = `${Math.round(a.n / a.t)} FPS`;
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}
