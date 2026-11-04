import type * as THREE from "three";
import { M } from "./materials";

/**
 * Bộ tượng dựng thủ tục, dùng chung cho Tiền đường, Thượng điện, Hành lang, Nhà Tổ, Điện Mẫu.
 * Mỗi tượng chỉ ~10–20 mesh để chạy được trên điện thoại.
 * Toạ độ position là toạ độ thế giới (y tuyệt đối, đứng/ngồi trên mặt bệ).
 */
type V3 = [number, number, number];
type Mat = THREE.Material;

export type HeadStyle = "bald" | "hair" | "crown" | "helmet" | "hat" | "khanChau" | "buddha";
export type Holding = "vase" | "staff" | "sword" | "club" | "scroll" | "lotus" | "fan" | "bowl" | "none";

function HeadPiece({ style, y, robe, skin, beard }: { style: HeadStyle; y: number; robe: Mat; skin: Mat; beard?: boolean }) {
  return (
    <group position={[0, y, 0]}>
      <mesh material={skin} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
      </mesh>
      {style === "hair" && (
        <mesh position={[0, 0.03, -0.01]} material={M.hair}>
          <sphereGeometry args={[0.125, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
      )}
      {style === "buddha" && (
        <>
          <mesh position={[0, 0.03, -0.005]} material={M.statueGold}>
            <sphereGeometry args={[0.124, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={M.statueGold}>
            <sphereGeometry args={[0.055, 10, 8]} />
          </mesh>
        </>
      )}
      {style === "crown" && (
        <>
          <mesh position={[0, 0.06, 0]} rotation-x={Math.PI / 2} material={M.goldBright}>
            <torusGeometry args={[0.12, 0.018, 6, 20]} />
          </mesh>
          {[-0.6, 0, 0.6].map((a) => (
            <mesh key={a} position={[Math.sin(a) * 0.1, 0.13, Math.cos(a) * 0.1]} rotation-y={a} scale={[0.05, 0.08, 0.012]} material={M.goldBright}>
              <sphereGeometry args={[1, 10, 8]} />
            </mesh>
          ))}
          <mesh position={[0, 0.16, -0.02]} material={M.hair}>
            <sphereGeometry args={[0.06, 10, 8]} />
          </mesh>
        </>
      )}
      {style === "helmet" && (
        <>
          <mesh position={[0, 0.06, 0]} material={robe}>
            <sphereGeometry args={[0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={M.goldBright}>
            <coneGeometry args={[0.05, 0.18, 8]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation-x={Math.PI / 2} material={M.goldBright}>
            <torusGeometry args={[0.135, 0.015, 6, 20]} />
          </mesh>
        </>
      )}
      {style === "hat" && (
        <>
          <mesh position={[0, 0.12, -0.01]} material={M.beard}>
            <cylinderGeometry args={[0.1, 0.13, 0.16, 12]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, 0.13, -0.04]} rotation-z={s * 0.15} material={M.beard}>
              <boxGeometry args={[0.18, 0.05, 0.012]} />
            </mesh>
          ))}
          <mesh position={[0, 0.12, 0.11]} material={M.goldBright}>
            <sphereGeometry args={[0.025, 8, 6]} />
          </mesh>
        </>
      )}
      {style === "khanChau" && (
        <>
          <mesh position={[0, 0.07, 0]} material={robe}>
            <cylinderGeometry args={[0.14, 0.13, 0.12, 14]} />
          </mesh>
          <mesh position={[0, 0.06, 0.13]} material={M.goldBright}>
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
          <mesh position={[0, 0.16, -0.02]} material={robe}>
            <sphereGeometry args={[0.08, 10, 8]} />
          </mesh>
        </>
      )}
      {beard && (
        <mesh position={[0, -0.13, 0.06]} rotation-x={Math.PI} material={M.beard}>
          <coneGeometry args={[0.06, 0.2, 8]} />
        </mesh>
      )}
    </group>
  );
}

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

/** Tượng đứng: thị giả, hộ pháp Kim Cương, Bồ Tát. */
export function StandingFigure({
  position,
  rotY = 0,
  scale = 1,
  robe,
  inner,
  skin = M.statueSkin,
  head = "hair",
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
  beard?: boolean;
  holding?: Holding;
  guard?: boolean;
  halo?: boolean;
}) {
  const body = inner ?? robe;
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      {/* Bệ nhỏ */}
      <mesh position={[0, 0.06, 0]} material={M.stoneDark} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.12, 12]} />
      </mesh>
      {/* Vạt áo / giáp dưới */}
      <mesh position={[0, 0.66, 0]} material={robe} castShadow>
        <cylinderGeometry args={[0.18, guard ? 0.36 : 0.29, 1.08, 14]} />
      </mesh>
      {/* Thân trên */}
      <mesh position={[0, 1.42, 0]} material={body} castShadow>
        <cylinderGeometry args={[guard ? 0.24 : 0.2, 0.18, 0.5, 14]} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation-x={Math.PI / 2} material={guard ? M.goldBright : M.gold}>
        <torusGeometry args={[0.185, 0.025, 6, 20]} />
      </mesh>
      {/* Vai */}
      <mesh position={[0, 1.66, 0]} scale={[guard ? 0.32 : 0.25, 0.1, 0.16]} material={guard ? M.goldBright : robe}>
        <sphereGeometry args={[1, 14, 8]} />
      </mesh>
      <HeadPiece style={head} y={1.85} robe={robe} skin={skin} beard={beard} />
      {/* Tay */}
      {guard ? (
        <>
          <mesh position={[0.3, 1.5, 0.08]} rotation-z={0.9} material={body} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.42, 8]} />
          </mesh>
          <mesh position={[0.45, 1.66, 0.12]} material={skin}>
            <sphereGeometry args={[0.055, 8, 6]} />
          </mesh>
          <Held item={holding} at={[0.45, 1.6, 0.12]} />
          <mesh position={[-0.27, 1.35, 0.1]} rotation={[0.5, 0, -0.3]} material={body} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
          </mesh>
          <mesh position={[-0.3, 1.18, 0.24]} material={skin}>
            <sphereGeometry args={[0.055, 8, 6]} />
          </mesh>
        </>
      ) : (
        <>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.17, 1.36, 0.12]} rotation={[1.1, 0, s * -0.5]} material={robe} castShadow>
              <cylinderGeometry args={[0.06, 0.09, 0.4, 8]} />
            </mesh>
          ))}
          <mesh position={[0, 1.36, 0.27]} material={skin}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
          <Held item={holding} at={[0, 1.38, 0.3]} />
        </>
      )}
      {halo && (
        <mesh position={[0, 1.88, -0.18]} material={M.goldBright}>
          <torusGeometry args={[0.2, 0.015, 6, 28]} />
        </mesh>
      )}
    </group>
  );
}

/** Tượng ngồi: Đức Ông, La Hán, Tổ sư, Thánh Mẫu. */
export function SeatedFigure({
  position,
  rotY = 0,
  scale = 1,
  robe,
  skin = M.statueSkin,
  head = "bald",
  beard = false,
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
  beard?: boolean;
  holding?: Holding;
  halo?: boolean;
  seat?: boolean;
}) {
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      {seat && (
        <mesh position={[0, 0.17, -0.04]} material={M.wood} castShadow>
          <boxGeometry args={[0.8, 0.34, 0.6]} />
        </mesh>
      )}
      {/* Đùi + vạt áo */}
      <mesh position={[0, 0.42, 0.08]} scale={[0.36, 0.14, 0.32]} material={robe} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      <mesh position={[0, 0.23, 0.27]} material={robe}>
        <boxGeometry args={[0.5, 0.42, 0.08]} />
      </mesh>
      {/* Thân */}
      <mesh position={[0, 0.78, 0]} material={robe} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 0.6, 14]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} scale={[0.26, 0.1, 0.17]} material={robe}>
        <sphereGeometry args={[1, 14, 8]} />
      </mesh>
      <HeadPiece style={head} y={1.23} robe={robe} skin={skin} beard={beard} />
      {/* Tay đặt trên đùi */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 0.68, 0.14]} rotation={[0.9, 0, s * -0.25]} material={robe} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.36, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 0.58, 0.3]} scale={[1.6, 0.7, 1]} material={skin}>
        <sphereGeometry args={[0.055, 8, 6]} />
      </mesh>
      <Held item={holding} at={[0.02, 0.6, 0.32]} />
      {halo && (
        <mesh position={[0, 1.27, -0.2]} material={M.goldBright}>
          <torusGeometry args={[0.22, 0.015, 6, 28]} />
        </mesh>
      )}
    </group>
  );
}

/** Tượng Phật ngồi thếp vàng (bản nhẹ) trên tòa sen. */
export function SeatedBuddha({ position, scale = 1, halo = true }: { position: V3; scale?: number; halo?: boolean }) {
  const petals = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.1, 0]} material={M.statueGold} castShadow>
        <cylinderGeometry args={[0.62, 0.52, 0.2, 18]} />
      </mesh>
      {petals.map((a) => (
        <mesh
          key={a}
          position={[Math.sin(a) * 0.58, 0.24, Math.cos(a) * 0.58]}
          rotation={[-0.6, a, 0, "YXZ"]}
          scale={[0.17, 0.08, 0.26]}
          material={M.statueGold}
        >
          <sphereGeometry args={[1, 10, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0.04]} scale={[0.55, 0.18, 0.4]} material={M.statueGold} castShadow>
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>
      <mesh position={[0, 0.78, 0]} scale={[0.32, 0.42, 0.24]} material={M.statueGold} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.66, 0.24]} scale={[0.16, 0.06, 0.1]} material={M.goldBright}>
        <sphereGeometry args={[1, 10, 6]} />
      </mesh>
      <mesh position={[0, 1.27, 0.01]} scale={[0.17, 0.2, 0.18]} material={M.statueGold} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <mesh position={[0, 1.47, 0]} material={M.statueGold}>
        <sphereGeometry args={[0.075, 10, 8]} />
      </mesh>
      {halo && (
        <>
          <mesh position={[0, 1.27, -0.26]} material={M.halo}>
            <circleGeometry args={[0.42, 28]} />
          </mesh>
          <mesh position={[0, 1.27, -0.25]} material={M.goldBright}>
            <torusGeometry args={[0.42, 0.025, 6, 36]} />
          </mesh>
        </>
      )}
    </group>
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
