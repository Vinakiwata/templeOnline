import type { InteractionAction } from "../../../shared/types/activity";

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
  read_sutra: { label: "Mở kinh sách", hint: "Đến thư viện kinh" },
  meditate: { label: "Ngồi thiền", hint: "3 – 15 phút" },
  learn: { label: "Tìm hiểu", hint: "Ý nghĩa & lịch sử" },
};

export const INTERACTABLES: Interactable[] = [
  {
    id: "buddha-main-hall",
    type: "buddha_statue",
    name: "Tượng Phật Thích Ca Mâu Ni",
    anchor: [0, 0, -7.8],
    focus: [0, 2, -12.4],
    radius: 2.6,
    actions: ["worship", "offer_flower", "learn"],
    summary: "Tôn tượng chính giữa chánh điện",
    description:
      "Đức Phật Thích Ca Mâu Ni (Siddhārtha Gautama) là bậc khai sáng đạo Phật, sống tại Ấn Độ cổ đại khoảng thế kỷ VI – V trước Công nguyên. Tượng ngồi kiết già trên tòa sen, hai tay kết ấn thiền định, biểu trưng cho sự tỉnh thức và an tịnh. Khi lễ Phật, điều quan trọng là sự chú tâm và lòng thành, không phải hình thức.",
  },
  {
    id: "incense-courtyard",
    type: "incense_burner",
    name: "Lư hương giữa sân",
    anchor: [0, 0, 8],
    focus: [0, 1.2, 8],
    radius: 2.7,
    actions: ["light_incense", "learn"],
    summary: "Nơi dâng hương trước khi vào chánh điện",
    description:
      "Ở nhiều ngôi chùa Việt, lư hương lớn được đặt giữa sân để Phật tử dâng hương trước khi vào chánh điện. Nén hương tượng trưng cho giới hương, định hương, tuệ hương. Trong Chùa Online, bạn dâng hương bằng tâm — không có khói thật, chỉ có sự chú tâm.",
  },
  {
    id: "bell-tower",
    type: "bell",
    name: "Đại hồng chung",
    anchor: [10, 0, 4],
    focus: [10, 3, 4],
    radius: 2.8,
    actions: ["ring_bell", "learn"],
    summary: "Chuông lớn trong lầu chuông",
    description:
      "Đại hồng chung thường được thỉnh vào sáng sớm và chiều tối. Tiếng chuông nhắc người nghe dừng lại, trở về với hơi thở và buông bỏ phiền não. Khi nghe chuông, hãy thử thở vào, thở ra ba lần trong chánh niệm.",
  },
  {
    id: "sutra-shelf",
    type: "sutra_library",
    name: "Tủ kinh",
    anchor: [-6, 0, -9],
    focus: [-7.4, 1.4, -9],
    radius: 1.9,
    actions: ["read_sutra", "learn"],
    summary: "Kinh sách và kệ tụng",
    description:
      "Tủ kinh lưu giữ các bài kinh và kệ tụng. Bạn có thể đọc kinh ngay cả khi không ở trong chùa 3D — thư viện kinh luôn mở trên mọi thiết bị.",
  },
  {
    id: "bodhi-meditation",
    type: "meditation_spot",
    name: "Bồ đoàn dưới cội Bồ Đề",
    anchor: [-10, 0, 15.8],
    focus: [-10, 1, 13],
    radius: 1.9,
    actions: ["meditate", "learn"],
    summary: "Chỗ ngồi thiền yên tĩnh",
    description:
      "Cây Bồ Đề gắn với sự kiện Đức Phật thành đạo sau nhiều ngày thiền định dưới gốc cây tại Bodh Gaya. Bồ đoàn dưới gốc cây là nơi bạn có thể ngồi thiền vài phút, theo dõi hơi thở. Bạn có thể dừng bất cứ lúc nào.",
  },
  {
    id: "quan-am",
    type: "bodhisattva_statue",
    name: "Tượng Bồ Tát Quán Thế Âm",
    anchor: [10, 0, 14],
    focus: [10, 2, 14],
    radius: 2.6,
    actions: ["worship", "learn"],
    summary: "Biểu tượng của lòng từ bi",
    description:
      "Bồ Tát Quán Thế Âm (Avalokiteśvara) tượng trưng cho lòng từ bi, lắng nghe tiếng kêu khổ của chúng sinh. Tượng thường cầm bình cam lồ và nhành dương liễu, đứng trên tòa sen.",
  },
];

export function getInteractable(id: string | null): Interactable | undefined {
  if (!id) return undefined;
  return INTERACTABLES.find((i) => i.id === id);
}
