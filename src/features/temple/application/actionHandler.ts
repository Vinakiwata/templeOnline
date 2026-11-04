import type { Interactable, InteractionAction } from "../domain/interactables";
import { useTempleStore } from "./templeStore";
import { isPlayerBusy, playerRuntime } from "../game/systems/runtime";
import { gameEvents } from "../game/systems/events";
import { playBell, playChime, playSmallBell } from "../../../shared/audio/sound";
import { recordActivity } from "../../journal/application/activityService";

/**
 * Action Handler (PRD 5.3) — nơi duy nhất xử lý logic của một hành động.
 * Mesh/3D component không gọi API trực tiếp.
 */

/** Thời lượng animation & các mốc (giây) cho từng nghi thức. */
export const ACTION_TIMELINE: Partial<Record<InteractionAction, { duration: number; keyframes: number[] }>> = {
  worship: { duration: 6.3, keyframes: [1.1, 3.1, 5.1] },
  offer_flower: { duration: 2.8, keyframes: [1.5] },
  light_incense: { duration: 3.4, keyframes: [2.0] },
  ring_bell: { duration: 2.0, keyframes: [0.85] },
};

const COMPLETE_MESSAGES: Partial<Record<InteractionAction, [string, string]>> = {
  worship: ["Nam Mô Bổn Sư Thích Ca Mâu Ni Phật", "Nguyện cho tâm được an tịnh."],
  offer_flower: ["Đóa sen đã được dâng lên", "Hoa nở rồi tàn — nhắc ta trân quý hiện tại."],
  light_incense: ["Ba nén tâm hương đã được dâng", "Giới hương · Định hương · Tuệ hương"],
  ring_bell: ["Tiếng chuông ngân vang", "Thở vào, thở ra — trở về với chính mình."],
};

export function startAction(
  action: InteractionAction,
  target: Interactable,
  deps: { navigate: (path: string) => void },
) {
  const store = useTempleStore.getState();
  if (action === "learn") {
    store.openPanel("info", target.id);
    return;
  }
  if (action === "read_sutra") {
    store.closePanel();
    deps.navigate("/kinh");
    return;
  }
  if (isPlayerBusy() || playerRuntime.mode === "meditating") return;

  if (action === "meditate") {
    playerRuntime.pending = { action, objectId: target.id, focus: target.focus, seat: target.anchor };
    store.openPanel("meditation", target.id);
    return;
  }

  store.closePanel();
  store.setBusy(true);
  playerRuntime.pending = { action, objectId: target.id, focus: target.focus };
}

/** Được Player gọi khi animation đạt tới keyframe. */
export function handleKeyframe(action: InteractionAction, index: number) {
  const store = useTempleStore.getState();
  switch (action) {
    case "worship":
      playSmallBell();
      break;
    case "light_incense":
      store.lightIncense();
      gameEvents.emit("incense:lit");
      playChime(0.9);
      break;
    case "offer_flower":
      store.addFlower();
      gameEvents.emit("flower:offered");
      playChime(1.1);
      break;
    case "ring_bell":
      gameEvents.emit("bell:ring");
      playBell(1);
      break;
    default:
      break;
  }
  void index;
}

/** Được Player gọi khi nghi thức kết thúc. */
export function completeAction(action: InteractionAction, objectId: string) {
  const store = useTempleStore.getState();
  store.setBusy(false);
  if (action === "learn" || action === "read_sutra" || action === "meditate") return;
  recordActivity({ activityType: action, objectId });
  const msg = COMPLETE_MESSAGES[action];
  if (msg) store.showToast(msg[0], msg[1]);
}

/** Kết thúc thiền trong chùa: nhân vật đứng dậy. */
export function endTempleMeditation() {
  playerRuntime.standUpRequested = true;
  useTempleStore.getState().closePanel();
}
