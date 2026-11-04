import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { CrossCollar, darker, Hand, Head, Limb, skirtGeo, sleeveGeo, torsoGeo, type FaceKind, type HairKind } from "./PersonParts";
import { NPCS, type NpcPose, type NpcSpec, type Waypoint } from "../../domain/npcs";
import { groundHeight } from "../../domain/world";
import { npcColliders, playerRuntime, renderSettings } from "../systems/runtime";

/**
 * Nhân vật trong chùa (NPC): chư Tăng, chú tiểu, người hành hương.
 * Hình dáng dựng thủ tục như nhân vật người chơi; chuyển động thủ tục theo "pose".
 * Mỗi NPC tự ẩn khi ở xa người chơi để nhẹ máy.
 */
const damp = THREE.MathUtils.damp;
const SKIN = new THREE.MeshStandardMaterial({ color: "#e4bf9a", roughness: 0.75 });

function dampAngle(current: number, target: number, lambda: number, dt: number) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

export function Npcs() {
  return (
    <group name="NPCs">
      {NPCS.map((spec, i) => (
        <Npc key={spec.id} spec={spec} index={i} />
      ))}
    </group>
  );
}

function Npc({ spec, index }: { spec: NpcSpec; index: number }) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const footL = useRef<THREE.Mesh>(null);
  const footR = useRef<THREE.Mesh>(null);
  const skirt = useRef<THREE.Mesh>(null);
  const broom = useRef<THREE.Group>(null);
  const moStick = useRef<THREE.Group>(null);

  const robe = M[spec.look.robe];
  const sash = spec.look.sash ? M[spec.look.sash] : null;
  const prop = spec.look.prop ?? "none";
  const scale = spec.look.scale ?? 1;
  const seed = useMemo(() => index * 1.37 + 0.5, [index]);

  const st = useRef(
    (() => {
      const path = spec.path;
      const start = path ? Math.min(path.start ?? 0, path.points.length - 1) : 0;
      const p0 = spec.station ?? path!.points[start];
      return {
        x: p0.x,
        z: p0.z,
        rot: 0,
        idx: path ? (start + 1) % path.points.length : 0,
        dir: 1,
        wait: 0,
        waitPose: "stand" as NpcPose,
        waitFace: null as [number, number] | null,
        phase: seed,
        sit: spec.station && isSeated(spec.station.pose) ? 1 : 0,
        kneel: spec.station?.pose === "kneel" ? 1 : 0,
        visible: true,
        check: seed % 0.3,
      };
    })(),
  );

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const g = root.current;
    if (!g || !torso.current || !armL.current || !armR.current) return;

    // ── Ẩn khi xa người chơi ──
    s.check += dt;
    if (s.check > 0.3) {
      s.check = 0;
      const d = Math.hypot(playerRuntime.position.x - s.x, playerRuntime.position.z - s.z);
      const limit = Math.max(26, 46 * renderSettings.nearScale);
      s.visible = s.visible ? d < limit + 4 : d < limit;
      g.visible = s.visible;
    }
    const col = npcColliders[index];
    if (!s.visible) {
      if (col) col.active = false;
      return;
    }

    // ── Hành vi ──
    let pose: NpcPose = "stand";
    let face: [number, number] | null = null;
    let speed = 0;
    if (spec.station) {
      pose = spec.station.pose;
      face = spec.station.face;
    } else if (spec.path) {
      const pts = spec.path.points;
      if (s.wait > 0) {
        s.wait -= dt;
        pose = s.waitPose;
        face = s.waitFace;
      } else {
        const target: Waypoint = pts[s.idx];
        const dx = target.x - s.x;
        const dz = target.z - s.z;
        const dist = Math.hypot(dx, dz);
        speed = spec.path.speed;
        const step = speed * dt;
        if (dist <= step) {
          s.x = target.x;
          s.z = target.z;
          if (target.wait) {
            s.wait = target.wait;
            s.waitPose = target.pose ?? "stand";
            s.waitFace = target.face ?? null;
          }
          // Điểm kế tiếp
          if (spec.path.mode === "loop") s.idx = (s.idx + 1) % pts.length;
          else {
            if (s.idx + s.dir >= pts.length || s.idx + s.dir < 0) s.dir *= -1;
            s.idx += s.dir;
          }
        } else {
          s.x += (dx / dist) * step;
          s.z += (dz / dist) * step;
          s.rot = dampAngle(s.rot, Math.atan2(dx, dz), 6, dt);
          pose = "walk";
        }
      }
    }
    if (face) s.rot = dampAngle(s.rot, Math.atan2(face[0] - s.x, face[1] - s.z), 4, dt);

    const seatY = spec.station?.seat ?? 0;
    const seated = isSeated(pose);
    s.sit = damp(s.sit, seated ? 1 : 0, 4, dt);
    s.kneel = damp(s.kneel, pose === "kneel" ? 1 : 0, 4, dt);
    g.position.set(s.x, groundHeight(s.x, s.z) + (seated ? seatY : 0), s.z);
    g.rotation.y = s.rot;
    if (col) {
      col.x = s.x;
      col.z = s.z;
      col.r = 0.34 * scale + (seated ? 0.1 : 0);
      col.active = true;
    }

    // ── Pose ──
    const t = clock.elapsedTime + s.phase * 3;
    if (pose === "walk") s.phase += dt * (1.6 + speed * 3.5);
    const walkSwing = pose === "walk" ? Math.sin(s.phase * 2) * 0.4 : 0;

    let pitch = 0;
    let aLx = walkSwing;
    let aRx = -walkSwing;
    let aZ = -0.06;
    switch (pose) {
      case "bow": {
        const u = (t % 4.2) / 4.2;
        pitch = u < 0.5 ? Math.pow(Math.sin(u * 2 * Math.PI), 2) * 0.8 : 0;
        aLx = aRx = -1.05;
        aZ = 0.58;
        break;
      }
      case "kneel": {
        // Quỳ lạy liên tục: mỗi lạy ~4.4s, nghỉ giữa các lạy.
        const u = (t % 4.4) / 4.4;
        const bow = u < 0.6 ? Math.pow(Math.sin((u / 0.6) * Math.PI), 2) : 0;
        pitch = bow * 1.42;
        aLx = aRx = -1.05 + bow * 0.8;
        aZ = 0.58 - bow * 0.42;
        break;
      }
      case "pray":
        aLx = aRx = prop === "incense" ? -1.55 : -1.05;
        aZ = 0.58;
        pitch = 0.06 + Math.sin(t * 0.6) * 0.04;
        break;
      case "sit":
        aLx = aRx = prop === "beads" ? -0.9 : -0.55;
        aZ = 0.38;
        pitch = 0.03;
        break;
      case "teach":
        aLx = -0.55;
        aRx = -1.1 + Math.sin(t * 0.9) * 0.35;
        aZ = 0.3;
        pitch = Math.sin(t * 0.5) * 0.05;
        break;
      case "woodfish":
        aLx = -0.9;
        aRx = -0.85 + Math.abs(Math.sin(t * 3.2)) * -0.3;
        aZ = 0.35;
        pitch = 0.08;
        break;
      case "eat": {
        // Tay trái nâng bát, tay phải đưa đũa lên miệng theo nhịp chậm.
        const bite = Math.max(0, Math.sin(t * 0.9)) ** 3;
        aLx = -1.15;
        aRx = -0.9 - bite * 0.75;
        aZ = 0.45;
        pitch = 0.08 - bite * 0.05;
        break;
      }
      case "cook":
        aLx = -0.8;
        aRx = -1.0 + Math.sin(t * 2.2) * 0.2;
        aZ = 0.2 + Math.cos(t * 2.2) * 0.08;
        pitch = 0.25;
        break;
      case "sweep":
        aLx = -0.75;
        aRx = -0.95;
        aZ = 0.22;
        pitch = 0.3;
        break;
      case "walk":
        if (prop === "tray") {
          aLx = aRx = -1.25;
          aZ = 0.25;
        }
        break;
      case "stand":
        if (prop === "tray") {
          aLx = aRx = -1.25;
          aZ = 0.25;
        }
        break;
      default:
        break;
    }
    const breathe = Math.sin(t * 1.4) * 0.01;
    torso.current.rotation.x = damp(torso.current.rotation.x, pitch, 8, dt);
    torso.current.position.y = THREE.MathUtils.lerp(THREE.MathUtils.lerp(0.95, 0.42, s.sit), 0.52, s.kneel) + breathe + (pose === "walk" ? Math.abs(Math.sin(s.phase * 2)) * 0.025 : 0);
    armL.current.rotation.x = damp(armL.current.rotation.x, aLx, 8, dt);
    armR.current.rotation.x = damp(armR.current.rotation.x, aRx, 8, dt);
    armL.current.rotation.z = damp(armL.current.rotation.z, aZ, 8, dt);
    armR.current.rotation.z = damp(armR.current.rotation.z, -aZ, 8, dt);
    if (footL.current && footR.current) {
      const stepZ = pose === "walk" ? Math.sin(s.phase * 2) * 0.15 : 0;
      footL.current.position.z = 0.06 + stepZ;
      footR.current.position.z = 0.06 - stepZ;
      footL.current.visible = footR.current.visible = s.sit < 0.5 && s.kneel < 0.5;
    }
    if (skirt.current) {
      const k = s.sit;
      const kn = s.kneel;
      skirt.current.scale.set(1 + k * 0.9 + kn * 0.3, Math.max(0.3, 1 - k * 0.68 - kn * 0.48), 1 + k * 0.5 + kn * 0.4);
      skirt.current.position.y = THREE.MathUtils.lerp(0.5, 0.16, k) - kn * 0.24;
    }
    if (broom.current) broom.current.rotation.z = pose === "sweep" ? Math.sin(t * 1.8) * 0.45 : 0;
    if (moStick.current) moStick.current.rotation.x = pose === "woodfish" ? -Math.abs(Math.sin(t * 3.2)) * 0.6 : 0;
  });

  const head = spec.look.head;
  const face: FaceKind =
    head === "novice" ? "novice" : head === "monk" ? (spec.id.includes("tru-tri") ? "elder" : "monk") : head === "hairM" ? "calm" : "lady";
  const hair: HairKind = head;
  return (
    <group ref={root} scale={scale}>
      <mesh ref={skirt} geometry={skirtGeo()} position={[0, 0.5, 0]} material={robe} castShadow />
      <mesh ref={footL} position={[-0.09, 0.035, 0.06]} scale={[0.055, 0.04, 0.115]} material={M.shoe}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      <mesh ref={footR} position={[0.09, 0.035, 0.06]} scale={[0.055, 0.04, 0.115]} material={M.shoe}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {prop === "mo" && (
        <group position={[0.05, 0.02, 0.5]}>
          <mesh position={[0, 0.1, 0]} scale={[1, 0.78, 1.12]} material={M.lacquer} castShadow>
            <sphereGeometry args={[0.13, 16, 12]} />
          </mesh>
          <mesh position={[0, 0.1, 0.13]} rotation-x={Math.PI / 2} material={M.lacquerDark}>
            <torusGeometry args={[0.05, 0.012, 6, 16, Math.PI]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2} material={M.robeRed}>
            <circleGeometry args={[0.18, 18]} />
          </mesh>
        </group>
      )}

      <group ref={torso} position={[0, 0.95, 0]}>
        <mesh geometry={torsoGeo()} material={robe} castShadow />
        <CrossCollar material={darker(robe, 0.62)} />
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 0.2, 0.56, 0]} material={robe}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </mesh>
        ))}
        {sash && (
          <>
            {/* Cà sa vắt vai trái */}
            <Limb from={[-0.15, 0.64, 0.07]} to={[0.2, 0.1, 0.15]} r1={0.04} r2={0.04} material={sash} />
            <Limb from={[-0.15, 0.64, -0.07]} to={[0.2, 0.1, -0.14]} r1={0.04} r2={0.04} material={sash} />
            <mesh position={[-0.17, 0.63, 0]} material={sash}>
              <sphereGeometry args={[0.06, 10, 8]} />
            </mesh>
          </>
        )}
        {/* Đầu */}
        <group position={[0, 0.84, 0]}>
          <Head face={face} hair={hair} skin={SKIN} />
        </group>
        {/* Tay */}
        {(
          [
            [armL, -0.23],
            [armR, 0.23],
          ] as const
        ).map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.55, 0]}>
            <mesh geometry={sleeveGeo()} material={robe} castShadow />
            <Hand skin={SKIN} side={x > 0 ? 1 : -1} at={[0, -0.49, 0]} />
            {x > 0 && prop === "mo" && (
              <group ref={moStick} position={[0, -0.55, 0]}>
                <mesh position={[0, -0.1, 0.06]} rotation-x={0.6} material={M.woodLight}>
                  <cylinderGeometry args={[0.015, 0.015, 0.26, 6]} />
                </mesh>
                <mesh position={[0, -0.21, 0.13]} material={M.woodLight}>
                  <sphereGeometry args={[0.028, 8, 6]} />
                </mesh>
              </group>
            )}
          </group>
        ))}
        {/* Vật cầm tay */}
        {prop === "beads" && (
          <group position={[0, 0.22, 0.34]} rotation-x={1.2}>
            {Array.from({ length: 18 }, (_, i) => (
              <mesh key={i} position={[Math.cos((i / 18) * Math.PI * 2) * 0.07, Math.sin((i / 18) * Math.PI * 2) * 0.07, 0]} material={M.wood}>
                <sphereGeometry args={[0.014, 6, 5]} />
              </mesh>
            ))}
          </group>
        )}
        {prop === "incense" && (
          <group position={[0, 0.5, 0.46]}>
            {[-0.03, 0, 0.03].map((dx) => (
              <group key={dx} position={[dx, 0.12, 0]}>
                <mesh material={M.incenseStick}>
                  <cylinderGeometry args={[0.006, 0.006, 0.32, 4]} />
                </mesh>
                <mesh position={[0, 0.16, 0]} material={M.incenseTip}>
                  <sphereGeometry args={[0.012, 4, 4]} />
                </mesh>
              </group>
            ))}
          </group>
        )}
        {prop === "tray" && (
          <group position={[0, 0.2, 0.42]}>
            <mesh material={M.lacquer}>
              <boxGeometry args={[0.42, 0.03, 0.3]} />
            </mesh>
            {[-0.1, 0.05, 0.12].map((dx, i) => (
              <mesh key={dx} position={[dx, 0.05, i % 2 ? 0.05 : -0.04]} material={i === 1 ? M.lotusCenter : M.lanternRed}>
                <sphereGeometry args={[0.045, 8, 6]} />
              </mesh>
            ))}
          </group>
        )}
        {prop === "bowl" && (
          <group position={[-0.03, 0.27, 0.36]}>
            <mesh material={M.whiteJade}>
              <sphereGeometry args={[0.075, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            </mesh>
            <mesh position={[0.1, 0.06, 0.02]} rotation-z={-0.8} material={M.wood}>
              <cylinderGeometry args={[0.005, 0.005, 0.24, 4]} />
            </mesh>
          </group>
        )}
        {prop === "ladle" && (
          <group position={[0.12, 0.2, 0.42]}>
            <mesh position={[0, -0.05, 0.2]} rotation-x={1.0} material={M.woodLight}>
              <cylinderGeometry args={[0.014, 0.014, 0.75, 6]} />
            </mesh>
          </group>
        )}
        {prop === "bag" && (
          <mesh position={[0.2, 0.05, -0.08]} rotation-z={0.2} material={M.wood}>
            <boxGeometry args={[0.16, 0.24, 0.1]} />
          </mesh>
        )}
        {prop === "broom" && (
          <group ref={broom} position={[0.02, 0.18, 0.36]}>
            <mesh position={[0, -0.5, 0.18]} rotation-x={0.35} material={M.woodLight}>
              <cylinderGeometry args={[0.018, 0.018, 1.25, 6]} />
            </mesh>
            <mesh position={[0, -1.08, 0.4]} rotation-x={0.35 + Math.PI} material={M.broom}>
              <coneGeometry args={[0.16, 0.34, 8]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

function isSeated(pose: NpcPose) {
  return pose === "sit" || pose === "teach" || pose === "woodfish" || pose === "eat";
}
