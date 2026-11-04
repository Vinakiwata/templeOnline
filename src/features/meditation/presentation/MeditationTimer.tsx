import { useEffect, useRef, useState } from "react";
import { MEDITATION_DURATIONS, saveMeditationSession, type MeditationResult } from "../application/meditationService";
import { playBell, startAmbient, stopAmbient } from "../../../shared/audio/sound";
import { formatDuration } from "../../../shared/lib/format";

type Phase = "choose" | "running" | "done";

interface Props {
  place: MeditationResult["place"];
  variant?: "page" | "overlay";
  onClose?: () => void;
}

/**
 * Phiên thiền 3/5/10/15 phút (PRD 3.6). Rời phiên bất kỳ lúc nào, không bị phạt.
 */
export function MeditationTimer({ place, variant = "page", onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [minutes, setMinutes] = useState<number>(5);
  const [ambient, setAmbient] = useState(place === "page");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<MeditationResult | null>(null);
  const startRef = useRef(0);

  const planned = minutes * 60;

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      const e = (performance.now() - startRef.current) / 1000;
      setElapsed(e);
      if (e >= planned) finish(true, planned);
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, planned]);

  // Rời màn hình khi đang thiền: vẫn lưu phần thời gian đã ngồi, dừng âm thanh nền.
  const live = useRef({ phase, planned });
  live.current = { phase, planned };
  useEffect(
    () => () => {
      if (live.current.phase === "running") {
        saveMeditationSession({
          plannedSeconds: live.current.planned,
          actualSeconds: (performance.now() - startRef.current) / 1000,
          completed: false,
          place,
        });
      }
      if (place === "page") stopAmbient();
    },
    [place],
  );

  function start() {
    playBell(0.7);
    if (ambient && place === "page") startAmbient();
    startRef.current = performance.now();
    setElapsed(0);
    setPhase("running");
  }

  function finish(completed: boolean, actual?: number) {
    const actualSeconds = actual ?? (performance.now() - startRef.current) / 1000;
    const r: MeditationResult = { plannedSeconds: planned, actualSeconds, completed, place };
    saveMeditationSession(r);
    setResult(r);
    setPhase("done");
    if (place === "page") stopAmbient();
    playBell(completed ? 0.9 : 0.5);
    if (completed) window.setTimeout(() => playBell(0.6), 2600);
  }

  const remaining = Math.max(0, planned - elapsed);
  const progress = Math.min(1, elapsed / planned);

  return (
    <div className={`medi medi--${variant}`}>
      {phase === "choose" && (
        <div className="medi__choose">
          <p className="eyebrow">Thiền định</p>
          <h2 className="medi__title">Ngồi yên, theo dõi hơi thở</h2>
          <p className="muted">
            Chọn thời gian. Bạn có thể dừng bất cứ lúc nào — mỗi phút an trú đều quý.
          </p>
          <div className="medi__durations" role="radiogroup" aria-label="Thời gian thiền">
            {MEDITATION_DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={minutes === m}
                className={`chip chip--lg ${minutes === m ? "is-active" : ""}`}
                onClick={() => setMinutes(m)}
              >
                {m} phút
              </button>
            ))}
          </div>
          {place === "page" && (
            <label className="toggle">
              <input type="checkbox" checked={ambient} onChange={(e) => setAmbient(e.target.checked)} />
              <span>Âm thanh gió và chuông gió</span>
            </label>
          )}
          <div className="medi__actions">
            {onClose && (
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Để sau
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={start}>
              Bắt đầu
            </button>
          </div>
        </div>
      )}

      {phase === "running" && (
        <div className="medi__running">
          <div className="breath" aria-hidden="true">
            <div className="breath__ring" style={{ ["--p" as string]: progress }} />
            <div className="breath__orb" />
            <div className="breath__text">
              <span className="breath__in">Thở vào…</span>
              <span className="breath__out">Thở ra…</span>
            </div>
          </div>
          <p className="medi__time" aria-live="off">
            {formatDuration(remaining)}
          </p>
          <button type="button" className="btn btn--ghost" onClick={() => finish(false)}>
            Kết thúc
          </button>
        </div>
      )}

      {phase === "done" && result && (
        <div className="medi__done">
          <p className="eyebrow">{result.completed ? "Viên mãn" : "Đã dừng"}</p>
          <h2 className="medi__title">Bạn đã ngồi {formatDuration(result.actualSeconds)}</h2>
          <p className="verse">
            Nguyện đem công đức này,
            <br />
            Hướng về khắp tất cả,
            <br />
            Đệ tử và chúng sanh,
            <br />
            Đều trọn thành Phật đạo.
          </p>
          <div className="medi__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setPhase("choose")}>
              Ngồi tiếp
            </button>
            {onClose && (
              <button type="button" className="btn btn--primary" onClick={onClose}>
                Xong
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
