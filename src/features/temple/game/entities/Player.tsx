import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { cameraState, input, npcColliders, playerRuntime, type PlayerMode } from "../systems/runtime";
import { getArea, groundHeight, resolveCollisions, SOLEMN_AREAS } from "../../domain/world";
import { ACTION_TIMELINE, completeAction, handleKeyframe } from "../../application/actionHandler";
import type { InteractionAction } from "../../domain/interactables";
import { useTempleStore } from "../../application/templeStore";
import { makeTextTexture, measureText, SANS } from "../systems/textTexture";

/** Bảng tên nổi trên đầu nhân vật. */
function useNameTag(name: string) {
  const { tex, aspect } = useMemo(() => {
    const size = 56;
    const textW = measureText(name, SANS.replace("{size}", `${size}px`));
    const width = Math.min(900, Math.max(220, Math.ceil(textW + 90)));
    const height = 104;
    return {
      tex: makeTextTexture({
        width,
        height,
        background: "rgba(31,22,17,0.62)",
        radius: 50,
        lines: [{ text: name, font: SANS, color: "#fff4dc", size }],
      }),
      aspect: width / height,
    };
  }, [name]);
  useEffect(() => () => tex.dispose(), [tex]);
  return { tex, aspect };
}

const WALK_SPEED = 3.0;
const RUN_SPEED = 6.0;
const HALL_SPEED = 1.5; // đi chậm trong chánh điện (PRD 5.2)
const RADIUS = 0.38;

const damp = THREE.MathUtils.damp;

function dampAngle(current: number, target: number, lambda: number, dt: number) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

const MODE_FOR_ACTION: Partial<Record<InteractionAction, PlayerMode>> = {
  worship: "bowing",
  offer_flower: "offering",
  light_incense: "incense",
  ring_bell: "ringing",
  beat_drum: "ringing",
  meditate: "meditating",
  have_meal: "meditating",
};

/**
 * Player: MovementController + AnimationController (PRD 5.1, 5.2).
 * Nhân vật mặc áo tràng lam, animation procedural (không cần file rig).
 */
export function Player() {
  const gender = useTempleStore((s) => s.playerGender);
  const name = useTempleStore((s) => s.playerName);
  const female = gender === "nu";
  const nameTag = useNameTag(name);
  const tag = useRef<THREE.Sprite>(null);
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const footL = useRef<THREE.Mesh>(null);
  const footR = useRef<THREE.Mesh>(null);
  const skirt = useRef<THREE.Mesh>(null);
  const flower = useRef<THREE.Group>(null);

  const anim = useRef({
    phase: 0,
    actionTime: 0,
    fired: 0,
    sit: 0,
    turnTo: 0,
    seatFrom: new THREE.Vector3(),
    seatTo: null as THREE.Vector3 | null,
  });

  useLayoutEffect(() => {
    root.current?.position.copy(playerRuntime.position);
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = playerRuntime;
    const a = anim.current;
    const g = root.current;
    if (!g || !torso.current || !armL.current || !armR.current) return;

    // ── Bắt đầu hành động mới ──
    if (p.pending) {
      const mode = MODE_FOR_ACTION[p.pending.action];
      if (mode) {
        p.active = p.pending;
        p.mode = mode;
        a.actionTime = 0;
        a.fired = 0;
        a.turnTo = Math.atan2(p.pending.focus[0] - p.position.x, p.pending.focus[2] - p.position.z);
        if (p.pending.seat) {
          a.seatFrom.copy(p.position);
          a.seatTo = new THREE.Vector3(p.pending.seat[0], 0, p.pending.seat[2]);
        } else {
          a.seatTo = null;
        }
      }
      p.pending = null;
    }

    if (p.standUpRequested) {
      p.standUpRequested = false;
      if (p.mode === "meditating") {
        p.mode = "idle";
        p.active = null;
      }
    }

    const mx = input.joyActive ? input.joyX : input.keyX;
    const my = input.joyActive ? input.joyY : input.keyY;
    const mag = Math.min(1, Math.hypot(mx, my));
    const ritual = p.mode === "bowing" || p.mode === "offering" || p.mode === "incense" || p.mode === "ringing";

    // ── Di chuyển ──
    if (!ritual && p.mode !== "meditating" && mag > 0.08) {
      const yaw = cameraState.yaw;
      const fx = -Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const rx = Math.cos(yaw);
      const rz = -Math.sin(yaw);
      let dx = fx * my + rx * mx;
      let dz = fz * my + rz * mx;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;

      const inHall = SOLEMN_AREAS.includes(getArea(p.position.x, p.position.z));
      const wantsRun = input.run || (input.joyActive && mag > 0.97);
      const maxSpeed = inHall ? HALL_SPEED : wantsRun ? RUN_SPEED : WALK_SPEED;
      p.speed = damp(p.speed, maxSpeed * mag, 8, dt);
      p.position.x += dx * p.speed * dt;
      p.position.z += dz * p.speed * dt;
      resolveCollisions(p.position, RADIUS);
      for (const c of npcColliders) {
        if (!c.active) continue;
        const dx = p.position.x - c.x;
        const dz = p.position.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + RADIUS;
        if (d < min && d > 1e-4) {
          p.position.x = c.x + (dx / d) * min;
          p.position.z = c.z + (dz / d) * min;
        }
      }
      p.rotationY = dampAngle(p.rotationY, Math.atan2(dx, dz), 10, dt);
      p.mode = p.speed > WALK_SPEED + 0.4 ? "running" : "walking";
    } else {
      p.speed = damp(p.speed, 0, 10, dt);
      if (p.mode === "walking" || p.mode === "running") p.mode = "idle";
    }

    // ── Nghi thức ──
    let env = 0;
    let t = 0;
    if (ritual && p.active) {
      const tl = ACTION_TIMELINE[p.active.action];
      a.actionTime += dt;
      t = a.actionTime;
      if (t < 0.6) p.rotationY = dampAngle(p.rotationY, a.turnTo, 8, dt);
      const dur = tl?.duration ?? 2;
      env = Math.min(1, t / 0.35, Math.max(0, (dur - t) / 0.35));
      const kfs = tl?.keyframes ?? [];
      while (a.fired < kfs.length && t >= kfs[a.fired]) {
        handleKeyframe(p.active.action, a.fired, p.active.objectId);
        a.fired++;
      }
      if (t >= dur) {
        const done = p.active;
        p.active = null;
        p.mode = "idle";
        completeAction(done.action, done.objectId);
      }
    }

    // ── Thiền: di chuyển tới bồ đoàn rồi ngồi ──
    const meditating = p.mode === "meditating";
    if (meditating) {
      p.rotationY = dampAngle(p.rotationY, a.turnTo, 5, dt);
      if (a.seatTo) {
        p.position.x = damp(p.position.x, a.seatTo.x, 4, dt);
        p.position.z = damp(p.position.z, a.seatTo.z, 4, dt);
      }
    }
    a.sit = damp(a.sit, meditating ? 1 : 0, 4, dt);

    // ── Áp dụng transform ──
    const gy = groundHeight(p.position.x, p.position.z);
    p.position.y = damp(p.position.y, gy, 14, dt);
    g.position.set(p.position.x, p.position.y, p.position.z);
    g.rotation.y = p.rotationY;

    // ── Pose ──
    const moving = p.mode === "walking" || p.mode === "running";
    a.phase += dt * (moving ? 2.2 + p.speed * 1.6 : 0);
    const swingAmp = moving ? Math.min(0.75, 0.25 + p.speed * 0.12) : 0;
    const swing = Math.sin(a.phase) * swingAmp;

    let pitch = 0;
    let armX = swing;
    let armXR = -swing;
    let armZ = -0.08; // hơi dang ra khi đứng/đi
    let showFlower = false;

    if (p.mode === "bowing") {
      const bt = Math.max(0, t - 0.1) / 2;
      const local = bt % 1;
      pitch = bt < 3 ? Math.pow(Math.sin(local * Math.PI), 2) * 0.85 : 0;
      armX = armXR = -1.35;
      armZ = 0.5;
    } else if (p.mode === "offering") {
      const raise = Math.min(1, t / 0.8);
      armX = armXR = -1.4 * raise;
      armZ = 0.3;
      pitch = t > 1.0 && t < 2.0 ? Math.sin(((t - 1) / 1) * Math.PI) * 0.35 : 0;
      showFlower = t < 1.55;
    } else if (p.mode === "incense") {
      armX = armXR = t < 1.4 ? -2.1 : -1.45;
      armZ = 0.52;
      pitch = t > 1.4 && t < 2.6 ? Math.sin(((t - 1.4) / 1.2) * Math.PI) * 0.45 : 0;
    } else if (p.mode === "ringing" && p.active?.action === "beat_drum") {
      const push = Math.max(0, Math.sin(((t - 0.35) / 0.7) * Math.PI * 2));
      armX = -1.2 - push * 0.5;
      armXR = -1.2 - Math.max(0, Math.sin(((t - 0.7) / 0.7) * Math.PI * 2)) * 0.5;
      armZ = 0.1;
      pitch = 0.1;
    } else if (p.mode === "ringing") {
      const push = t > 0.5 && t < 1.1 ? Math.sin(((t - 0.5) / 0.6) * Math.PI) : 0;
      armX = armXR = -1.5 - push * 0.15;
      armZ = 0.12;
      pitch = push * 0.2 - 0.05;
    } else if (meditating) {
      armX = armXR = -0.55;
      armZ = 0.38;
      pitch = 0.04;
    }

    const w = ritual ? env : 1;
    const breathe = Math.sin(performance.now() / 900) * 0.012;
    torso.current.rotation.x = damp(torso.current.rotation.x, pitch * w, 10, dt);
    torso.current.position.y = THREE.MathUtils.lerp(0.95, 0.42, a.sit) + (moving ? Math.abs(Math.sin(a.phase)) * 0.03 : breathe);
    armL.current.rotation.x = damp(armL.current.rotation.x, ritual ? armX * w : armX, 10, dt);
    armR.current.rotation.x = damp(armR.current.rotation.x, ritual ? armXR * w : armXR, 10, dt);
    armL.current.rotation.z = damp(armL.current.rotation.z, armZ * (ritual ? w : 1), 10, dt);
    armR.current.rotation.z = damp(armR.current.rotation.z, -armZ * (ritual ? w : 1), 10, dt);

    if (footL.current && footR.current) {
      const step = moving ? Math.sin(a.phase) * 0.16 : 0;
      footL.current.position.z = 0.06 + step;
      footR.current.position.z = 0.06 - step;
      footL.current.visible = footR.current.visible = a.sit < 0.5;
    }
    if (skirt.current) {
      const s = a.sit;
      skirt.current.scale.set(1 + s * 0.9, 1 - s * 0.68, 1 + s * 0.5);
      skirt.current.position.y = THREE.MathUtils.lerp(0.5, 0.16, s);
    }
    if (flower.current) flower.current.visible = showFlower;
    if (tag.current) tag.current.position.y = THREE.MathUtils.lerp(2.12, 1.55, a.sit) * (female ? 0.95 : 1);
  });

  const robeMat = female ? M.robeFemale : M.robe;
  const robeDarkMat = female ? M.robeFemaleDark : M.robeDark;
  const TAG_H = 0.24;
  return (
    <group ref={root}>
      <sprite ref={tag} position={[0, 2.12, 0]} scale={[TAG_H * nameTag.aspect, TAG_H, 1]} renderOrder={10}>
        <spriteMaterial map={nameTag.tex} transparent depthWrite={false} />
      </sprite>
      <group scale={female ? 0.95 : 1}>
      {/* Vạt áo dưới */}
      <mesh ref={skirt} position={[0, 0.5, 0]} material={robeMat} castShadow>
        <cylinderGeometry args={[0.2, 0.31, 1.0, 16]} />
      </mesh>
      <mesh ref={footL} position={[-0.1, 0.03, 0.06]} material={M.shoe} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.22]} />
      </mesh>
      <mesh ref={footR} position={[0.1, 0.03, 0.06]} material={M.shoe} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.22]} />
      </mesh>

      {/* Thân trên — pivot ở hông */}
      <group ref={torso} position={[0, 0.95, 0]}>
        <mesh position={[0, 0.31, 0]} material={robeMat} castShadow>
          <cylinderGeometry args={[0.17, 0.21, 0.62, 16]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} scale={[1, 0.45, 0.8]} material={robeDarkMat} castShadow>
          <sphereGeometry args={[0.22, 16, 10]} />
        </mesh>
        {/* Đầu */}
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, -0.07, 0]} material={M.skin}>
            <cylinderGeometry args={[0.05, 0.06, 0.1, 10]} />
          </mesh>
          <mesh position={[0, 0.06, 0]} material={M.skin} castShadow>
            <sphereGeometry args={[0.13, 20, 16]} />
          </mesh>
          {female ? (
            <>
              {/* Tóc dài vấn búi */}
              <mesh position={[0, 0.075, -0.014]} rotation-x={-0.3} material={M.hair}>
                <sphereGeometry args={[0.14, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              </mesh>
              <mesh position={[0, 0.05, -0.15]} material={M.hair}>
                <sphereGeometry args={[0.075, 12, 10]} />
              </mesh>
              <mesh position={[0, 0.07, -0.15]} rotation-x={Math.PI / 2} material={M.goldBright}>
                <torusGeometry args={[0.05, 0.008, 6, 16]} />
              </mesh>
              {/* Tóc dài buông sau lưng */}
              <mesh position={[0, -0.14, -0.12]} rotation-x={0.12} scale={[1, 1, 0.45]} material={M.hair}>
                <cylinderGeometry args={[0.1, 0.075, 0.42, 12]} />
              </mesh>
            </>
          ) : (
            <mesh position={[0, 0.08, -0.012]} rotation-x={-0.35} material={M.hair}>
              <sphereGeometry args={[0.138, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            </mesh>
          )}
        </group>
        {/* Tay */}
        {(
          [
            [armL, -0.23],
            [armR, 0.23],
          ] as const
        ).map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.55, 0]}>
            <mesh position={[0, -0.26, 0]} material={robeMat} castShadow>
              <cylinderGeometry args={[0.065, 0.08, 0.52, 10]} />
            </mesh>
            <mesh position={[0, -0.55, 0]} material={M.skin}>
              <sphereGeometry args={[0.05, 10, 8]} />
            </mesh>
          </group>
        ))}
        {/* Đóa sen trên tay khi dâng hoa */}
        <group ref={flower} position={[0, 0.25, 0.5]} visible={false}>
          <mesh material={M.lotusPink} scale={[0.09, 0.07, 0.09]}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      </group>
      </group>
    </group>
  );
}
