import * as THREE from "three";

/**
 * Vẽ chữ lên canvas để làm texture (hoành phi, bia đá, bảng tên nhân vật).
 * Font web (Noto Serif / Be Vietnam Pro) có thể chưa tải xong khi vẽ lần đầu,
 * nên texture được vẽ lại khi document.fonts sẵn sàng.
 */
export interface TextTextureOptions {
  lines: { text: string; font: string; color: string; size: number }[];
  width: number;
  height: number;
  background?: string;
  border?: { color: string; width: number; inset: number };
  radius?: number;
  lineGap?: number;
}

function draw(canvas: HTMLCanvasElement, o: TextTextureOptions) {
  const g = canvas.getContext("2d");
  if (!g) return;
  g.clearRect(0, 0, o.width, o.height);
  if (o.background) {
    g.fillStyle = o.background;
    const r = o.radius ?? 0;
    g.beginPath();
    g.moveTo(r, 0);
    g.arcTo(o.width, 0, o.width, o.height, r);
    g.arcTo(o.width, o.height, 0, o.height, r);
    g.arcTo(0, o.height, 0, 0, r);
    g.arcTo(0, 0, o.width, 0, r);
    g.closePath();
    g.fill();
  }
  if (o.border) {
    g.strokeStyle = o.border.color;
    g.lineWidth = o.border.width;
    g.strokeRect(o.border.inset, o.border.inset, o.width - o.border.inset * 2, o.height - o.border.inset * 2);
  }
  const gap = o.lineGap ?? 0.15;
  const total = o.lines.reduce((sum, l) => sum + l.size, 0) + gap * o.lines[0].size * (o.lines.length - 1);
  let y = (o.height - total) / 2;
  g.textAlign = "center";
  g.textBaseline = "top";
  for (const l of o.lines) {
    g.font = `${l.font.replace("{size}", `${l.size}px`)}`;
    g.fillStyle = l.color;
    // Thu nhỏ nếu chữ dài hơn khung.
    const maxW = o.width * 0.88;
    const w = g.measureText(l.text).width;
    if (w > maxW) {
      g.save();
      g.translate(o.width / 2, y);
      g.scale(maxW / w, 1);
      g.fillText(l.text, 0, 0);
      g.restore();
    } else {
      g.fillText(l.text, o.width / 2, y);
    }
    y += l.size * (1 + gap);
  }
}

export function makeTextTexture(o: TextTextureOptions): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = o.width;
  canvas.height = o.height;
  draw(canvas, o);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts?.ready) {
    void fonts.ready.then(() => {
      draw(canvas, o);
      tex.needsUpdate = true;
    });
  }
  return tex;
}

/** Đo tỉ lệ rộng/cao cần thiết cho một dòng chữ. */
export function measureText(text: string, font: string): number {
  const c = document.createElement("canvas").getContext("2d");
  if (!c) return text.length * 0.6;
  c.font = font;
  return c.measureText(text).width;
}

export const SERIF = "600 {size} 'Noto Serif', Georgia, serif";
export const SERIF_HAN = "600 {size} 'Noto Serif SC', 'Songti SC', 'STSong', 'Noto Serif CJK SC', 'PingFang SC', serif";
export const SANS = "600 {size} 'Be Vietnam Pro', system-ui, sans-serif";
