/**
 * Âm thanh được tổng hợp bằng Web Audio API — không cần file audio,
 * nên prototype chạy được ngay. Khi có bản ghi chuông thật, thay các hàm
 * play* bằng AudioBuffer tải từ CDN.
 */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbIn: GainNode | null = null;
let enabled = true;

function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.9 : 0;
    master.connect(ctx.destination);

    const convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(ctx, 3.5, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    reverbIn = ctx.createGain();
    reverbIn.connect(convolver).connect(wet).connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function route(node: AudioNode) {
  if (master) node.connect(master);
  if (reverbIn) node.connect(reverbIn);
}

/** Gọi trong một user gesture để mở khoá audio trên iOS/Android. */
export function unlockAudio() {
  getCtx();
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (ctx && master) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.08);
  if (!on) stopAmbient();
}

export function isSoundEnabled() {
  return enabled;
}

function partialTone(
  c: AudioContext,
  dest: AudioNode,
  freq: number,
  amp: number,
  decay: number,
  when: number,
) {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = freq;
  const e = c.createGain();
  e.gain.setValueAtTime(0.0001, when);
  e.gain.exponentialRampToValueAtTime(Math.max(amp, 0.0002), when + 0.006);
  e.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  o.connect(e).connect(dest);
  o.start(when);
  o.stop(when + decay + 0.1);
}

function noiseBurst(c: AudioContext, dest: AudioNode, when: number, dur: number, freq: number, q: number, amp: number) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.value = amp;
  src.connect(f).connect(g).connect(dest);
  src.start(when);
}

/** Đại hồng chung — chuông lớn, ngân dài. */
export function playBell(strength = 1, base = 92) {
  const c = getCtx();
  if (!c || !enabled) return;
  const now = c.currentTime + 0.01;
  const bus = c.createGain();
  bus.gain.value = 0.16 * strength;
  route(bus);
  // Tỉ lệ partial phi điều hoà xấp xỉ chuông đồng.
  const partials: [number, number, number][] = [
    [0.5, 0.55, 11],
    [1, 1, 9],
    [1.19, 0.5, 7],
    [1.56, 0.38, 5.5],
    [2.0, 0.5, 5],
    [2.51, 0.26, 3.8],
    [2.66, 0.2, 3.2],
    [3.01, 0.16, 2.6],
    [4.1, 0.08, 1.8],
  ];
  for (const [ratio, amp, decay] of partials) {
    partialTone(c, bus, base * ratio, amp * 0.5, decay * (0.6 + 0.4 * strength), now);
    partialTone(c, bus, base * ratio * 1.0027, amp * 0.5, decay * (0.6 + 0.4 * strength), now);
  }
  noiseBurst(c, bus, now, 0.09, 900, 0.8, 0.6);
}

/** Chuông gia trì nhỏ — dùng khi lễ bái. */
export function playSmallBell() {
  const c = getCtx();
  if (!c || !enabled) return;
  const now = c.currentTime + 0.01;
  const bus = c.createGain();
  bus.gain.value = 0.12;
  route(bus);
  const base = 540;
  [
    [1, 1, 3.2],
    [2.76, 0.4, 1.6],
    [5.4, 0.18, 0.9],
  ].forEach(([r, a, d]) => {
    partialTone(c, bus, base * r, a * 0.5, d, now);
    partialTone(c, bus, base * r * 1.004, a * 0.5, d, now);
  });
}

/** Tiếng ngân nhẹ khi dâng hoa / thắp hương. */
export function playChime(pitch = 1) {
  const c = getCtx();
  if (!c || !enabled) return;
  const now = c.currentTime + 0.01;
  const bus = c.createGain();
  bus.gain.value = 0.07;
  route(bus);
  [784, 988, 1175].forEach((f, i) => {
    partialTone(c, bus, f * pitch, 0.6, 2.4 - i * 0.4, now + i * 0.12);
  });
}

/** Mõ gỗ. */
export function playWoodfish() {
  const c = getCtx();
  if (!c || !enabled) return;
  const now = c.currentTime + 0.005;
  const bus = c.createGain();
  bus.gain.value = 0.35;
  route(bus);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(640, now);
  o.frequency.exponentialRampToValueAtTime(390, now + 0.06);
  const e = c.createGain();
  e.gain.setValueAtTime(0.0001, now);
  e.gain.exponentialRampToValueAtTime(0.8, now + 0.003);
  e.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  o.connect(e).connect(bus);
  o.start(now);
  o.stop(now + 0.25);
  noiseBurst(c, bus, now, 0.03, 1800, 2, 0.35);
}

// ── Ambient: gió nhẹ + chuông gió thỉnh thoảng ───────────────────────────
let ambientNodes: { src: AudioBufferSourceNode; lfo: OscillatorNode; gain: GainNode } | null = null;
let chimeTimer: number | null = null;

export function startAmbient() {
  const c = getCtx();
  if (!c || !enabled || ambientNodes) return;
  const seconds = 6;
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.2;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const gain = c.createGain();
  gain.gain.value = 0.0;
  gain.gain.setTargetAtTime(0.05, c.currentTime, 2);
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain).connect(gain.gain);
  src.connect(lp).connect(gain);
  if (master) gain.connect(master);
  src.start();
  lfo.start();
  ambientNodes = { src, lfo, gain };

  const scheduleChime = () => {
    chimeTimer = window.setTimeout(() => {
      if (!ambientNodes) return;
      playChime(0.9 + Math.random() * 0.5);
      scheduleChime();
    }, 9000 + Math.random() * 9000);
  };
  scheduleChime();
}

export function stopAmbient() {
  if (chimeTimer) window.clearTimeout(chimeTimer);
  chimeTimer = null;
  if (!ambientNodes || !ctx) {
    ambientNodes = null;
    return;
  }
  const { src, lfo, gain } = ambientNodes;
  gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  src.stop(ctx.currentTime + 1.5);
  lfo.stop(ctx.currentTime + 1.5);
  ambientNodes = null;
}
