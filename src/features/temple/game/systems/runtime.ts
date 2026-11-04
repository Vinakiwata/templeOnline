import * as THREE from "three";
import type { InteractionAction, Vec3 } from "../../domain/interactables";
import { SPAWN } from "../../domain/world";

/**
 * Game Runtime State (PRD 9.1) — dữ liệu thay đổi mỗi frame.
 * Cố ý KHÔNG đặt trong Zustand/React để tránh re-render 60 lần/giây.
 */
export type PlayerMode =
  | "idle"
  | "walking"
  | "running"
  | "bowing"
  | "kneeling"
  | "offering"
  | "incense"
  | "ringing"
  | "meditating";

export interface PendingAction {
  action: InteractionAction;
  objectId: string;
  focus: Vec3;
  /** Vị trí ngồi (dùng cho thiền). */
  seat?: Vec3;
}

export const playerRuntime = {
  position: new THREE.Vector3(SPAWN.x, 0, SPAWN.z),
  rotationY: SPAWN.rotationY,
  speed: 0,
  mode: "idle" as PlayerMode,
  pending: null as PendingAction | null,
  active: null as PendingAction | null,
  standUpRequested: false,
};

export function resetPlayerRuntime() {
  playerRuntime.position.set(SPAWN.x, 0, SPAWN.z);
  playerRuntime.rotationY = SPAWN.rotationY;
  playerRuntime.speed = 0;
  playerRuntime.mode = "idle";
  playerRuntime.pending = null;
  playerRuntime.active = null;
  playerRuntime.standUpRequested = false;
  cameraState.yaw = 0;
  cameraState.pitch = 0.36;
  cameraState.lastManual = 0;
}

export const cameraState = {
  yaw: 0, // 0 = camera phía sau nhân vật khi nhân vật nhìn về -Z
  pitch: 0.36,
  distance: 6,
  lastManual: 0,
};

/** Input dùng chung cho bàn phím và joystick. */
export const input = {
  keyX: 0,
  keyY: 0,
  joyX: 0,
  joyY: 0,
  joyActive: false,
  run: false,
};

export function isPlayerBusy() {
  const m = playerRuntime.mode;
  return m === "bowing" || m === "kneeling" || m === "offering" || m === "incense" || m === "ringing" || playerRuntime.pending !== null;
}

/** Thiết lập hiển thị theo chất lượng (đọc trong useFrame, không gây re-render). */
export const renderSettings = {
  /** Hệ số bán kính hiển thị nội thất (Near). */
  nearScale: 1,
};

/** Vị trí các NPC để người chơi không đi xuyên qua (cập nhật mỗi frame bởi Npc). */
export const npcColliders: { x: number; z: number; r: number; active: boolean }[] = Array.from({ length: 64 }, () => ({
  x: 0,
  z: 0,
  r: 0.35,
  active: false,
}));
