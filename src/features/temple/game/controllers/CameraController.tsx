import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { cameraState, input, playerRuntime } from "../systems/runtime";
import { groundHeight } from "../../domain/world";

/**
 * Third-person camera bán tự động (PRD 14):
 * - Người dùng có thể xoay bằng chuột / vuốt.
 * - Khi đang đi về phía trước và không chạm camera > 1.5s, camera tự quay về sau lưng.
 * - Raycast vào tường/mái để camera không xuyên tường (TEM-003).
 */
export function CameraController() {
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const blockers = useRef<THREE.Object3D[]>([]);
  const lastScan = useRef(-10);
  const target = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const curDist = useRef(cameraState.distance);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (clock.elapsedTime - lastScan.current > 3 || blockers.current.length === 0) {
      lastScan.current = clock.elapsedTime;
      const list: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (o.userData?.camBlock) list.push(o);
      });
      blockers.current = list;
    }

    const p = playerRuntime;
    const meditating = p.mode === "meditating";
    target.set(p.position.x, p.position.y + (meditating ? 0.9 : 1.45), p.position.z);

    const now = performance.now();
    const my = input.joyActive ? input.joyY : input.keyY;
    if (!meditating && p.speed > 0.4 && my > -0.2 && now - cameraState.lastManual > 1500) {
      const desiredYaw = p.rotationY + Math.PI;
      let diff = desiredYaw - cameraState.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      cameraState.yaw += diff * (1 - Math.exp(-1.4 * dt));
    }
    if (meditating && now - cameraState.lastManual > 1500) {
      cameraState.yaw += dt * 0.04; // chậm rãi lướt quanh
      cameraState.pitch = THREE.MathUtils.damp(cameraState.pitch, 0.22, 1, dt);
    }

    const pitch = cameraState.pitch;
    const yaw = cameraState.yaw;
    dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize();
    const wanted = meditating ? Math.min(cameraState.distance, 4.2) : cameraState.distance;

    raycaster.set(target, dir);
    raycaster.far = wanted;
    const hits = raycaster.intersectObjects(blockers.current, false);
    const allowed = hits.length ? Math.max(0.8, hits[0].distance - 0.3) : wanted;

    if (allowed < curDist.current) curDist.current = allowed;
    else curDist.current = THREE.MathUtils.damp(curDist.current, allowed, 3, dt);

    camera.position.copy(target).addScaledVector(dir, curDist.current);
    const minY = groundHeight(camera.position.x, camera.position.z) + 0.3;
    if (camera.position.y < minY) camera.position.y = minY;
    camera.lookAt(target);
  });

  return null;
}
