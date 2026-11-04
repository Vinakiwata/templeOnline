import { M } from "./materials";
import { BuddhaFigure, type Aureole } from "./BuddhaFigure";

/** Tượng Phật Thích Ca ngồi kiết già, ấn xúc địa, trên tòa sen và bệ Tu Di. */
export function BuddhaStatue({
  position,
  scale = 1,
  aureole = "head",
}: {
  position: [number, number, number];
  scale?: number;
  aureole?: Aureole;
}) {
  return <BuddhaFigure position={position} scale={scale} mudra="xuc_dia" aureole={aureole} sumeru />;
}

/** Đóa sen nhỏ (dùng cho ao sen và hoa dâng). */
export function LotusFlower({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const petals = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return (
    <group position={position} scale={scale}>
      {petals.map((a) => (
        <mesh
          key={a}
          position={[Math.sin(a) * 0.09, 0.08, Math.cos(a) * 0.09]}
          rotation={[0.45, a, 0, "YXZ"]}
          scale={[0.06, 0.12, 0.035]}
          material={M.lotusPink}
        >
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0]} material={M.lotusCenter}>
        <sphereGeometry args={[0.05, 8, 6]} />
      </mesh>
    </group>
  );
}
