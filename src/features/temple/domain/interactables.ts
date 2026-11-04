import type { InteractionAction } from "../../../shared/types/activity";
import { PLATEAU, PLAYER_CUSHION, PLAYER_MEAL_SEAT, POS } from "./world";
import { FREE_MEAL_SEATS } from "./npcs";

export type { InteractionAction };

export type Vec3 = [number, number, number];

/**
 * Interactable (PRD 5.3) — đối tượng 3D chỉ khai báo dữ liệu tương tác,
 * logic xử lý nằm trong Interaction System / Action Handler.
 */
export interface Interactable {
  id: string;
  type: string;
  name: string;
  /** Vị trí người chơi cần đứng gần để tương tác (x, y, z). */
  anchor: Vec3;
  /** Điểm nhân vật quay mặt về khi thực hiện nghi thức. */
  focus: Vec3;
  radius: number;
  actions: InteractionAction[];
  summary: string;
  description: string;
}

export const ACTION_LABELS: Record<InteractionAction, { label: string; hint: string }> = {
  worship: { label: "Lễ bái", hint: "Chắp tay vái ba vái" },
  offer_flower: { label: "Dâng hoa", hint: "Dâng một đóa sen" },
  light_incense: { label: "Thắp hương", hint: "Dâng ba nén hương" },
  ring_bell: { label: "Thỉnh chuông", hint: "Một tiếng chuông ngân" },
  beat_drum: { label: "Đánh trống", hint: "Ba hồi trống" },
  listen_dharma: { label: "Nghe giảng", hint: "Bài pháp ngắn" },
  have_meal: { label: "Thọ trai", hint: "Ngồi dùng bữa chay" },
  read_sutra: { label: "Mở kinh sách", hint: "Đến thư viện kinh" },
  meditate: { label: "Ngồi thiền", hint: "3 – 15 phút" },
  learn: { label: "Tìm hiểu", hint: "Ý nghĩa & lịch sử" },
};

const Y = PLATEAU;
const at = (x: number, z: number, y = 0): Vec3 => [x, Y + y, z];

export const INTERACTABLES: Interactable[] = [
  {
    id: "tam-quan",
    type: "gate",
    name: "Cổng Tam quan",
    anchor: at(0, 6.5),
    focus: at(0, -2, 3),
    radius: 3.2,
    actions: ["learn"],
    summary: "Cổng chính, ba lối vào",
    description:
      "Tam quan là cổng chính của chùa với ba lối đi: đại quan ở giữa và hai tiểu quan hai bên. Ba lối tượng trưng cho ba cách nhìn (Hữu quan, Không quan, Trung quan) hoặc Tam giải thoát môn. Hoành phi ghi “Thiện Phúc Tự”. Câu đối hai bên: “Thiện niệm khởi tâm, muôn nẻo an lành về cửa Phật / Phúc duyên gieo hạt, ngàn đời hoan hỷ hướng đường Thiền” — mời người đến chùa giữ tâm lành và gieo duyên phúc.",
  },
  {
    id: "bell-tower",
    type: "bell",
    name: "Đại hồng chung · Gác chuông",
    anchor: at(POS.bell[0], POS.bell[1]),
    focus: at(POS.bell[0], POS.bell[1], 3),
    radius: 2.8,
    actions: ["ring_bell", "learn"],
    summary: "Chuông lớn bên trái sân chùa",
    description:
      "Đại hồng chung thường được thỉnh vào sáng sớm và chiều tối. Tiếng chuông nhắc người nghe dừng lại, trở về với hơi thở và buông bỏ phiền não. Theo lệ “tả chung hữu cổ”, gác chuông đặt bên trái, gác trống bên phải.",
  },
  {
    id: "drum-tower",
    type: "drum",
    name: "Trống bát nhã · Gác trống",
    anchor: at(POS.drum[0], POS.drum[1] + 1.6),
    focus: at(POS.drum[0], POS.drum[1], 1.2),
    radius: 2.8,
    actions: ["beat_drum", "learn"],
    summary: "Trống lớn bên phải sân chùa",
    description:
      "Trống bát nhã được đánh trong các khóa lễ, hòa cùng tiếng chuông để báo hiệu thời khóa tu tập. Tiếng trống trầm hùng tượng trưng cho sự tỉnh thức và tinh tấn.",
  },
  {
    id: "incense-courtyard",
    type: "incense_burner",
    name: "Lư hương giữa sân",
    anchor: at(POS.incense[0], POS.incense[1]),
    focus: at(POS.incense[0], POS.incense[1], 1.2),
    radius: 2.7,
    actions: ["light_incense", "learn"],
    summary: "Dâng hương trước khi vào Tiền đường",
    description:
      "Lư hương lớn đặt giữa sân để Phật tử dâng hương trước khi vào điện. Nén hương tượng trưng cho giới hương, định hương, tuệ hương. Trong Chùa Online, bạn dâng hương bằng tâm — không có khói thật, chỉ có sự chú tâm.",
  },
  {
    id: "quan-am",
    type: "bodhisattva_statue",
    name: "Tượng Quán Thế Âm lộ thiên",
    anchor: at(POS.quanAm[0], POS.quanAm[1]),
    focus: at(POS.quanAm[0], POS.quanAm[1], 3),
    radius: 7.6,
    actions: ["worship", "learn"],
    summary: "Đứng giữa ao sen",
    description:
      "Bồ Tát Quán Thế Âm (Avalokiteśvara) tượng trưng cho lòng từ bi, lắng nghe tiếng kêu khổ của chúng sinh. Nhiều ngôi chùa đặt tượng Quán Âm lộ thiên giữa sân hoặc ao sen để Phật tử chiêm bái.",
  },
  {
    id: "bodhi-meditation",
    type: "meditation_spot",
    name: "Bồ đoàn dưới cội Bồ Đề",
    anchor: at(POS.bodhi[0], POS.bodhi[1] + 3.2),
    focus: at(POS.bodhi[0], POS.bodhi[1], 1),
    radius: 2,
    actions: ["meditate", "learn"],
    summary: "Chỗ ngồi thiền yên tĩnh",
    description:
      "Cây Bồ Đề gắn với sự kiện Đức Phật thành đạo sau nhiều ngày thiền định dưới gốc cây tại Bodh Gaya. Bồ đoàn dưới gốc cây là nơi bạn có thể ngồi thiền vài phút. Bạn có thể dừng bất cứ lúc nào.",
  },
  {
    id: "duc-ong",
    type: "altar",
    name: "Ban Đức Ông",
    anchor: at(-7.5, -29.6),
    focus: at(-7.5, -32.4, 1.5),
    radius: 2.2,
    actions: ["worship", "learn"],
    summary: "Bên trái Tiền đường",
    description:
      "Đức Ông là ông Cấp Cô Độc (Tu Đạt), vị trưởng giả đã cúng dường khu vườn Kỳ Viên cho Đức Phật và Tăng đoàn. Ngài được tôn làm vị hộ trì Tam bảo, thường ngự bên trái Tiền đường cùng hai vị thị giả.",
  },
  {
    id: "thanh-hien",
    type: "altar",
    name: "Ban Thánh Hiền",
    anchor: at(7.5, -29.6),
    focus: at(7.5, -32.4, 1.5),
    radius: 2.2,
    actions: ["worship", "learn"],
    summary: "Bên phải Tiền đường",
    description:
      "Ban Thánh Hiền thờ tôn giả A Nan Đà — thị giả thân cận của Đức Phật, nổi tiếng đa văn bậc nhất, người trùng tụng lại lời Phật dạy. Hai bên là các vị thị giả. Hai bên Tiền đường còn có tượng Bát bộ Kim Cương hộ pháp.",
  },
  {
    id: "thieu-huong",
    type: "incense_hall",
    name: "Gian Thiêu hương",
    anchor: at(0, -36),
    focus: at(0, -36, 1),
    radius: 2.2,
    actions: ["light_incense", "learn"],
    summary: "Gian nối Tiền đường và Thượng điện",
    description:
      "Thiêu hương là gian nối giữa Tiền đường và Thượng điện, nơi đốt hương dâng cúng. Cùng với Tiền đường và Thượng điện, ba gian tạo thành mặt bằng chữ Công (工) đặc trưng của chùa Việt.",
  },
  {
    id: "buddha-main-hall",
    type: "buddha_statue",
    name: "Thượng điện · Tam bảo",
    anchor: at(0, -41.6),
    focus: at(0, -47, 2.5),
    radius: 3.2,
    actions: ["worship", "offer_flower", "learn"],
    summary: "Nơi tôn nghiêm nhất của chùa",
    description:
      "Thượng điện bài trí tượng Phật từ cao xuống thấp. Hàng trên cùng là Tam Thế Phật (quá khứ, hiện tại, vị lai). Tiếp theo là Di Đà tam tôn: Phật A Di Đà, Bồ Tát Quán Thế Âm và Đại Thế Chí. Kế đến là Đức Phật Thích Ca Mâu Ni, và phía dưới là tòa Cửu Long — Đức Phật đản sinh được chín rồng phun nước tắm.",
  },
  {
    id: "la-han-trai",
    type: "arhats",
    name: "Thập bát La Hán",
    anchor: at(-19.4, -44),
    focus: at(-21.6, -44, 1),
    radius: 4.5,
    actions: ["learn"],
    summary: "Mười tám vị A La Hán dọc hành lang",
    description:
      "Thập bát La Hán là mười tám vị đệ tử đã chứng quả A La Hán, nguyện ở lại thế gian hộ trì Chính pháp. Tượng thường đặt dọc hai dãy hành lang ôm lấy khu trung tâm, mỗi bên chín vị với dáng vẻ và pháp khí khác nhau.",
  },
  {
    id: "la-han-phai",
    type: "arhats",
    name: "Thập bát La Hán",
    anchor: at(19.4, -44),
    focus: at(21.6, -44, 1),
    radius: 4.5,
    actions: ["learn"],
    summary: "Mười tám vị A La Hán dọc hành lang",
    description:
      "Thập bát La Hán là mười tám vị đệ tử đã chứng quả A La Hán, nguyện ở lại thế gian hộ trì Chính pháp. Tượng thường đặt dọc hai dãy hành lang ôm lấy khu trung tâm, mỗi bên chín vị với dáng vẻ và pháp khí khác nhau.",
  },
  {
    id: "nha-to",
    type: "ancestor_hall",
    name: "Nhà Tổ",
    anchor: at(0, -59.4),
    focus: at(0, -63, 1.5),
    radius: 2.8,
    actions: ["worship", "learn"],
    summary: "Thờ chư vị Tổ sư",
    description:
      "Nhà Tổ (Hậu đường) nằm phía sau Chính điện, thờ các vị Tổ sư có công khai sơn và các vị trụ trì qua nhiều đời. Đây là nơi thể hiện lòng tri ân với những người đã gìn giữ ngôi chùa.",
  },
  {
    id: "dien-mau",
    type: "mother_goddess_hall",
    name: "Điện Mẫu",
    anchor: at(0, -69.6),
    focus: at(0, -73, 1.5),
    radius: 2.6,
    actions: ["worship", "learn"],
    summary: "Tiền Phật hậu Thánh",
    description:
      "Nhiều ngôi chùa Việt theo lối “Tiền Phật hậu Thánh”, phía sau có điện thờ Mẫu. Điện thờ Tam tòa Thánh Mẫu: Mẫu Thượng Thiên (áo đỏ), Mẫu Thượng Ngàn (áo xanh) và Mẫu Thoải (áo trắng) — thể hiện sự hòa quyện giữa Phật giáo và tín ngưỡng dân gian.",
  },
  {
    id: "bao-thap",
    type: "stupa",
    name: "Bảo tháp",
    anchor: at(POS.baoThap[0], POS.baoThap[1] + 4.6),
    focus: at(POS.baoThap[0], POS.baoThap[1], 3),
    radius: 3,
    actions: ["worship", "learn"],
    summary: "Nơi lưu giữ xá lợi",
    description:
      "Bảo tháp là nơi lưu giữ xá lợi hoặc tro cốt của các bậc cao tăng. Tháp thường có số tầng lẻ, thu nhỏ dần lên trên, có thể đặt phía trước hoặc phía sau khuôn viên chùa.",
  },
  {
    id: "giang-duong",
    type: "lecture_hall",
    name: "Giảng đường · Thầy đang giảng pháp",
    anchor: at(27.6, -52),
    focus: at(32.6, -52, 1.2),
    radius: 3.4,
    actions: ["listen_dharma", "read_sutra", "learn"],
    summary: "Ngồi xuống chiếu, lắng nghe bài pháp",
    description:
      "Giảng đường (Nhà hội) là nơi chư Tăng thuyết pháp, Phật tử học giáo lý và sinh hoạt chung. Thầy ngồi trên bục giảng, chú tiểu đứng hầu bên cạnh, đại chúng ngồi trên chiếu lắng nghe. Bạn có thể nghe một bài pháp ngắn hoặc mở thư viện kinh.",
  },
  {
    id: "thien-duong",
    type: "meditation_hall",
    name: "Thiền đường",
    anchor: at(PLAYER_CUSHION[0], PLAYER_CUSHION[1]),
    focus: at(33.4, PLAYER_CUSHION[1], 1.2),
    radius: 1.7,
    actions: ["meditate", "learn"],
    summary: "Ngồi thiền cùng đại chúng",
    description:
      "Thiền đường là nơi chư Tăng và Phật tử ngồi thiền chung. Mỗi người một bồ đoàn, quay về phía bàn Phật; vị Thầy hướng dẫn ngồi phía trước. Ngồi cùng đại chúng giúp tâm dễ lắng dịu. Bồ đoàn còn trống ở hàng giữa là chỗ của bạn.",
  },
  {
    id: "tang-xa",
    type: "monks_quarters",
    name: "Tăng xá",
    anchor: at(-24.2, -40),
    focus: at(-28, -40, 1.5),
    radius: 3,
    actions: ["learn"],
    summary: "Nơi ở của chư Tăng",
    description:
      "Tăng xá là nơi ở, sinh hoạt và nghỉ ngơi của chư Tăng (hoặc chư Ni). Khu vực này thường yên tĩnh, khách viếng chùa nên giữ im lặng khi đi ngang qua.",
  },
  {
    id: "trai-duong",
    type: "dining_hall",
    name: "Chỗ ngồi thọ trai",
    anchor: at(PLAYER_MEAL_SEAT[0], PLAYER_MEAL_SEAT[1]),
    focus: at(27.0, PLAYER_MEAL_SEAT[1], 0.6),
    radius: 0.85,
    actions: ["have_meal", "learn"],
    summary: "Chỗ còn trống — mời ngồi",
    description:
      "Trai đường là nhà ăn chung của tăng chúng và Phật tử. Đầu nhà là bàn Phật và chỗ ngồi của vị trụ trì; đại chúng ngồi hai bên các dãy bàn thấp. Trước khi dùng bữa, mọi người lặng lẽ quán tưởng để biết ơn và ăn trong chánh niệm. Bữa ăn trong chùa là bữa chay, dùng vừa đủ, không nói chuyện ồn ào.",
  },
  {
    id: "nha-tru",
    type: "kitchen",
    name: "Nhà trù (bếp chùa)",
    anchor: at(30.6, -40.4),
    focus: at(32.7, -41.6, 1),
    radius: 1.8,
    actions: ["learn"],
    summary: "Nơi nấu cơm chay cho đại chúng",
    description:
      "Nhà trù là bếp của chùa, thường nằm phía sau trai đường. Việc nấu ăn cũng là một công phu tu tập: chú tiểu và Phật tử công quả nhặt rau, nấu cơm trong chánh niệm. Ở nhiều chùa vẫn còn bếp củi, nồi lớn và lu nước mưa.",
  },
];

// Mỗi chỗ ngồi còn trống trong Trai đường đều có thể ngồi xuống thọ trai.
const TRAI_DESC = INTERACTABLES.find((i) => i.id === "trai-duong")!.description;
FREE_MEAL_SEATS.filter(([x, z]) => !(x === PLAYER_MEAL_SEAT[0] && z === PLAYER_MEAL_SEAT[1])).forEach(([x, z, tx], i) => {
  INTERACTABLES.push({
    id: `trai-seat-${i}`,
    type: "dining_seat",
    name: "Chỗ ngồi thọ trai",
    anchor: at(x, z),
    focus: at(tx, z, 0.6),
    radius: 0.85,
    actions: ["have_meal", "learn"],
    summary: "Chỗ còn trống — mời ngồi",
    description: TRAI_DESC,
  });
});

export function getInteractable(id: string | null): Interactable | undefined {
  if (!id) return undefined;
  return INTERACTABLES.find((i) => i.id === id);
}
