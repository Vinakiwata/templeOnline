import { useEffect } from "react";
import { input } from "../game/systems/runtime";

const KEYMAP: Record<string, "up" | "down" | "left" | "right"> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

/** Desktop controls (PRD 5.2): WASD/mũi tên, Shift chạy, E tương tác, Esc menu. */
export function useKeyboardInput(handlers: { onInteract: () => void; onEscape: () => void }) {
  useEffect(() => {
    const pressed = new Set<string>();
    const update = () => {
      input.keyY = (pressed.has("up") ? 1 : 0) - (pressed.has("down") ? 1 : 0);
      input.keyX = (pressed.has("right") ? 1 : 0) - (pressed.has("left") ? 1 : 0);
    };
    const isTyping = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      // Esc luôn đóng bảng, kể cả khi đang gõ tên.
      if (e.code === "Escape") {
        handlers.onEscape();
        return;
      }
      // Phím đã được thành phần giao diện xử lý (ví dụ mũi tên trong nhóm lựa chọn).
      if (e.defaultPrevented || isTyping(e)) return;
      const dir = KEYMAP[e.code];
      if (dir) {
        pressed.add(dir);
        update();
        e.preventDefault();
      }
      if (e.key === "Shift") input.run = true;
      if (e.code === "KeyE" && !e.repeat) handlers.onInteract();
    };
    const up = (e: KeyboardEvent) => {
      const dir = KEYMAP[e.code];
      if (dir) {
        pressed.delete(dir);
        update();
      }
      if (e.key === "Shift") input.run = false;
    };
    const blur = () => {
      pressed.clear();
      input.run = false;
      update();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      blur();
    };
  }, [handlers]);
}
