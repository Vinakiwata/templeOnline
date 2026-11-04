import { useEffect, useRef, useState } from "react";
import { DHARMA_TALKS } from "../../sutra/data/dharmaTalks";
import { recordActivity } from "../../journal/application/activityService";
import { useTempleStore } from "../application/templeStore";
import { playSmallBell } from "../../../shared/audio/sound";

/** Nghe giảng tại Giảng đường: chọn bài pháp, đọc hoặc nghe máy đọc (Web Speech). */
export function DharmaPanel({ onClose }: { onClose: () => void }) {
  const [talkId, setTalkId] = useState(DHARMA_TALKS[0].id);
  const [speaking, setSpeaking] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const showToast = useTempleStore((s) => s.showToast);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const doneRef = useRef(false);
  const talk = DHARMA_TALKS.find((t) => t.id === talkId) ?? DHARMA_TALKS[0];
  const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(
    () => () => {
      if (hasSpeech) window.speechSynthesis.cancel();
    },
    [hasSpeech],
  );

  const stop = () => {
    if (hasSpeech) window.speechSynthesis.cancel();
    setSpeaking(false);
    setActive(null);
  };

  const play = () => {
    if (!hasSpeech) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const vi = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("vi")) ?? null;
    playSmallBell();
    talk.paragraphs.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "vi-VN";
      if (vi) u.voice = vi;
      u.rate = 0.88;
      u.onstart = () => {
        setActive(i);
        paraRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      if (i === talk.paragraphs.length - 1) u.onend = () => finish();
      synth.speak(u);
    });
    setSpeaking(true);
  };

  const finish = () => {
    setSpeaking(false);
    setActive(null);
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    recordActivity({ activityType: "listen_dharma", objectId: "giang-duong", metadata: { title: talk.title } });
    playSmallBell();
    showToast("Sādhu — lành thay", `Đã nghe bài “${talk.title}”`);
  };

  const pick = (id: string) => {
    stop();
    doneRef.current = false;
    setDone(false);
    setTalkId(id);
  };

  return (
    <div className="sheet sheet--dharma" role="dialog" aria-label="Nghe giảng">
      <div className="sheet__head">
        <div>
          <p className="eyebrow">Giảng đường</p>
          <h2>{talk.title}</h2>
        </div>
        <button
          type="button"
          className="icon-close"
          aria-label="Đóng"
          onClick={() => {
            stop();
            onClose();
          }}
        >
          ×
        </button>
      </div>
      <div className="dharma-tabs" role="tablist">
        {DHARMA_TALKS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === talkId}
            className={`chip ${t.id === talkId ? "is-active" : ""}`}
            onClick={() => pick(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="dharma-body">
        {talk.paragraphs.map((p, i) => (
          <p key={i} ref={(el) => (paraRefs.current[i] = el)} className={active === i ? "is-reading" : ""}>
            {p}
          </p>
        ))}
      </div>
      <div className="sheet__footer">
        {hasSpeech &&
          (speaking ? (
            <button type="button" className="btn btn--ghost" onClick={stop}>
              ■ Dừng
            </button>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={play}>
              ▶ Nghe thầy giảng
            </button>
          ))}
        <button type="button" className="btn btn--primary" onClick={finish} disabled={done}>
          {done ? "Đã ghi vào nhật ký" : "Sādhu — Đã nghe"}
        </button>
      </div>
      <p className="dharma-note">Bài pháp ngắn do Chùa Online biên soạn, giọng đọc là giọng máy của trình duyệt.</p>
    </div>
  );
}
