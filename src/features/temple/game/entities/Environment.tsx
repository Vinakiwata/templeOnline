import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import type { QualityProfile } from "../systems/quality";
import { playerRuntime } from "../systems/runtime";

const SUN_OFFSET = new THREE.Vector3(26, 38, 22);

/**
 * Bầu trời, sương xa và ánh sáng.
 * Khuôn viên rộng nên vùng đổ bóng của mặt trời đi theo người chơi
 * (chỉ cần shadow map nhỏ mà vẫn sắc nét quanh nhân vật).
 */
export function Environment({ quality }: { quality: QualityProfile }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (sun.current) sun.current.target = target;
  }, [target]);

  useFrame(() => {
    const p = playerRuntime.position;
    // Bám theo người chơi theo bước 2m để bóng không bị "bơi".
    const sx = Math.round(p.x / 2) * 2;
    const sz = Math.round(p.z / 2) * 2;
    target.position.set(sx, p.y, sz);
    sun.current?.position.set(sx + SUN_OFFSET.x, p.y + SUN_OFFSET.y, sz + SUN_OFFSET.z);
  });

  return (
    <>
      <color attach="background" args={["#f1d7b0"]} />
      <fog attach="fog" args={["#ecd9bb", 90, 320]} />
      <Sky
        distance={450000}
        sunPosition={[SUN_OFFSET.x, SUN_OFFSET.y * 0.55, SUN_OFFSET.z]}
        turbidity={7}
        rayleigh={1.3}
        mieCoefficient={0.006}
        mieDirectionalG={0.86}
      />
      <hemisphereLight args={["#fff0d4", "#6a5638", 1.05]} />
      <ambientLight intensity={0.18} color="#ffe9c9" />
      <primitive object={target} />
      <directionalLight
        ref={sun}
        intensity={2.3}
        color="#ffd9a6"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />
    </>
  );
}
