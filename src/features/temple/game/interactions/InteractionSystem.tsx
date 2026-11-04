import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { INTERACTABLES } from "../../domain/interactables";
import { getArea } from "../../domain/world";
import { playerRuntime } from "../systems/runtime";
import { useTempleStore } from "../../application/templeStore";

/**
 * InteractionDetection (PRD 5.3): ~8 lần/giây tìm đối tượng gần nhất trong bán kính.
 * Chỉ cập nhật Zustand khi kết quả thay đổi → React HUD không re-render mỗi frame.
 * Không tự kích hoạt nghi thức khi chỉ đi ngang qua (PRD 3.4).
 */
export function InteractionSystem() {
  const acc = useRef(0);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.12) return;
    acc.current = 0;

    const { x, z } = playerRuntime.position;
    let bestId: string | null = null;
    let bestD = Infinity;
    for (const it of INTERACTABLES) {
      const d = Math.hypot(x - it.anchor[0], z - it.anchor[2]);
      if (d < it.radius && d < bestD) {
        bestD = d;
        bestId = it.id;
      }
    }
    const s = useTempleStore.getState();
    if (bestId !== s.nearbyId && playerRuntime.mode !== "meditating") s.setNearby(bestId);
    const area = getArea(x, z);
    if (area !== s.currentArea) s.setArea(area);
  });
  return null;
}
