import * as THREE from "three";
import { M } from "./materials";
import { Roof } from "./Roof";
import { AltarTiers, Beam, CandlePair, Ceiling, Column, CoupletBoard, Near, Plaque, Slab, Steps, TextPlaque, Wall } from "./Architecture";
import { SERIF_HAN } from "../systems/textTexture";
import { GATE_COUPLET, TEMPLE_NAME, TEMPLE_NAME_HAN } from "../../domain/world";
import { CuuLong, SeatedBuddha, SeatedFigure, StandingFigure, Tablet, type Holding } from "./Figures";
import { BuddhaStatue, LotusFlower } from "./BuddhaStatue";
import { QuanAmStatue } from "./QuanAmStatue";
import {
  BaoThap,
  BellTower,
  BodhiTree,
  DrumTower,
  FlagPole,
  IncenseBurner,
  IncenseSticks,
  Lantern,
  LotusPond,
  Smoke,
  StoneStupa,
  Tree,
} from "./Courtyard";
import {
  COMPOUND,
  DIEN_MAU_COLS,
  FLAG_POLES,
  GIANG_DUONG_COL_Z,
  HANH_LANG_COL_Z,
  KIM_CUONG_Z,
  LA_HAN_Z,
  LANTERN_POSITIONS,
  NHA_TO_COLS,
  PLATEAU,
  PLATFORMS,
  POND_RADIUS,
  POS,
  STONE_STUPAS,
  THIEN_CUSHIONS,
  TRAI_DUONG_COL_X,
  TRAI_SEATS,
  TRAI_TABLE_X,
  THIEN_DUONG_COL_Z,
  GIANG_DUONG_MATS,
  TIEN_DUONG_COLS,
  TREE_POSITIONS,
} from "../../domain/world";
import { useTempleStore } from "../../application/templeStore";

const Y = PLATEAU;
const r = (minX: number, maxX: number, minZ: number, maxZ: number) => ({ minX, maxX, minZ, maxZ });
const platform = (i: number) => PLATFORMS[i];

// ═════════════════════════════════════════════════════════════════════════
// Tường bao & Tam quan
// ═════════════════════════════════════════════════════════════════════════
function CompoundWalls() {
  const h = 2;
  const segs = [
    r(COMPOUND.minX - 0.4, COMPOUND.minX, COMPOUND.minZ - 0.4, COMPOUND.maxZ - 0.6),
    r(COMPOUND.maxX, COMPOUND.maxX + 0.4, COMPOUND.minZ - 0.4, COMPOUND.maxZ - 0.6),
    r(COMPOUND.minX - 0.4, COMPOUND.maxX + 0.4, COMPOUND.minZ - 0.4, COMPOUND.minZ),
    r(COMPOUND.minX - 0.4, -7, 2.7, 3.3),
    r(7, COMPOUND.maxX + 0.4, 2.7, 3.3),
  ];
  return (
    <group>
      {segs.map((s, i) => (
        <group key={i}>
          <Wall r={s} y0={0} h={h} material={M.ochreWallDark} />
          <mesh position={[(s.minX + s.maxX) / 2, Y + h + 0.08, (s.minZ + s.maxZ) / 2]} material={M.roofTileDark} castShadow>
            <boxGeometry args={[s.maxX - s.minX + 0.3, 0.16, s.maxZ - s.minZ + 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function TamQuan() {
  const z = 3;
  const pillar = (x: number, w: number, h: number) => (
    <group key={x}>
      <Wall r={r(x - w / 2, x + w / 2, z - 0.8, z + 0.8)} y0={0} h={h} material={M.ochreWall} />
      <mesh position={[x, Y + h + 0.15, z]} material={M.lacquer}>
        <boxGeometry args={[w * 0.8, 0.3, 1.3]} />
      </mesh>
    </group>
  );
  return (
    <group>
      {/* Trụ cổng: hai trụ trong (giữa đại quan và tiểu quan), hai trụ ngoài */}
      {pillar(-2.8, 1.6, 4.6)}
      {pillar(2.8, 1.6, 4.6)}
      {pillar(-6.3, 1.4, 3.4)}
      {pillar(6.3, 1.4, 3.4)}
      {/* Gác trên đại quan */}
      <Wall r={r(-3.6, 3.6, z - 1.1, z + 1.1)} y0={4.6} h={1.7} material={M.ochreWallDark} />
      {[-2, -0.7, 0.7, 2].map((x) => (
        <mesh key={x} position={[x, Y + 5.45, z + 1.12]} material={M.lattice}>
          <boxGeometry args={[0.9, 1.0, 0.04]} />
        </mesh>
      ))}
      <Ceiling r={r(-7, 7, z - 1.6, z + 1.6)} y={3.38} />
      <Roof width={9.6} depth={4.8} height={1.0} position={[0, Y + 4.6, z]} ridge={false} />
      <Roof width={9.0} depth={4.2} height={1.7} position={[0, Y + 6.3, z]} pearl />
      {/* Mái tiểu quan */}
      {[-1, 1].map((s) => (
        <Roof key={s} width={4.8} depth={3.6} height={1.0} position={[s * 4.55, Y + 3.4, z]} ridge={false} />
      ))}
      {/* Câu đối trên hai trụ đại quan (vế đầu bên trái người nhìn vào) */}
      <CoupletBoard x={-2.8} y={1.78} z={z + 0.83} width={0.6} height={2.8} text={GATE_COUPLET[0]} />
      <CoupletBoard x={2.8} y={1.78} z={z + 0.83} width={0.6} height={2.8} text={GATE_COUPLET[1]} />
      {/* Hoành phi tên chùa: mặt ngoài chữ Quốc ngữ, mặt trong chữ Hán */}
      <TextPlaque x={0} y={3.95} z={z + 0.86} width={3.5} height={0.82} text={TEMPLE_NAME.toUpperCase()} />
      <TextPlaque x={0} y={3.95} z={z - 0.86} width={2.6} height={0.82} rotY={Math.PI} text={TEMPLE_NAME_HAN} font={SERIF_HAN} />
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Sân chùa
// ═════════════════════════════════════════════════════════════════════════
function CourtyardFeatures({ smoke, detail }: { smoke: number; detail: number }) {
  return (
    <group>
      <BellTower position={POS.bell} />
      <DrumTower position={POS.drum} />
      <IncenseBurner position={POS.incense} smokeCount={smoke} objectId="incense-courtyard" />
      <LotusPond position={POS.quanAm} radius={POND_RADIUS} />
      {/* Đảo đá giữa ao, tượng Quán Âm lộ thiên nhìn ra sân */}
      <mesh position={[POS.quanAm[0], Y + 0.15, POS.quanAm[1]]} material={M.stone} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.5, 0.3, 16]} />
      </mesh>
      <QuanAmStatue position={[POS.quanAm[0], Y + 0.3, POS.quanAm[1]]} rotationY={Math.atan2(15, 8)} />
      <BodhiTree position={POS.bodhi} detail={detail} />
      {FLAG_POLES.map((p) => (
        <FlagPole key={p[0]} position={p} />
      ))}
      {STONE_STUPAS.map((p) => (
        <StoneStupa key={p[0]} position={p} />
      ))}
      {LANTERN_POSITIONS.map(([x, z]) => (
        <Lantern key={`${x}${z}`} x={x} z={z} />
      ))}
      {TREE_POSITIONS.map(([x, z, s]) => (
        <Tree key={`${x}${z}`} position={[x, Y, z]} scale={s} detail={detail} />
      ))}
      <BaoThap position={POS.baoThap} />
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Tiền đường
// ═════════════════════════════════════════════════════════════════════════
function TienDuong() {
  const f = platform(0).h; // 0.6
  const H = 4.2;
  return (
    <group>
      <Slab r={platform(0)} h={f} />
      <Wall r={r(-11.3, -3, -33.9, -33.2)} y0={f} h={H} />
      <Wall r={r(3, 11.3, -33.9, -33.2)} y0={f} h={H} />
      <Wall r={r(-3, 3, -33.9, -33.2)} y0={f + 3.0} h={H - 3.0} />
      <Wall r={r(-11.4, -10.7, -33.9, -26.4)} y0={f} h={H} />
      <Wall r={r(10.7, 11.4, -33.9, -26.4)} y0={f} h={H} />
      {TIEN_DUONG_COLS.map((x) => (
        <Column key={x} x={x} z={-26.7} y0={f} h={H} />
      ))}
      <Beam from={[-11, -26.7]} to={[11, -26.7]} y={f + H - 0.15} />
      <Plaque x={0} y={f + 3.4} z={-26.4} width={3.2} />
      <Ceiling r={r(-11.6, 11.6, -34.2, -25.9)} y={f + H} />
      <Roof width={25.2} depth={11} height={2.7} position={[0, Y + f + H, -29.9]} pearl />

      <Near x={0} z={-30}>
        {/* Ban Đức Ông (trái) */}
        <AltarTiers x={-7.5} z={-33.3} y0={f} width={4.2} tiers={[[0.9, 1.3], [1.0, 0.95]]} />
        <SeatedFigure position={[-7.5, Y + f + 1.3, -32.85]} scale={1.15} robe={M.robeRed} head="hat" beard holding="none" />
        <StandingFigure position={[-9.1, Y + f + 0.95, -31.9]} scale={0.62} robe={M.robeGreen} head="hair" holding="scroll" />
        <StandingFigure position={[-5.9, Y + f + 0.95, -31.9]} scale={0.62} robe={M.robeBlue} head="hair" holding="fan" />
        {/* Ban Thánh Hiền (phải): tôn giả A Nan Đà */}
        <AltarTiers x={7.5} z={-33.3} y0={f} width={4.2} tiers={[[0.9, 1.3], [1.0, 0.95]]} />
        <SeatedFigure position={[7.5, Y + f + 1.3, -32.85]} scale={1.15} robe={M.robeSaffron} head="bald" halo />
        <StandingFigure position={[5.9, Y + f + 0.95, -31.9]} scale={0.62} robe={M.robeBrown} head="bald" holding="staff" />
        <StandingFigure position={[9.1, Y + f + 0.95, -31.9]} scale={0.62} robe={M.robeBrown} head="bald" holding="bowl" />
        {/* Hương án giữa */}
        <mesh position={[0, Y + f + 0.47, -29.55]} material={M.lacquer} castShadow>
          <boxGeometry args={[2.6, 0.94, 0.9]} />
        </mesh>
        <mesh position={[0, Y + f + 1.1, -29.55]} material={M.bronze}>
          <cylinderGeometry args={[0.2, 0.15, 0.3, 14]} />
        </mesh>
        <CandlePair x={0} z={-29.55} y={f + 0.94} spread={1.0} />
        {/* Bát bộ Kim Cương: 4 vị mỗi bên */}
        {KIM_CUONG_Z.map((z, i) => (
          <group key={z}>
            <StandingFigure
              position={[-10.0, Y + f, z]}
              rotY={Math.PI / 2}
              scale={1.12}
              guard
              robe={i % 2 ? M.armorRed : M.armor}
              skin={M.statueFierce}
              head="helmet"
              beard={i % 2 === 0}
              holding={(i % 2 ? "club" : "sword") as Holding}
            />
            <StandingFigure
              position={[10.0, Y + f, z]}
              rotY={-Math.PI / 2}
              scale={1.12}
              guard
              robe={i % 2 ? M.armor : M.armorRed}
              skin={M.statueFierce}
              head="helmet"
              beard={i % 2 === 1}
              holding={(i % 2 ? "sword" : "club") as Holding}
            />
          </group>
        ))}
      </Near>
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Thiêu hương
// ═════════════════════════════════════════════════════════════════════════
function ThieuHuong({ smoke }: { smoke: number }) {
  const f = platform(1).h;
  return (
    <group>
      <Slab r={platform(1)} h={f} steps="none" />
      <Wall r={r(-3.4, -2.8, -38.5, -33.5)} y0={f} h={3.4} />
      <Wall r={r(2.8, 3.4, -38.5, -33.5)} y0={f} h={3.4} />
      <Ceiling r={r(-3.4, 3.4, -38.6, -33.4)} y={f + 3.4} />
      <Roof width={8.4} depth={6.6} height={1.6} position={[0, Y + f + 3.4, -36]} rotationY={Math.PI / 2} />
      <mesh position={[0, Y + f + 0.45, -36]} material={M.lacquer} castShadow>
        <boxGeometry args={[1.3, 0.9, 0.9]} />
      </mesh>
      <mesh position={[0, Y + f + 1.08, -36]} material={M.bronze}>
        <cylinderGeometry args={[0.28, 0.22, 0.36, 16]} />
      </mesh>
      <group position={[0, Y + f + 0.95, -36]}>
        <IncenseSticks objectId="thieu-huong" y={0} />
      </group>
      <Smoke count={Math.max(6, Math.round(smoke * 0.6))} origin={[0, Y + f + 1.75, -36]} objectId="thieu-huong" />
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Thượng điện
// ═════════════════════════════════════════════════════════════════════════
function OfferedFlowers({ y, z }: { y: number; z: number }) {
  const count = useTempleStore((s) => s.flowerCount);
  const slots = [-0.6, 0.6, -1.0, 1.0, -0.3, 0.3, -1.3, 1.3];
  return (
    <group>
      {slots.slice(0, Math.min(count, slots.length)).map((x, i) => (
        <LotusFlower key={i} position={[x, y, z]} scale={1.4} />
      ))}
    </group>
  );
}

function ThuongDien() {
  const f = platform(2).h;
  const H = 5.5;
  const zc = -44.5;
  const base = Y + f;
  return (
    <group>
      <Slab r={platform(2)} h={f} steps="none" />
      <Wall r={r(-9.8, -3, -38.9, -38.2)} y0={f} h={H} />
      <Wall r={r(3, 9.8, -38.9, -38.2)} y0={f} h={H} />
      <Wall r={r(-3, 3, -38.9, -38.2)} y0={f + 3.4} h={H - 3.4} />
      <Wall r={r(-9.8, -9.1, -50.8, -38.2)} y0={f} h={H} />
      <Wall r={r(9.1, 9.8, -50.8, -38.2)} y0={f} h={H} />
      <Wall r={r(-9.8, 9.8, -50.8, -50.1)} y0={f} h={H} />
      {/* Cửa bức bàn mặt tiền */}
      {[-8, -6.5, -5, 5, 6.5, 8].map((x) => (
        <mesh key={x} position={[x, Y + f + 1.6, -38.12]} material={M.lattice}>
          <boxGeometry args={[1.3, 2.8, 0.05]} />
        </mesh>
      ))}
      <Plaque x={0} y={f + 4.4} z={-38.1} width={3.6} />
      {/* Mái chồng diêm hai tầng */}
      <Ceiling r={r(-9.8, 9.8, -50.8, -38.2)} y={f + H} />
      <Roof width={22.4} depth={15.6} height={2.4} position={[0, Y + f + H, zc]} ridge={false} />
      <Wall r={r(-6, 6, zc - 4, zc + 4)} y0={f + H + 1.3} h={1.5} material={M.ochreWallDark} />
      <Roof width={15} depth={10.2} height={2.3} position={[0, Y + f + H + 2.8, zc]} pearl />

      <Near x={0} z={zc}>
        {/* Bàn thờ bốn cấp: Tam Thế → Di Đà tam tôn → Thích Ca → Cửu Long */}
        <AltarTiers x={0} z={-50.1} y0={f} width={14} tiers={[[1.6, 2.6], [1.5, 1.9], [1.5, 1.25], [1.8, 0.7]]} />
        {[-3.2, 0, 3.2].map((x) => (
          <SeatedBuddha key={x} position={[x, base + 2.6, -49.3]} scale={1.0} />
        ))}
        <SeatedBuddha position={[0, base + 1.9, -47.75]} scale={0.9} />
        <StandingFigure position={[-2.3, base + 1.9, -47.75]} scale={0.85} robe={M.robeWhite} head="crown" holding="vase" halo />
        <StandingFigure position={[2.3, base + 1.9, -47.75]} scale={0.85} robe={M.robeSaffron} head="crown" holding="lotus" halo />
        <BuddhaStatue position={[0, base + 1.25, -46.3]} scale={0.78} />
        <CuuLong position={[0, base + 0.7, -44.6]} scale={0.6} />
        <CandlePair x={0} z={-44.1} y={f + 0.7} spread={2.4} />
        <OfferedFlowers y={base + 0.7} z={-44.0} />
        {/* Phướn hai bên */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 8.2, base + 2.9, -49.9]} material={M.lacquer}>
            <boxGeometry args={[0.8, 4.2, 0.04]} />
          </mesh>
        ))}
      </Near>
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Hành lang & Thập bát La Hán
// ═════════════════════════════════════════════════════════════════════════
const LA_HAN_STYLE: { robe: THREE.Material; beard: boolean; holding: Holding }[] = [
  { robe: M.robeSaffron, beard: false, holding: "bowl" },
  { robe: M.robeBrown, beard: true, holding: "staff" },
  { robe: M.robeGrey, beard: false, holding: "scroll" },
  { robe: M.robeRed, beard: true, holding: "none" },
  { robe: M.robeSaffron, beard: false, holding: "lotus" },
  { robe: M.robeGreen, beard: true, holding: "fan" },
  { robe: M.robeBrown, beard: false, holding: "vase" },
  { robe: M.robeGrey, beard: true, holding: "bowl" },
  { robe: M.robeSaffron, beard: false, holding: "scroll" },
];

function HanhLang({ side }: { side: -1 | 1 }) {
  const f = 0.3;
  const innerX = side * 17.7;
  const midX = side * 20;
  const zc = -43.75;
  return (
    <group>
      <Slab r={platform(side < 0 ? 3 : 4)} h={f} steps="none" />
      <Wall r={side < 0 ? r(-23, -22.3, -62, -25.8) : r(22.3, 23, -62, -25.8)} y0={f} h={3.3} />
      {HANH_LANG_COL_Z.map((z) => (
        <Column key={z} x={innerX} z={z} y0={f} h={3.2} radius={0.2} />
      ))}
      <Beam from={[innerX, -26.5]} to={[innerX, -61]} y={f + 3.1} size={0.28} />
      <Ceiling r={side < 0 ? r(-23, -17.2, -62, -25.6) : r(17.2, 23, -62, -25.6)} y={f + 3.3} />
      <Roof width={37.6} depth={7.2} height={1.5} position={[midX, Y + f + 3.3, zc]} rotationY={Math.PI / 2} ridge={false} />
      <Near x={midX} z={zc} r={30}>
        <mesh position={[side * 21.5, Y + f + 0.25, -44.5]} material={M.stoneDark} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.5, 33]} />
        </mesh>
        {LA_HAN_Z.map((z, i) => {
          const st = LA_HAN_STYLE[(i + (side > 0 ? 4 : 0)) % LA_HAN_STYLE.length];
          return (
            <SeatedFigure
              key={z}
              position={[side * 21.55, Y + f + 0.5, z]}
              rotY={-side * (Math.PI / 2)}
              scale={0.95}
              robe={st.robe}
              head="bald"
              beard={st.beard}
              holding={st.holding}
              seat={false}
            />
          );
        })}
      </Near>
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Nhà Tổ & Điện Mẫu
// ═════════════════════════════════════════════════════════════════════════
function NhaTo() {
  const f = platform(5).h;
  const H = 3.9;
  const base = Y + f;
  return (
    <group>
      <Slab r={platform(5)} h={f} />
      <Wall r={r(-13.8, 13.8, -64.9, -64.2)} y0={f} h={H} />
      <Wall r={r(-13.9, -13.2, -64.9, -56.4)} y0={f} h={H} />
      <Wall r={r(13.2, 13.9, -64.9, -56.4)} y0={f} h={H} />
      {NHA_TO_COLS.map((x) => (
        <Column key={x} x={x} z={-56.7} y0={f} h={H} />
      ))}
      <Beam from={[-13.5, -56.7]} to={[13.5, -56.7]} y={f + H - 0.15} />
      <Plaque x={0} y={f + 3.25} z={-56.4} width={2.8} />
      <Ceiling r={r(-13.9, 13.9, -64.9, -56.3)} y={f + H} />
      <Roof width={30.4} depth={11.6} height={2.4} position={[0, Y + f + H, -60.6]} pearl />
      <Near x={0} z={-60.5}>
        <AltarTiers x={0} z={-64.3} y0={f} width={8.6} tiers={[[1.5, 1.3], [1.2, 0.8]]} />
        <SeatedFigure position={[-2.4, base + 1.3, -63.5]} robe={M.robeBrown} head="bald" holding="staff" />
        <SeatedFigure position={[0, base + 1.3, -63.5]} scale={1.1} robe={M.robeSaffron} head="bald" beard />
        <SeatedFigure position={[2.4, base + 1.3, -63.5]} robe={M.robeBrown} head="bald" holding="scroll" />
        {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
          <Tablet key={x} position={[x, base + 0.8, -62.2]} scale={0.8} />
        ))}
        <CandlePair x={0} z={-61.9} y={f + 0.8} spread={3.2} />
      </Near>
    </group>
  );
}

function DienMau() {
  const f = platform(6).h;
  const H = 3.6;
  const base = Y + f;
  return (
    <group>
      <Slab r={platform(6)} h={f} />
      <Wall r={r(-7.8, 7.8, -74.9, -74.2)} y0={f} h={H} />
      <Wall r={r(-7.9, -7.2, -74.9, -67.4)} y0={f} h={H} />
      <Wall r={r(7.2, 7.9, -74.9, -67.4)} y0={f} h={H} />
      {DIEN_MAU_COLS.map((x) => (
        <Column key={x} x={x} z={-67.7} y0={f} h={H} />
      ))}
      <Beam from={[-7.5, -67.7]} to={[7.5, -67.7]} y={f + H - 0.15} />
      <Plaque x={0} y={f + 3.0} z={-67.4} width={2.4} />
      <Ceiling r={r(-7.9, 7.9, -74.9, -67.3)} y={f + H} />
      <Roof width={18} depth={9.8} height={2.1} position={[0, Y + f + H, -71]} material={M.tileGreen} pearl />
      <Near x={0} z={-71}>
        <AltarTiers x={0} z={-74.3} y0={f} width={9.6} tiers={[[1.4, 1.4], [1.0, 0.9]]} material={M.lacquerDark} />
        {/* Tam tòa Thánh Mẫu: Thượng Ngàn (xanh) · Thượng Thiên (đỏ) · Thoải (trắng) */}
        <SeatedFigure position={[-2.0, base + 1.4, -73.6]} robe={M.robeGreen} head="khanChau" holding="fan" />
        <SeatedFigure position={[0, base + 1.4, -73.6]} scale={1.08} robe={M.robeRed} head="khanChau" holding="fan" />
        <SeatedFigure position={[2.0, base + 1.4, -73.6]} robe={M.robeWhite} head="khanChau" holding="fan" />
        {/* Diềm đỏ trên khám */}
        <mesh position={[0, base + 3.2, -73.3]} material={M.robeRed}>
          <boxGeometry args={[7.4, 0.5, 0.05]} />
        </mesh>
        <CandlePair x={0} z={-72.3} y={f + 0.9} spread={2.6} />
      </Near>
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Khu phụ trợ: Tăng xá, Trai đường, Giảng đường
// ═════════════════════════════════════════════════════════════════════════
function ClosedHouse({
  rect,
  height,
  frontX,
  windows,
  chimney = false,
}: {
  rect: { minX: number; maxX: number; minZ: number; maxZ: number };
  height: number;
  /** Mặt tiền nhìn về phía trục giữa (toạ độ X của mặt tường). */
  frontX: number;
  windows: number;
  chimney?: boolean;
}) {
  const w = rect.maxX - rect.minX;
  const d = rect.maxZ - rect.minZ;
  const cx = (rect.minX + rect.maxX) / 2;
  const cz = (rect.minZ + rect.maxZ) / 2;
  const dir = frontX < cx ? -1 : 1;
  return (
    <group>
      <Slab r={{ minX: rect.minX - 0.4, maxX: rect.maxX + 0.4, minZ: rect.minZ - 0.4, maxZ: rect.maxZ + 0.4 }} h={0.3} floor={M.stone} steps="none" />
      <Wall r={rect} y0={0.3} h={height} material={M.plaster} />
      {/* Hiên cột phía trước */}
      {Array.from({ length: windows }, (_, i) => {
        const z = rect.minZ + ((i + 0.5) * d) / windows;
        return (
          <group key={i}>
            <mesh position={[frontX + dir * 0.03, Y + 0.3 + 1.5, z]} material={i === Math.floor(windows / 2) ? M.lattice : M.lacquerDark}>
              <boxGeometry args={[0.04, i === Math.floor(windows / 2) ? 2.4 : 1.2, i === Math.floor(windows / 2) ? 1.6 : 1.1]} />
            </mesh>
          </group>
        );
      })}
      <Roof
        width={d + 1.8}
        depth={w + 2.2}
        height={2.0}
        position={[cx, Y + 0.3 + height, cz]}
        rotationY={Math.PI / 2}
        ridge={d > w}
      />
      {chimney && (
        <mesh position={[cx + w * 0.22, Y + 0.3 + height + 1.4, cz + d * 0.22]} material={M.stoneDark} castShadow>
          <boxGeometry args={[0.7, 2.0, 0.7]} />
        </mesh>
      )}
    </group>
  );
}

function GiangDuong() {
  const f = platform(7).h;
  const H = 3.8;
  return (
    <group>
      <Slab r={platform(7)} h={f} steps="left" />
      <Wall r={r(34.2, 34.9, -57.8, -46.2)} y0={f} h={H} />
      <Wall r={r(24.3, 34.9, -57.9, -57.2)} y0={f} h={H} />
      <Wall r={r(24.3, 34.9, -46.8, -46.1)} y0={f} h={H} />
      {GIANG_DUONG_COL_Z.map((z) => (
        <Column key={z} x={24.7} z={z} y0={f} h={H} radius={0.22} />
      ))}
      <Beam from={[24.7, -57.5]} to={[24.7, -46.5]} y={f + H - 0.15} size={0.3} />
      <TextPlaque x={24.42} y={f + 3.2} z={-52} width={2.6} height={0.62} rotY={-Math.PI / 2} text="GIẢNG ĐƯỜNG" />
      <Ceiling r={r(24.4, 34.9, -57.9, -46.1)} y={f + H} />
      <Roof width={13.4} depth={12.6} height={2.2} position={[29.6, Y + f + H, -52]} rotationY={Math.PI / 2} pearl />
      <Near x={29.6} z={-52} r={30}>
        {/* Bục giảng: thầy ngồi giữa, bàn Phật phía sau, bàn giảng thấp phía trước */}
        <mesh position={[32.7, Y + f + 0.2, -52]} material={M.wood} castShadow receiveShadow>
          <boxGeometry args={[3, 0.4, 2.8]} />
        </mesh>
        <mesh position={[32.7, Y + f + 0.405, -52]} rotation-x={-Math.PI / 2} material={M.robeRed}>
          <planeGeometry args={[2.6, 2.4]} />
        </mesh>
        <mesh position={[33.85, Y + f + 0.9, -52]} material={M.lacquer} castShadow>
          <boxGeometry args={[0.6, 1.0, 1.4]} />
        </mesh>
        <group position={[33.85, Y + f + 1.4, -52]} rotation-y={-Math.PI / 2}>
          <SeatedBuddha position={[0, 0, 0]} scale={0.55} />
        </group>
        <mesh position={[31.75, Y + f + 0.55, -52]} material={M.lacquer} castShadow>
          <boxGeometry args={[0.45, 0.3, 1.1]} />
        </mesh>
        <mesh position={[31.75, Y + f + 0.72, -52]} material={M.candle}>
          <boxGeometry args={[0.3, 0.04, 0.42]} />
        </mesh>
        <mesh position={[32.75, Y + f + 0.46, -52]} material={M.cushion}>
          <cylinderGeometry args={[0.42, 0.45, 0.12, 18]} />
        </mesh>
        {/* Chiếu & bồ đoàn cho đại chúng */}
        {GIANG_DUONG_MATS.map(([x, z]) => (
          <group key={`${x}${z}`}>
            <mesh position={[x, Y + f + 0.012, z]} rotation-x={-Math.PI / 2} material={M.mat}>
              <planeGeometry args={[1.5, 1.3]} />
            </mesh>
            <mesh position={[x, Y + f + 0.06, z]} material={M.cushion}>
              <cylinderGeometry args={[0.34, 0.36, 0.1, 16]} />
            </mesh>
          </group>
        ))}
        {/* Kệ kinh */}
        {[-56.6, -47.4].map((z) => (
          <group key={z}>
            <mesh position={[33.4, Y + f + 1.1, z]} material={M.wood} castShadow>
              <boxGeometry args={[1.4, 2.2, 0.5]} />
            </mesh>
            {[0.5, 1.1, 1.7].map((y, i) => (
              <mesh key={y} position={[33.4, Y + f + y, z + (z < -52 ? 0.27 : -0.27)]} material={M.book[i]}>
                <boxGeometry args={[1.1, 0.4, 0.04]} />
              </mesh>
            ))}
          </group>
        ))}
      </Near>
    </group>
  );
}


// ═════════════════════════════════════════════════════════════════════════
// Thiền đường
// ═════════════════════════════════════════════════════════════════════════
function ThienDuong({ smoke }: { smoke: number }) {
  const f = platform(10).h;
  const H = 3.7;
  const base = Y + f;
  return (
    <group>
      <Slab r={platform(10)} h={f} floor={M.woodFloor} steps="left" />
      <Wall r={r(34.2, 34.9, -74.9, -63.6)} y0={f} h={H} />
      <Wall r={r(18.3, 34.9, -74.9, -74.2)} y0={f} h={H} />
      <Wall r={r(18.3, 34.9, -64.3, -63.6)} y0={f} h={H} />
      {/* Cửa sổ chấn song hai bên */}
      {[21.5, 25, 28.5, 32].map((x) => (
        <group key={x}>
          <mesh position={[x, base + 1.9, -74.15]} material={M.lattice}>
            <boxGeometry args={[1.6, 1.1, 0.05]} />
          </mesh>
          <mesh position={[x, base + 1.9, -63.65]} material={M.lattice}>
            <boxGeometry args={[1.6, 1.1, 0.05]} />
          </mesh>
        </group>
      ))}
      {THIEN_DUONG_COL_Z.map((z) => (
        <Column key={z} x={18.7} z={z} y0={f} h={H} radius={0.22} />
      ))}
      <Beam from={[18.7, -74.3]} to={[18.7, -63.7]} y={f + H - 0.15} size={0.3} />
      <TextPlaque x={18.4} y={f + 3.05} z={-69.25} width={2.6} height={0.62} rotY={-Math.PI / 2} text="THIỀN ĐƯỜNG" />
      <Ceiling r={r(18.3, 34.9, -74.9, -63.6)} y={f + H} />
      <Roof width={19.2} depth={13.6} height={2.3} position={[26.6, Y + f + H, -69.25]} pearl />
      <Near x={26.5} z={-69.25} r={30}>
        {/* Bàn Phật */}
        <mesh position={[33.3, base + 0.5, -69]} material={M.lacquer} castShadow>
          <boxGeometry args={[1.8, 1.0, 3.2]} />
        </mesh>
        <group position={[33.55, base + 1.0, -69]} rotation-y={-Math.PI / 2}>
          <SeatedBuddha position={[0, 0, 0]} scale={0.8} />
        </group>
        <mesh position={[32.55, base + 1.15, -69]} material={M.bronze}>
          <cylinderGeometry args={[0.16, 0.12, 0.26, 12]} />
        </mesh>
        <group position={[32.55, base + 1.05, -69]}>
          <IncenseSticks objectId="thien-duong" y={0} />
        </group>
        <Smoke count={Math.max(4, Math.round(smoke * 0.4))} origin={[32.55, base + 1.7, -69]} objectId="thien-duong" />
        <CandlePair x={32.55} z={-69} y={f + 1.0} spread={1.2} />
        {/* Chỗ ngồi vị Thầy hướng dẫn, chuông gia trì và mõ */}
        <mesh position={[31.2, base + 0.08, -69]} material={M.robeRed}>
          <boxGeometry args={[1.3, 0.16, 1.3]} />
        </mesh>
        <mesh position={[31.2, base + 0.22, -69]} material={M.cushion}>
          <cylinderGeometry args={[0.42, 0.45, 0.12, 18]} />
        </mesh>
        <mesh position={[30.7, base + 0.25, -70.1]} material={M.bronze}>
          <sphereGeometry args={[0.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[30.7, base + 0.1, -67.9]} scale={[1, 0.8, 1]} material={M.lacquer}>
          <sphereGeometry args={[0.16, 12, 10]} />
        </mesh>
        {/* Bồ đoàn đại chúng */}
        {THIEN_CUSHIONS.map(([x, z]) => (
          <group key={`${x}${z}`}>
            <mesh position={[x, base + 0.012, z]} rotation-x={-Math.PI / 2} material={M.mat}>
              <planeGeometry args={[1.3, 1.3]} />
            </mesh>
            <mesh position={[x, base + 0.07, z]} material={M.cushion} castShadow>
              <cylinderGeometry args={[0.38, 0.41, 0.12, 18]} />
            </mesh>
          </group>
        ))}
      </Near>
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Trai đường & Nhà trù
// ═════════════════════════════════════════════════════════════════════════
const BOWL = new THREE.MeshStandardMaterial({ color: "#f1ece2", roughness: 0.35 });
const CLAY = new THREE.MeshStandardMaterial({ color: "#8a5634", roughness: 0.8 });
const FIRE = new THREE.MeshBasicMaterial({ color: "#ff7a2a" });
const VEG = new THREE.MeshStandardMaterial({ color: "#5e9a44", roughness: 0.8 });

/** Một suất ăn: bát cơm, bát canh, đôi đũa. */
function MealSet({ x, z, y, faceX }: { x: number; z: number; y: number; faceX: number }) {
  const dir = Math.sign(faceX - x); // hướng từ chỗ ngồi vào bàn
  const ex = x + dir * 0.55; // mép bàn phía người ngồi
  return (
    <group>
      <mesh position={[ex, y + 0.04, z - 0.1]} material={BOWL}>
        <sphereGeometry args={[0.07, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh position={[ex, y + 0.035, z + 0.1]} material={BOWL}>
        <sphereGeometry args={[0.06, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh position={[ex - dir * 0.02, y + 0.01, z + 0.24]} rotation-z={Math.PI / 2} material={M.wood}>
        <cylinderGeometry args={[0.006, 0.006, 0.24, 4]} />
      </mesh>
    </group>
  );
}

function TraiDuong({ smoke }: { smoke: number }) {
  const f = platform(11).h;
  const H = 3.6;
  const base = Y + f;
  const tableH = 0.38;
  return (
    <group>
      <Slab r={platform(11)} h={f} floor={M.woodFloor} steps="none" />
      {/* Bậc thềm phía trước (hướng sân) */}
      <Steps x={29.75} z={-27.2} width={5} h={f} dir={1} axis="z" />
      <Wall r={r(24.2, 24.9, -42.9, -27.6)} y0={f} h={H} material={M.plaster} />
      <Wall r={r(34.6, 35.3, -42.9, -27.6)} y0={f} h={H} material={M.plaster} />
      <Wall r={r(24.2, 35.3, -42.9, -42.2)} y0={f} h={H} material={M.plaster} />
      {/* Vách ngăn nhà trù, cửa đi ở x 32.3–34 */}
      <Wall r={r(24.2, 32.3, -39.1, -38.5)} y0={f} h={H} material={M.plaster} />
      <Wall r={r(34.0, 35.3, -39.1, -38.5)} y0={f} h={H} material={M.plaster} />
      <Wall r={r(32.3, 34.0, -39.1, -38.5)} y0={f + 2.4} h={H - 2.4} material={M.plaster} />
      {/* Cửa sổ hai bên */}
      {[-36.5, -33.5, -30.5].map((z) => (
        <group key={z}>
          <mesh position={[24.88, base + 1.9, z]} material={M.lattice}>
            <boxGeometry args={[0.05, 1.0, 1.4]} />
          </mesh>
          <mesh position={[34.62, base + 1.9, z]} material={M.lattice}>
            <boxGeometry args={[0.05, 1.0, 1.4]} />
          </mesh>
        </group>
      ))}
      {TRAI_DUONG_COL_X.map((x) => (
        <Column key={x} x={x} z={-27.8} y0={f} h={H} radius={0.2} />
      ))}
      <Beam from={[24.9, -27.8]} to={[34.6, -27.8]} y={f + H - 0.15} size={0.3} />
      <TextPlaque x={29.75} y={f + 3.05} z={-27.5} width={2.6} height={0.62} text="TRAI ĐƯỜNG" />
      <Ceiling r={r(24.2, 35.3, -42.9, -27.4)} y={f + H} />
      <Roof width={17.2} depth={13} height={2.2} position={[29.75, Y + f + H, -35.1]} rotationY={Math.PI / 2} />
      {/* Ống khói nhà trù */}
      <mesh position={[33.6, Y + f + H + 1.6, -41.4]} material={M.stoneDark} castShadow>
        <boxGeometry args={[0.7, 2.4, 0.7]} />
      </mesh>
      {/* Khánh đồng treo ở hiên — đánh báo giờ thọ trai */}
      <group position={[25.6, base + 2.6, -28.1]}>
        <mesh position={[0, 0.35, 0]} material={M.wood}>
          <cylinderGeometry args={[0.015, 0.015, 0.7, 4]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} scale={[1, 0.35, 1]} material={M.bronze}>
          <torusGeometry args={[0.22, 0.07, 6, 18, Math.PI]} />
        </mesh>
      </group>

      <Near x={29.75} z={-35} r={30}>
        {/* Bàn Phật đầu nhà */}
        <mesh position={[29.75, base + 0.5, -38.15]} material={M.lacquer} castShadow>
          <boxGeometry args={[2.3, 1.0, 0.7]} />
        </mesh>
        <SeatedBuddha position={[29.75, base + 1.0, -38.25]} scale={0.45} />
        <CandlePair x={29.75} z={-37.95} y={f + 1.0} spread={0.8} />
        {/* Bàn & chỗ ngồi vị trụ trì */}
        <mesh position={[29.75, base + tableH / 2, -36.6]} material={M.lacquer} castShadow>
          <boxGeometry args={[4.1, tableH, 0.6]} />
        </mesh>
        {[-1.2, 0, 1.2].map((dx) => (
          <group key={dx}>
            <mesh position={[29.75 + dx, base + 0.04, -37.35]} material={M.cushion}>
              <cylinderGeometry args={[0.32, 0.34, 0.08, 14]} />
            </mesh>
            <mesh position={[29.75 + dx, base + tableH + 0.04, -36.75]} material={BOWL}>
              <sphereGeometry args={[0.07, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            </mesh>
          </group>
        ))}
        {/* Hai dãy bàn thấp, chiếu và suất ăn */}
        {TRAI_TABLE_X.map((tx) => (
          <group key={tx}>
            <mesh position={[tx, base + tableH / 2, -32.5]} material={M.woodLight} castShadow receiveShadow>
              <boxGeometry args={[0.76, tableH, 6.4]} />
            </mesh>
            {[-34.6, -31.8, -29.6].map((z) => (
              <group key={z} position={[tx, base + tableH, z]}>
                <mesh position={[0, 0.08, 0]} material={BOWL}>
                  <sphereGeometry args={[0.09, 12, 10]} />
                </mesh>
                <mesh position={[0.08, 0.1, 0]} rotation-z={-1.1} material={BOWL}>
                  <cylinderGeometry args={[0.012, 0.018, 0.1, 6]} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        {TRAI_SEATS.map(([x, z, tx]) => (
          <group key={`${x}${z}`}>
            <mesh position={[x, base + 0.012, z]} rotation-x={-Math.PI / 2} material={M.mat}>
              <planeGeometry args={[0.8, 1.1]} />
            </mesh>
            <MealSet x={x} z={z} y={base + tableH} faceX={tx} />
          </group>
        ))}

        {/* Nhà trù: bếp lò, nồi lớn, lu nước, bàn sơ chế, kệ bát, củi */}
        <mesh position={[32.7, base + 0.45, -41.65]} material={M.stoneDark} castShadow>
          <boxGeometry args={[3.6, 0.9, 1.3]} />
        </mesh>
        {[31.8, 33.6].map((x) => (
          <group key={x}>
            <mesh position={[x, base + 0.35, -40.99]} material={FIRE}>
              <planeGeometry args={[0.5, 0.3]} />
            </mesh>
            <mesh position={[x, base + 1.15, -41.65]} material={M.bronzeDark} castShadow>
              <cylinderGeometry args={[0.48, 0.38, 0.5, 18]} />
            </mesh>
            <mesh position={[x, base + 1.41, -41.65]} material={M.bronze}>
              <cylinderGeometry args={[0.46, 0.46, 0.04, 18]} />
            </mesh>
          </group>
        ))}
        <Smoke count={Math.max(4, Math.round(smoke * 0.4))} origin={[31.8, base + 1.5, -41.65]} objectId="bep-nha-tru" />
        {[[25.6, -39.8, 0.42], [25.5, -40.9, 0.32]].map(([x, z, rr]) => (
          <mesh key={z} position={[x, base + rr, z]} scale={[1, 1.15, 1]} material={CLAY} castShadow>
            <sphereGeometry args={[rr, 14, 12]} />
          </mesh>
        ))}
        <mesh position={[28.3, base + 0.4, -40.2]} material={M.woodLight} castShadow>
          <boxGeometry args={[2.0, 0.8, 0.8]} />
        </mesh>
        {[-0.6, -0.3, 0.1, 0.5].map((dx, i) => (
          <mesh key={dx} position={[28.3 + dx, base + 0.86, -40.2 + (i % 2 ? 0.15 : -0.12)]} material={i % 2 ? VEG : M.lotusCenter}>
            <sphereGeometry args={[0.09, 8, 6]} />
          </mesh>
        ))}
        <mesh position={[26.2, base + 0.9, -41.8]} material={M.wood} castShadow>
          <boxGeometry args={[2.4, 1.8, 0.5]} />
        </mesh>
        {[0.5, 1.05, 1.55].map((y) =>
          [-0.8, -0.3, 0.2, 0.7].map((dx) => (
            <mesh key={`${y}${dx}`} position={[26.2 + dx, base + y, -41.5]} material={BOWL}>
              <cylinderGeometry args={[0.1, 0.07, 0.12, 10]} />
            </mesh>
          )),
        )}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[30.1, base + 0.1 + i * 0.16, -41.9]} rotation-z={Math.PI / 2} material={M.trunk}>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 6]} />
          </mesh>
        ))}
      </Near>
    </group>
  );
}
// ═════════════════════════════════════════════════════════════════════════
export function TempleCompound({ smoke, detail }: { smoke: number; detail: number }) {
  return (
    <group name="TempleCompound">
      <CompoundWalls />
      <TamQuan />
      <CourtyardFeatures smoke={smoke} detail={detail} />
      <TienDuong />
      <ThieuHuong smoke={smoke} />
      <ThuongDien />
      <HanhLang side={-1} />
      <HanhLang side={1} />
      <NhaTo />
      <DienMau />
      <ClosedHouse rect={r(-34.5, -26, -51.5, -28.5)} height={3.4} frontX={-26} windows={7} />
      <TraiDuong smoke={smoke} />
      <GiangDuong />
      <ThienDuong smoke={smoke} />
    </group>
  );
}
