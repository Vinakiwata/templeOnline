import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getSutra, SHORT_SERVICE, SUTRAS } from "../data/sutras";
import { getProgress, saveProgress } from "../application/sutraProgress";
import { recordActivity } from "../../journal/application/activityService";
import { playWoodfish, unlockAudio } from "../../../shared/audio/sound";
import { readJSON, writeJSON } from "../../../shared/lib/storage";

const FONT_KEY = "chua.readerFont";

/** Reader (SUT-002/003/004): đọc trên mobile, đọc to (Web Speech), mõ, lưu tiến trình. */
export function SutraReaderPage() {
  const { id = "" } = useParams();
  const sutra = getSutra(id);
  const [font, setFont] = useState(() => readJSON<number>(FONT_KEY, 20));
  const [speaking, setSpeaking] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [woodfish, setWoodfish] = useState(false);
  const [completed, setCompleted] = useState(() => !!getProgress(id)?.completedAt);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const openedAt = useRef(Date.now());
  const completeTimer = useRef<number | undefined>(undefined);

  const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
  const viVoice = useViVoice(hasSpeech);

  // Khôi phục vị trí đọc
  useEffect(() => {
    if (!sutra) return;
    openedAt.current = Date.now();
    setCompleted(!!getProgress(sutra.id)?.completedAt);
    const p = getProgress(sutra.id);
    if (p && p.currentPosition > 0 && !p.completedAt) {
      sectionRefs.current[p.currentPosition]?.scrollIntoView({ block: "center" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [sutra]);

  // Theo dõi section đang đọc & khi đọc đến cuối
  useEffect(() => {
    if (!sutra) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) {
            if (e.target === endRef.current) window.clearTimeout(completeTimer.current);
            continue;
          }
          const el = e.target as HTMLElement;
          if (el === endRef.current) {
            // Chỉ ghi "đã đọc xong" khi người đọc đã ở lại đủ lâu với bài kinh.
            const minMs = sutra.readingMinutes * 15_000;
            const wait = Math.max(0, minMs - (Date.now() - openedAt.current));
            window.clearTimeout(completeTimer.current);
            completeTimer.current = window.setTimeout(markComplete, wait);
          } else {
            const idx = Number(el.dataset.idx);
            if (!Number.isNaN(idx)) saveProgress(sutra.id, { currentPosition: idx });
          }
        }
      },
      { threshold: 0.6 },
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    if (endRef.current) obs.observe(endRef.current);
    return () => {
      obs.disconnect();
      window.clearTimeout(completeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sutra]);

  // Mõ gõ theo nhịp
  useEffect(() => {
    if (!woodfish) return;
    playWoodfish();
    const t = window.setInterval(playWoodfish, 1100);
    return () => window.clearInterval(t);
  }, [woodfish]);

  // Dừng đọc khi rời trang
  useEffect(
    () => () => {
      if (hasSpeech) window.speechSynthesis.cancel();
    },
    [hasSpeech, id],
  );

  function markComplete() {
    if (!sutra) return;
    const p = getProgress(sutra.id);
    if (p?.completedAt && Date.now() - new Date(p.completedAt).getTime() < 60_000) return;
    saveProgress(sutra.id, { completedAt: new Date().toISOString(), currentPosition: 0 });
    recordActivity({ activityType: "read_sutra", objectId: sutra.id, metadata: { title: sutra.title } });
    setCompleted(true);
  }

  function speak() {
    if (!sutra || !hasSpeech) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    sutra.sections.forEach((sec, idx) => {
      const text = [sec.heading, ...sec.lines].filter(Boolean).join(". ");
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN";
      if (viVoice) u.voice = viVoice;
      u.rate = 0.85;
      u.onstart = () => {
        setActiveSection(idx);
        sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      if (idx === sutra.sections.length - 1) {
        u.onend = () => {
          setSpeaking(false);
          setActiveSection(null);
        };
      }
      synth.speak(u);
    });
    setSpeaking(true);
  }

  function stopSpeaking() {
    if (hasSpeech) window.speechSynthesis.cancel();
    setSpeaking(false);
    setActiveSection(null);
  }

  const changeFont = (delta: number) => {
    const next = Math.min(30, Math.max(16, font + delta));
    setFont(next);
    writeJSON(FONT_KEY, next);
  };

  const next = useMemo(() => {
    if (!sutra) return null;
    const i = SHORT_SERVICE.indexOf(sutra.id);
    if (i >= 0 && i < SHORT_SERVICE.length - 1) return getSutra(SHORT_SERVICE[i + 1]);
    const j = SUTRAS.findIndex((s) => s.id === sutra.id);
    return SUTRAS[(j + 1) % SUTRAS.length];
  }, [sutra]);

  if (!sutra) return <Navigate to="/kinh" replace />;

  return (
    <article className="reader" style={{ ["--reader-size" as string]: `${font}px` }}>
      <div className="reader__bar">
        <Link to="/kinh" className="link-back">
          ← Thư viện
        </Link>
        <div className="reader__tools">
          <button type="button" className="tool" onClick={() => changeFont(-2)} aria-label="Chữ nhỏ hơn">
            A−
          </button>
          <button type="button" className="tool" onClick={() => changeFont(2)} aria-label="Chữ lớn hơn">
            A+
          </button>
          <button
            type="button"
            className={`tool ${woodfish ? "is-active" : ""}`}
            onClick={() => {
              unlockAudio();
              setWoodfish((w) => !w);
            }}
            aria-pressed={woodfish}
          >
            Mõ
          </button>
          {hasSpeech &&
            (speaking ? (
              <button type="button" className="tool tool--primary" onClick={stopSpeaking}>
                ■ Dừng
              </button>
            ) : (
              <button type="button" className="tool tool--primary" onClick={speak}>
                ▶ Nghe đọc
              </button>
            ))}
        </div>
      </div>

      <header className="reader__head">
        <p className="eyebrow">{sutra.category}</p>
        <h1>{sutra.title}</h1>
        <p className="muted">{sutra.subtitle}</p>
        {hasSpeech && !viVoice && (
          <p className="reader__note">
            Thiết bị chưa có giọng đọc tiếng Việt; trình duyệt sẽ dùng giọng mặc định. Bản ghi âm tụng kinh sẽ được bổ sung sau.
          </p>
        )}
      </header>

      <div className="reader__body">
        {sutra.sections.map((sec, idx) => (
          <section
            key={idx}
            data-idx={idx}
            ref={(el) => (sectionRefs.current[idx] = el)}
            className={`reader__section ${activeSection === idx ? "is-reading" : ""}`}
          >
            {sec.heading && <h2>{sec.heading}</h2>}
            {sec.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </section>
        ))}
      </div>

      <div ref={endRef} className="reader__end">
        <span className="reader__end-mark" aria-hidden="true">
          ❀
        </span>
        <p>{completed ? "Bạn đã đọc xong bài này." : "Hết bài."}</p>
        <p className="reader__source">
          Nguồn: {sutra.source} · {sutra.license}
        </p>
        {next && (
          <Link to={`/kinh/${next.id}`} className="btn btn--primary">
            Đọc tiếp: {next.title}
          </Link>
        )}
      </div>
    </article>
  );
}

function useViVoice(enabled: boolean) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoice(voices.find((v) => v.lang.toLowerCase().startsWith("vi")) ?? null);
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, [enabled]);
  return voice;
}
