import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { M } from "./materials";
import { Lantern, mulberry } from "./Courtyard";
import { COMPOUND, PLATEAU, ROAD, TEMPLE_NAME, TEMPLE_NAME_HAN, roadX, terrainHeight } from "../../domain/world";
import { makeTextTexture, SANS, SERIF, SERIF_HAN } from "../systems/textTexture";

/**
 * Đồi, đường lên chùa, rừng cây.
 * - Mặt đất: một PlaneGeometry dịch đỉnh theo terrainHeight, tô màu theo độ cao.
 * - Đường: dải hình học bám theo địa hình.
 * - Rừng: InstancedMesh (vài draw call cho hàng trăm cây).
 */
const GRASS_LOW = new THREE.Color("#7c9a4e");
const GRASS_HIGH = new THREE.Color("#93a95e");
const EARTH = new THREE.Color("#a58d62");

export function Ground({ segments }: { segments: number }) {
  const geo = useMemo(() => {
    const size = 240;
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -14);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      c.copy(GRASS_LOW).lerp(GRASS_HIGH, Math.min(1, h / PLATEAU));
      const nearRoad = z > COMPOUND.maxZ && Math.abs(x - roadX(z)) < 4.2;
      if (nearRoad) c.lerp(EARTH, 0.5);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [segments]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), []);
  return (
    <group>
      <mesh geometry={geo} material={mat} receiveShadow />
      {/* Đồng bằng xa tới chân trời */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} material={M.grass}>
        <planeGeometry args={[1200, 1200]} />
      </mesh>
      {/* Mặt bằng chùa */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[(COMPOUND.minX + COMPOUND.maxX) / 2, PLATEAU + 0.012, (COMPOUND.minZ + COMPOUND.maxZ) / 2]}
        material={M.courtyard}
        receiveShadow
      >
        <planeGeometry args={[COMPOUND.maxX - COMPOUND.minX, COMPOUND.maxZ - COMPOUND.minZ]} />
      </mesh>
      {/* Thảm cỏ trong khuôn viên */}
      {(
        [
          [-36, -24, -76, -54],
          [14, 36, -76, -60],
          [-36, -24, -24, -2],
          [24, 36, -24, -2],
        ] as const
      ).map(([x0, x1, z0, z1]) => (
        <mesh key={`${x0}${z0}`} rotation-x={-Math.PI / 2} position={[(x0 + x1) / 2, PLATEAU + 0.02, (z0 + z1) / 2]} material={M.lawn} receiveShadow>
          <planeGeometry args={[x1 - x0, z1 - z0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Dải hình học bám địa hình dọc theo trục z, tâm cx(z), rộng w(z). */
function ribbon(z0: number, z1: number, cx: (z: number) => number, w: (z: number) => number, lift: number) {
  const steps = Math.ceil(Math.abs(z1 - z0) / 0.75);
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const z = z0 + ((z1 - z0) * i) / steps;
    const c = cx(z);
    const half = w(z) / 2;
    positions.push(c - half, terrainHeight(c - half, z) + lift, z, c + half, terrainHeight(c + half, z) + lift, z);
    if (i < steps) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function Road() {
  const { road, edgeL, edgeR, plaza } = useMemo(() => {
    const w = ROAD.width;
    return {
      road: ribbon(ROAD.endZ, 11, roadX, () => w, 0.07),
      edgeL: ribbon(ROAD.endZ, 11, (z) => roadX(z) - w / 2 - 0.2, () => 0.4, 0.09),
      edgeR: ribbon(ROAD.endZ, 11, (z) => roadX(z) + w / 2 + 0.2, () => 0.4, 0.09),
      plaza: ribbon(12, COMPOUND.maxZ - 0.6, () => 0, (z) => 16 - Math.max(0, z - 10) * 1.2, 0.07),
    };
  }, []);
  const lanterns = useMemo(() => {
    const list: [number, number][] = [];
    for (let z = 52, i = 0; z > 14; z -= 7, i++) {
      const side = i % 2 ? 1 : -1;
      list.push([roadX(z) + side * (ROAD.width / 2 + 0.9), z]);
    }
    list.push([-7.4, 9], [7.4, 9]);
    return list;
  }, []);
  return (
    <group>
      <mesh geometry={road} material={M.roadStone} receiveShadow />
      <mesh geometry={edgeL} material={M.roadEdge} receiveShadow />
      <mesh geometry={edgeR} material={M.roadEdge} receiveShadow />
      <mesh geometry={plaza} material={M.roadStone} receiveShadow />
      {lanterns.map(([x, z]) => (
        <Lantern key={`${x}${z}`} x={x} z={z} y={terrainHeight(x, z)} />
      ))}
      <StoneStele x={roadX(49) - 4.2} z={49} rotY={0.45} />
    </group>
  );
}

/** Rừng cây trên sườn đồi (InstancedMesh). */
export function Forest({ count, detail }: { count: number; detail: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const pines = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const rnd = mulberry(42);
    const list: { x: number; z: number; s: number; pine: boolean }[] = [];
    let guard = 0;
    while (list.length < count && guard++ < count * 30) {
      const x = (rnd() - 0.5) * 200;
      const z = -14 + (rnd() - 0.5) * 200;
      const insideCompound = x > COMPOUND.minX - 3 && x < COMPOUND.maxX + 3 && z > COMPOUND.minZ - 3 && z < COMPOUND.maxZ + 3;
      if (insideCompound) continue;
      const nearRoad = z > COMPOUND.maxZ - 2 && z < ROAD.endZ + 8 && Math.abs(x - roadX(z)) < (z < 14 ? 11 : 6);
      if (nearRoad) continue;
      if (z > 70) continue;
      list.push({ x, z, s: 0.7 + rnd() * 0.8, pine: rnd() < 0.35 });
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let iC = 0;
    let iP = 0;
    trees.forEach((t, i) => {
      const y = terrainHeight(t.x, t.z);
      dummy.rotation.set(0, i * 1.7, 0);
      dummy.position.set(t.x, y + 1.3 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.updateMatrix();
      trunks.current?.setMatrixAt(i, dummy.matrix);
      if (t.pine) {
        dummy.position.set(t.x, y + 3.6 * t.s, t.z);
        dummy.scale.set(t.s * 1.6, t.s * 4.2, t.s * 1.6);
        dummy.updateMatrix();
        pines.current?.setMatrixAt(iP, dummy.matrix);
        pines.current?.setColorAt(iP, color.setHSL(0.3, 0.32, 0.24 + (i % 5) * 0.02));
        iP++;
      } else {
        dummy.position.set(t.x, y + 3.4 * t.s, t.z);
        dummy.scale.set(t.s * 1.7, t.s * 1.5, t.s * 1.7);
        dummy.updateMatrix();
        crowns.current?.setMatrixAt(iC, dummy.matrix);
        crowns.current?.setColorAt(iC, color.setHSL(0.24 + (i % 7) * 0.012, 0.38, 0.3 + (i % 4) * 0.03));
        iC++;
      }
    });
    for (const m of [trunks.current, crowns.current, pines.current]) {
      if (!m) continue;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    if (crowns.current) crowns.current.count = iC;
    if (pines.current) pines.current.count = iP;
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]} material={M.trunk} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 2.6, 6]} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]} castShadow>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={pines} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.5, 1, 7]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/** Bia đá tên chùa ở chân đồi. */
function StoneStele({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  const tex = useMemo(
    () =>
      makeTextTexture({
        width: 512,
        height: 768,
        background: "#9d978b",
        border: { color: "#6f6a60", width: 8, inset: 22 },
        lines: [
          { text: TEMPLE_NAME_HAN, font: SERIF_HAN, color: "#3a2a1c", size: 92 },
          { text: TEMPLE_NAME.toUpperCase(), font: SERIF, color: "#3a2a1c", size: 64 },
          { text: "Kính mời quý khách lên chùa", font: SANS, color: "#4a3a2a", size: 30 },
        ],
        lineGap: 0.5,
      }),
    [],
  );
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation-y={rotY}>
      <mesh position={[0, 0.25, 0]} material={M.stoneDark} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.5, 0.9]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} material={M.stone} castShadow>
        <boxGeometry args={[1.4, 2.1, 0.32]} />
      </mesh>
      <mesh position={[0, 1.55, 0.165]}>
        <planeGeometry args={[1.3, 1.95]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.72, 0]} material={M.roofTileDark} castShadow>
        <boxGeometry args={[1.7, 0.22, 0.55]} />
      </mesh>
    </group>
  );
}
