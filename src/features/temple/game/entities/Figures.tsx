import type * as THREE from "three";
import { M } from "./materials";
import { BuddhaFigure, type Aureole } from "./BuddhaFigure";
import { CrossCollar, darker, Hand, Head, Limb, skirtGeo, torsoGeo, type FaceKind, type HairKind } from "./PersonParts";

/**
 * Bộ tượng dựng thủ tục, dùng chung cho Tiền đường, Thượng điện, Hành lang, Nhà Tổ, Điện Mẫu.
 * Mỗi tượng chỉ ~10–20 mesh để chạy được trên điện thoại.
 * Toạ độ position là toạ độ thế giới (y tuyệt đối, đứng/ngồi trên mặt bệ).
 */
type V3 = [number, number, number];
type Mat = THREE.Material;

export type HeadStyle = "bald" | "hair" | "crown" | "helmet" | "hat" | "khanChau" | "buddha";
export type Holding = "vase" | "staff" | "sword" | "club" | "scroll" | "lotus" | "fan" | "bowl" | "none";

function Held({ item, at }: { item: Holding; at: V3 }) {
  switch (item) {
    case "vase":
      return (
        <mesh position={[at[0], at[1] + 0.08, at[2]]} material={M.whiteJade}>
          <cylinderGeometry args={[0.025, 0.05, 0.18, 10]} />
        </mesh>
      );
    case "lotus":
      return (
        <mesh position={[at[0], at[1] + 0.06, at[2]]} scale={[1, 0.7, 1]} material={M.lotusPink}>
          <sphereGeometry args={[0.07, 10, 8]} />
        </mesh>
      );
    case "bowl":
      return (
        <mesh position={[at[0], at[1] + 0.03, at[2]]} material={M.bronze}>
          <sphereGeometry args={[0.08, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </mesh>
      );
    case "scroll":
      return (
        <mesh position={at} rotation-z={Math.PI / 2} material={M.candle}>
          <cylinderGeometry args={[0.03, 0.03, 0.28, 8]} />
        </mesh>
      );
    case "fan":
      return (
        <mesh position={[at[0], at[1] + 0.12, at[2]]} rotation-x={-0.3} material={M.whiteJade}>
          <circleGeometry args={[0.13, 10, 0, Math.PI]} />
        </mesh>
      );
    case "staff":
      return (
        <mesh position={[at[0], at[1] + 0.2, at[2]]} material={M.woodLight}>
          <cylinderGeometry args={[0.02, 0.02, 1.9, 6]} />
        </mesh>
      );
    case "sword":
      return (
        <group position={at}>
          <mesh position={[0, 0.45, 0]} material={M.whiteJade}>
            <boxGeometry args={[0.05, 0.9, 0.015]} />
          </mesh>
          <mesh material={M.goldBright}>
            <boxGeometry args={[0.18, 0.04, 0.04]} />
          </mesh>
        </group>
      );
    case "club":
      return (
        <mesh position={[at[0], at[1] + 0.4, at[2]]} material={M.goldBright}>
          <cylinderGeometry args={[0.06, 0.03, 0.85, 8]} />
        </mesh>
      );
    default:
      return null;
  }
}

const HAIR_FOR: Record<HeadStyle, HairKind> = {
  bald: "monk",
  hair: "topknot",
  crown: "crown",
  helmet: "helmet",
  hat: "hat",
  khanChau: "khanChau",
  buddha: "topknot",
};
const FACE_FOR: Record<HeadStyle, FaceKind> = {
  bald: "arhat",
  hair: "serene",
  crown: "serene",
  helmet: "fierce",
  hat: "lord",
  khanChau: "mother",
  buddha: "serene",
};

/** Hào quang sau đầu tượng. */
function StatueHalo({ y, z = -0.2, r = 0.22 }: { y: number; z?: number; r?: number }) {
  return (
    <group position={[0, y, z]}>
      <mesh material={M.halo}>
        <circleGeometry args={[r, 28]} />
      </mesh>
      <mesh position={[0, 0, 0.004]} material={M.goldBright}>
        <torusGeometry args={[r, 0.014, 6, 32]} />
      </mesh>
    </group>
  );
}

/** Tượng đứng: thị giả, hộ pháp Kim Cương, Bồ Tát. */
export function StandingFigure({
  position,
  rotY = 0,
  scale = 1,
  robe,
  inner,
  skin = M.statueSkin,
  head = "hair",
  face,
  beard = false,
  holding = "none",
  guard = false,
  halo = false,
}: {
  position: V3;
  rotY?: number;
  scale?: number;
  robe: Mat;
  inner?: Mat;
  skin?: Mat;
  head?: HeadStyle;
  face?: FaceKind;
  beard?: boolean;
  holding?: Holding;
  guard?: boolean;
  halo?: boolean;
}) {
  const body = inner ?? robe;
  const trim = darker(robe, 0.6);
  const hip = 1.2;
  const headY = hip + 0.86;
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      {/* Bệ lục giác sơn son viền vàng */}
      <mesh position={[0, 0.06, 0]} rotation-y={Math.PI / 6} material={M.lacquerDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.43, 0.12, 6]} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation-y={Math.PI / 6} material={M.gold}>
        <cylinderGeometry args={[0.41, 0.41, 0.012, 6]} />
      </mesh>
      {/* Vạt áo dài */}
      <mesh geometry={skirtGeo()} position={[0, 0.67, 0]} scale={[guard ? 1.2 : 1.05, 1.1, guard ? 1.15 : 1.05]} material={robe} castShadow />
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.1, 0.16, 0.2]} scale={[0.06, 0.045, 0.11]} material={guard ? M.goldBright : M.shoe}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}
      {/* Thân trên */}
      <mesh geometry={torsoGeo()} position={[0, hip, 0]} scale={[guard ? 1.16 : 1.05, 1, guard ? 1.16 : 1.05]} material={body} castShadow />
      <CrossCollar material={trim} y={hip} w={guard ? 1.16 : 1.05} />
      {guard ? (
        <>
          {/* Giáp ngực, đai lưng mặt hổ phù, giáp vai, váy giáp */}
          <mesh position={[0, hip + 0.38, 0.07]} scale={[0.25, 0.2, 0.15]} material={M.goldBright} castShadow>
            <sphereGeometry args={[1, 18, 12]} />
          </mesh>
          <mesh position={[0, hip + 0.38, 0.12]} scale={[0.17, 0.13, 0.11]} material={robe}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
          <mesh position={[0, hip + 0.12, 0]} rotation-x={Math.PI / 2} scale={[1.12, 0.85, 1]} material={M.goldBright}>
            <torusGeometry args={[0.215, 0.035, 8, 28]} />
          </mesh>
          <mesh position={[0, hip + 0.12, 0.2]} material={M.lanternRed}>
            <sphereGeometry args={[0.055, 12, 10]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.27, hip + 0.6, 0]} scale={[0.12, 0.08, 0.12]} material={M.goldBright} castShadow>
              <sphereGeometry args={[1, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          ))}
          {[-0.9, -0.3, 0.3, 0.9, Math.PI].map((a) => (
            <mesh key={a} position={[Math.sin(a) * 0.25, hip - 0.18, Math.cos(a) * 0.22]} rotation={[-0.15, a, 0]} material={body} castShadow>
              <boxGeometry args={[0.2, 0.38, 0.03]} />
            </mesh>
          ))}
          {/* Khăn bay sau lưng */}
          <mesh position={[0, hip + 0.6, -0.2]} rotation-z={Math.PI} material={darker(robe, 1.25)}>
            <torusGeometry args={[0.5, 0.03, 6, 36, Math.PI]} />
          </mesh>
          {/* Tay phải giơ cao cầm binh khí, tay trái chống hông */}
          <Limb from={[0.25, hip + 0.58, 0]} to={[0.42, hip + 0.38, 0.05]} r1={0.075} r2={0.085} material={body} />
          <Limb from={[0.42, hip + 0.38, 0.05]} to={[0.44, hip + 0.62, 0.18]} r1={0.065} r2={0.075} material={body} />
          <mesh position={[0.44, hip + 0.66, 0.19]} material={skin}>
            <sphereGeometry args={[0.055, 10, 8]} />
          </mesh>
          <Held item={holding} at={[0.44, hip + 0.6, 0.19]} />
          <Limb from={[-0.25, hip + 0.58, 0]} to={[-0.42, hip + 0.3, 0.02]} r1={0.075} r2={0.085} material={body} />
          <Limb from={[-0.42, hip + 0.3, 0.02]} to={[-0.24, hip + 0.14, 0.12]} r1={0.065} r2={0.075} material={body} />
          <mesh position={[-0.23, hip + 0.14, 0.13]} material={skin}>
            <sphereGeometry args={[0.055, 10, 8]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, hip + 0.16, 0]} rotation-x={Math.PI / 2} scale={[1.05, 0.8, 1]} material={M.gold}>
            <torusGeometry args={[0.21, 0.018, 6, 28]} />
          </mesh>
          {/* Hai tay chắp/cầm trước ngực, tay áo rộng rủ */}
          {[-1, 1].map((sx) => (
            <group key={sx}>
              <Limb from={[sx * 0.22, hip + 0.56, 0]} to={[sx * 0.26, hip + 0.28, 0.06]} r1={0.075} r2={0.08} material={robe} />
              <Limb from={[sx * 0.26, hip + 0.28, 0.06]} to={[sx * 0.07, hip + 0.32, 0.22]} r1={0.08} r2={0.1} material={robe} />
              <Limb from={[sx * 0.2, hip + 0.28, 0.14]} to={[sx * 0.19, hip - 0.12, 0.17]} r1={0.12} r2={0.06} material={robe} />
            </group>
          ))}
          {holding === "none" ? (
            <>
              <Hand skin={skin} side={-1} at={[-0.022, hip + 0.32, 0.27]} rot={[Math.PI - 0.2, 0, 0.12]} />
              <Hand skin={skin} side={1} at={[0.022, hip + 0.32, 0.27]} rot={[Math.PI - 0.2, 0, -0.12]} />
            </>
          ) : (
            <>
              <Hand skin={skin} side={-1} at={[-0.05, hip + 0.32, 0.27]} rot={[-1.4, 0, 0.4]} />
              <Hand skin={skin} side={1} at={[0.05, hip + 0.32, 0.27]} rot={[-1.4, 0, -0.4]} />
              <Held item={holding} at={[0, hip + 0.3, 0.32]} />
            </>
          )}
        </>
      )}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.215, hip + 0.56, 0]} material={guard ? M.goldBright : robe}>
          <sphereGeometry args={[0.085, 12, 10]} />
        </mesh>
      ))}
      <group position={[0, headY, 0]}>
        <Head face={face ?? FACE_FOR[head]} hair={HAIR_FOR[head]} skin={skin} r={0.14} beard={beard ? "black" : undefined} accent={robe} />
      </group>
      {halo && <StatueHalo y={headY + 0.02} />}
    </group>
  );
}

/** Tượng ngồi: Đức Ông, Thánh Hiền, La Hán, Tổ sư, Thánh Mẫu. */
export function SeatedFigure({
  position,
  rotY = 0,
  scale = 1,
  robe,
  skin = M.statueSkin,
  head = "bald",
  face,
  beard = false,
  beardColor = "black",
  holding = "none",
  halo = false,
  seat = true,
}: {
  position: V3;
  rotY?: number;
  scale?: number;
  robe: Mat;
  skin?: Mat;
  head?: HeadStyle;
  face?: FaceKind;
  beard?: boolean;
  beardColor?: "black" | "white";
  holding?: Holding;
  halo?: boolean;
  seat?: boolean;
}) {
  const trim = darker(robe, 0.6);
  const hip = 0.44;
  const headY = hip + 0.86;
  const chest = holding !== "none" && holding !== "staff";
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      {seat && (
        <group>
          {/* Ngai sơn son thếp vàng */}
          <mesh position={[0, 0.17, -0.06]} material={M.lacquer} castShadow receiveShadow>
            <boxGeometry args={[0.86, 0.34, 0.62]} />
          </mesh>
          <mesh position={[0, 0.345, -0.06]} material={M.gold}>
            <boxGeometry args={[0.88, 0.02, 0.64]} />
          </mesh>
          <mesh position={[0, 0.85, -0.36]} material={M.lacquer} castShadow>
            <boxGeometry args={[0.86, 1.0, 0.06]} />
          </mesh>
          <mesh position={[0, 0.85, -0.325]} material={M.gold}>
            <boxGeometry args={[0.66, 0.8, 0.01]} />
          </mesh>
          <mesh position={[0, 0.85, -0.32]} material={M.lacquerDark}>
            <boxGeometry args={[0.58, 0.72, 0.01]} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * 0.43, 0.5, -0.06]} material={M.lacquerDark}>
              <boxGeometry args={[0.06, 0.32, 0.6]} />
            </mesh>
          ))}
          <mesh position={[0, 0.04, 0.42]} material={M.lacquerDark}>
            <boxGeometry args={[0.6, 0.08, 0.24]} />
          </mesh>
        </group>
      )}
      {/* Đùi, cẳng chân, vạt áo buông */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Limb from={[sx * 0.11, hip, -0.02]} to={[sx * 0.13, hip + 0.02, 0.34]} r1={0.11} r2={0.1} material={robe} />
          <Limb from={[sx * 0.13, hip - 0.02, 0.38]} to={[sx * 0.14, 0.12, 0.42]} r1={0.08} r2={0.09} material={robe} />
          <mesh position={[sx * 0.14, 0.1, 0.5]} scale={[0.06, 0.045, 0.11]} material={M.shoe}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.3, 0.45]} rotation-x={-0.05} material={robe} castShadow>
        <boxGeometry args={[0.44, 0.34, 0.035]} />
      </mesh>
      <mesh position={[0, hip + 0.02, 0.12]} scale={[0.3, 0.1, 0.3]} material={robe}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      {/* Thân trên */}
      <mesh geometry={torsoGeo()} position={[0, hip, 0]} scale={[1.08, 1, 1.08]} material={robe} castShadow />
      <CrossCollar material={trim} y={hip} w={1.08} />
      <mesh position={[0, hip + 0.16, 0]} rotation-x={Math.PI / 2} scale={[1.08, 0.82, 1]} material={head === "hat" ? M.goldBright : trim}>
        <torusGeometry args={[0.215, 0.02, 6, 28]} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.22, hip + 0.56, 0]} material={robe}>
          <sphereGeometry args={[0.088, 12, 10]} />
        </mesh>
      ))}
      {/* Tay trái đặt trên gối */}
      <Limb from={[-0.23, hip + 0.56, 0]} to={[-0.27, hip + 0.28, 0.08]} r1={0.08} r2={0.085} material={robe} />
      <Limb from={[-0.27, hip + 0.28, 0.08]} to={[-0.18, hip + 0.08, 0.3]} r1={0.08} r2={0.105} material={robe} />
      <Hand skin={skin} side={-1} at={[-0.17, hip + 0.07, 0.35]} rot={[-1.3, 0, 0]} />
      {/* Tay phải: đặt gối, cầm pháp khí trước ngực, hoặc chống tích trượng */}
      <Limb from={[0.23, hip + 0.56, 0]} to={[0.27, hip + 0.28, 0.08]} r1={0.08} r2={0.085} material={robe} />
      {chest ? (
        <>
          <Limb from={[0.27, hip + 0.28, 0.08]} to={[0.08, hip + 0.38, 0.27]} r1={0.08} r2={0.105} material={robe} />
          <Hand skin={skin} side={1} at={[0.06, hip + 0.39, 0.3]} rot={[-1.45, 0, -0.5]} />
          <Held item={holding} at={[0.03, hip + 0.38, 0.32]} />
        </>
      ) : holding === "staff" ? (
        <>
          <Limb from={[0.27, hip + 0.28, 0.08]} to={[0.32, hip + 0.3, 0.3]} r1={0.08} r2={0.105} material={robe} />
          <Hand skin={skin} side={1} at={[0.33, hip + 0.3, 0.33]} rot={[-1.5, 0, 0]} />
          <Held item="staff" at={[0.34, hip + 0.3, 0.34]} />
        </>
      ) : (
        <>
          <Limb from={[0.27, hip + 0.28, 0.08]} to={[0.18, hip + 0.08, 0.3]} r1={0.08} r2={0.105} material={robe} />
          <Hand skin={skin} side={1} at={[0.17, hip + 0.07, 0.35]} rot={[-1.3, 0, 0]} />
        </>
      )}
      <group position={[0, headY, 0]}>
        <Head
          face={face ?? FACE_FOR[head]}
          hair={HAIR_FOR[head]}
          skin={skin}
          r={0.145}
          beard={beard ? beardColor : undefined}
          accent={robe}
        />
      </group>
      {halo && <StatueHalo y={headY + 0.02} r={0.24} />}
    </group>
  );
}

/** Tượng Phật ngồi thếp vàng trên tòa sen (ấn thiền). */
export function SeatedBuddha({
  position,
  scale = 1,
  halo = true,
  aureole,
  rotationY = 0,
}: {
  position: V3;
  scale?: number;
  halo?: boolean;
  aureole?: Aureole;
  rotationY?: number;
}) {
  return (
    <BuddhaFigure position={position} scale={scale} rotationY={rotationY} mudra="thien" aureole={aureole ?? (halo ? "head" : "none")} />
  );
}

/** Tòa Cửu Long: Đức Phật đản sinh, chín rồng phun nước tắm. */
export function CuuLong({ position, scale = 1 }: { position: V3; scale?: number }) {
  const dragons = Array.from({ length: 9 }, (_, i) => -Math.PI * 0.75 + (i / 8) * Math.PI * 1.5);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]} material={M.stoneDark} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.24, 18]} />
      </mesh>
      {/* Núi đá & rồng vây quanh */}
      <mesh position={[0, 0.55, -0.25]} scale={[0.8, 0.55, 0.4]} material={M.dragon} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {dragons.map((a) => (
        <group key={a} position={[Math.sin(a) * 0.62, 0.5 + Math.cos(a * 1.5) * 0.15, Math.cos(a) * 0.62 - 0.1]} rotation-y={a + Math.PI}>
          <mesh rotation-x={-0.9} material={M.dragon} castShadow>
            <coneGeometry args={[0.08, 0.34, 6]} />
          </mesh>
          <mesh position={[0, 0.16, 0.12]} material={M.goldBright}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
        </group>
      ))}
      {/* Thái tử đản sinh: một tay chỉ trời, một tay chỉ đất */}
      <mesh position={[0, 0.34, 0.1]} material={M.lotusPink}>
        <cylinderGeometry args={[0.18, 0.12, 0.1, 12]} />
      </mesh>
      <mesh position={[0, 0.58, 0.1]} material={M.statueGold} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.38, 10]} />
      </mesh>
      <mesh position={[0, 0.83, 0.1]} material={M.statueGold}>
        <sphereGeometry args={[0.08, 10, 8]} />
      </mesh>
      <mesh position={[0.1, 0.9, 0.1]} rotation-z={-0.2} material={M.statueGold}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
      </mesh>
      <mesh position={[-0.1, 0.5, 0.12]} rotation-z={0.2} material={M.statueGold}>
        <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
      </mesh>
    </group>
  );
}

/** Bài vị. */
export function Tablet({ position, rotY = 0, scale = 1 }: { position: V3; rotY?: number; scale?: number }) {
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      <mesh position={[0, 0.05, 0]} material={M.gold}>
        <boxGeometry args={[0.36, 0.1, 0.2]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={M.tablet}>
        <boxGeometry args={[0.28, 0.66, 0.06]} />
      </mesh>
      <mesh position={[0, 0.42, 0.035]} material={M.goldBright}>
        <boxGeometry args={[0.06, 0.5, 0.01]} />
      </mesh>
    </group>
  );
}
