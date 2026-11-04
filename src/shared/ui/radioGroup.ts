import type { KeyboardEvent } from "react";

/**
 * Điều hướng bàn phím cho nhóm `role="radiogroup"` theo mẫu WAI-ARIA:
 * mũi tên trái/lên lùi, phải/xuống tiến (vòng lại), Home/End về đầu/cuối.
 * Chọn luôn mục vừa chuyển tới, giống radio gốc của trình duyệt.
 */
export function radioGroupKeys(e: KeyboardEvent<HTMLElement>) {
  const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!(e.key in step) && e.key !== "Home" && e.key !== "End") return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])'));
  const i = radios.indexOf(document.activeElement as HTMLElement);
  if (i < 0 || radios.length === 0) return;
  e.preventDefault();
  const n = e.key === "Home" ? 0 : e.key === "End" ? radios.length - 1 : (i + step[e.key] + radios.length) % radios.length;
  radios[n].focus();
  radios[n].click();
}

/** Roving tabindex: chỉ mục đang chọn nằm trong thứ tự Tab. */
export const radioTabIndex = (checked: boolean) => (checked ? 0 : -1);
