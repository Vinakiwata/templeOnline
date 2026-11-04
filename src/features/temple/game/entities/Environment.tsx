import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Sky } from "@react-three/drei";
import { M } from "./materials";
import type { QualityProfile } from "../systems/quality";

/** Sky, ánh sáng, mặt đất, sân, lối đi, tường bao. */
export function Environment({ quality }: { quality: QualityProfile }) {
  return (
    <>
      <color attach="background" args={["#f1d7b0"]} />
      <fog attach="fog" args={["#efd6b2", 38, 120]} />
      <Sky
        distance={450000}
        sunPosition={[60, 18, 40]}
        turbidity={7}
        rayleigh={1.4}
        mieCoefficient={0.006}
        mieDirectionalG={0.86}
      />
      <hemisphereLight args={["#fff0d4", "#5f4b33", 0.95]} />
      <directionalLight
        position={[24, 30, 16]}
        intensity={2.3}
        color="#ffd9a6"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />

      {/* Mặt đất ngoài khuôn viên */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} material={M.grass} receiveShadow>
        <planeGeometry args={[240, 240]} />
      </mesh>
      {/* Sân chùa */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 3]} material={M.courtyard} receiveShadow>
        <planeGeometry args={[32, 38]} />
      </mesh>
      <PathTiles />
      <CompoundWalls />
    </>
  );
}

function PathTiles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let z = 20.6; z > -0.8; z -= 1.25) list.push([0, 0.025, z]);
    // lối rẽ tới lầu chuông & cội Bồ Đề
    for (let x = 2.2; x < 8; x += 1.25) list.push([x, 0.025, 4]);
    for (let x = -2.2; x > -7.5; x -= 1.25) list.push([x, 0.025, 15.6]);
    return list;
  }, []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(...p);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} material={M.pathStone} receiveShadow>
      <boxGeometry args={[2.6, 0.05, 1.12]} />
    </instancedMesh>
  );
}

function WallSegment({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      <mesh material={M.ochreWallDark} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, h / 2 + 0.08, 0]} material={M.roofTileDark} castShadow>
        <boxGeometry args={[w + (w > d ? 0 : 0.35), 0.16, d + (d > w ? 0 : 0.35)]} />
      </mesh>
    </group>
  );
}

function CompoundWalls() {
  const h = 1.6;
  return (
    <group>
      <WallSegment position={[-16.2, h / 2, 3]} size={[0.4, h, 38.8]} />
      <WallSegment position={[16.2, h / 2, 3]} size={[0.4, h, 38.8]} />
      <WallSegment position={[0, h / 2, -16.2]} size={[32.8, h, 0.4]} />
      <WallSegment position={[-11.2, h / 2, 22.2]} size={[10.4, h, 0.4]} />
      <WallSegment position={[11.2, h / 2, 22.2]} size={[10.4, h, 0.4]} />
    </group>
  );
}
