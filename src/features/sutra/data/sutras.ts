/**
 * Nội dung kinh mẫu cho prototype.
 * - Các bài kinh/kệ truyền thống dưới dạng phiên âm Hán‑Việt (văn bản cổ, phạm vi công cộng).
 * - Bài "Năm giới" do Chùa Online biên soạn bằng lời giản dị cho người mới.
 * Trước khi phát hành nên nhờ quý Thầy/Cô cố vấn rà soát nội dung (PRD 11.3).
 */
export interface SutraSection {
  heading?: string;
  lines: string[];
}

export interface Sutra {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Kinh" | "Kệ" | "Giáo lý";
  readingMinutes: number;
  sections: SutraSection[];
  source: string;
  license: string;
}

export const SUTRAS: Sutra[] = [
  {
    id: "ke-khai-kinh",
    title: "Kệ Khai Kinh",
    subtitle: "Bài kệ đọc trước khi tụng kinh",
    description:
      "Bốn câu kệ bày tỏ niềm trân quý khi được gặp giáo pháp, thường đọc trước mỗi thời kinh.",
    category: "Kệ",
    readingMinutes: 1,
    sections: [
      {
        lines: [
          "Vô thượng thâm thâm vi diệu pháp,",
          "Bá thiên vạn kiếp nan tao ngộ.",
          "Ngã kim kiến văn đắc thọ trì,",
          "Nguyện giải Như Lai chân thật nghĩa.",
        ],
      },
      {
        heading: "Ý nghĩa",
        lines: [
          "Pháp vi diệu sâu xa không gì hơn, trăm nghìn muôn kiếp khó gặp được. Nay con được thấy, được nghe và thọ trì, nguyện hiểu được nghĩa chân thật của Như Lai.",
        ],
      },
    ],
    source: "Văn bản truyền thống, phiên âm Hán‑Việt",
    license: "Phạm vi công cộng",
  },
  {
    id: "bat-nha-tam-kinh",
    title: "Bát Nhã Ba La Mật Đa Tâm Kinh",
    subtitle: "Tâm Kinh — phiên âm Hán‑Việt",
    description:
      "Bản kinh ngắn và phổ biến nhất trong truyền thống Đại thừa, nói về tánh Không và trí tuệ Bát Nhã.",
    category: "Kinh",
    readingMinutes: 4,
    sections: [
      {
        lines: [
          "Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.",
        ],
      },
      {
        lines: [
          "Xá Lợi Tử! Sắc bất dị không, không bất dị sắc, sắc tức thị không, không tức thị sắc, thọ tưởng hành thức diệc phục như thị.",
        ],
      },
      {
        lines: [
          "Xá Lợi Tử! Thị chư pháp không tướng, bất sanh bất diệt, bất cấu bất tịnh, bất tăng bất giảm.",
        ],
      },
      {
        lines: [
          "Thị cố không trung vô sắc, vô thọ tưởng hành thức, vô nhãn nhĩ tỷ thiệt thân ý, vô sắc thanh hương vị xúc pháp, vô nhãn giới nãi chí vô ý thức giới, vô vô minh diệc vô vô minh tận, nãi chí vô lão tử diệc vô lão tử tận, vô khổ tập diệt đạo, vô trí diệc vô đắc.",
        ],
      },
      {
        lines: [
          "Dĩ vô sở đắc cố, Bồ Đề Tát Đỏa y Bát Nhã Ba La Mật Đa cố, tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.",
        ],
      },
      {
        lines: [
          "Tam thế chư Phật y Bát Nhã Ba La Mật Đa cố, đắc A Nậu Đa La Tam Miệu Tam Bồ Đề.",
        ],
      },
      {
        lines: [
          "Cố tri Bát Nhã Ba La Mật Đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.",
        ],
      },
      {
        lines: [
          "Cố thuyết Bát Nhã Ba La Mật Đa chú, tức thuyết chú viết:",
          "Yết đế yết đế, ba la yết đế, ba la tăng yết đế, Bồ Đề tát bà ha. (3 lần)",
        ],
      },
    ],
    source: "Văn bản truyền thống, phiên âm Hán‑Việt",
    license: "Phạm vi công cộng",
  },
  {
    id: "tam-tu-quy",
    title: "Tam Tự Quy",
    subtitle: "Quy y Tam Bảo",
    description: "Lời quy y Phật, Pháp, Tăng — ba ngôi báu là nền tảng của người học Phật.",
    category: "Kệ",
    readingMinutes: 1,
    sections: [
      {
        lines: ["Quy y Phật, quy y Pháp, quy y Tăng."],
      },
      {
        lines: [
          "Quy y Phật, lưỡng túc tôn.",
          "Quy y Pháp, ly dục tôn.",
          "Quy y Tăng, chúng trung tôn.",
        ],
      },
      {
        heading: "Ý nghĩa",
        lines: [
          "Quy y Phật — bậc giác ngộ, đầy đủ phước đức và trí tuệ. Quy y Pháp — giáo lý giúp lìa tham dục. Quy y Tăng — đoàn thể tu học hòa hợp, đáng tôn kính trong đại chúng.",
        ],
      },
    ],
    source: "Văn bản truyền thống, phiên âm Hán‑Việt",
    license: "Phạm vi công cộng",
  },
  {
    id: "ke-hoi-huong",
    title: "Kệ Hồi Hướng",
    subtitle: "Đọc khi kết thúc thời kinh",
    description: "Hồi hướng công đức đến tất cả chúng sinh.",
    category: "Kệ",
    readingMinutes: 1,
    sections: [
      {
        lines: [
          "Nguyện đem công đức này,",
          "Hướng về khắp tất cả,",
          "Đệ tử và chúng sanh,",
          "Đều trọn thành Phật đạo.",
        ],
      },
    ],
    source: "Văn bản truyền thống",
    license: "Phạm vi công cộng",
  },
  {
    id: "nam-gioi",
    title: "Năm Giới",
    subtitle: "Giáo lý cơ bản cho người mới",
    description:
      "Năm nguyên tắc sống của người Phật tử tại gia, giải thích bằng lời giản dị.",
    category: "Giáo lý",
    readingMinutes: 3,
    sections: [
      {
        lines: [
          "Năm giới không phải là điều cấm đoán áp đặt, mà là những cam kết tự nguyện giúp bảo vệ bản thân, gia đình và xã hội. Người mới có thể bắt đầu với một giới và thực tập dần.",
        ],
      },
      {
        heading: "1. Không sát sinh",
        lines: ["Tôn trọng sự sống, nuôi dưỡng lòng từ bi với con người và muôn loài."],
      },
      {
        heading: "2. Không trộm cắp",
        lines: ["Không lấy những gì người khác không cho; tập hạnh rộng lượng và chia sẻ."],
      },
      {
        heading: "3. Không tà dâm",
        lines: ["Giữ gìn sự chung thủy, tôn trọng thân thể và các mối quan hệ."],
      },
      {
        heading: "4. Không nói dối",
        lines: ["Nói lời chân thật, hòa nhã; lắng nghe sâu và không gây chia rẽ."],
      },
      {
        heading: "5. Không dùng chất say",
        lines: ["Giữ thân tâm tỉnh táo, tránh những gì làm mất chánh niệm."],
      },
    ],
    source: "Biên soạn bởi Chùa Online (cần cố vấn rà soát)",
    license: "Nội dung của dự án",
  },
];

export function getSutra(id: string): Sutra | undefined {
  return SUTRAS.find((s) => s.id === id);
}

/** Thứ tự gợi ý cho một thời kinh ngắn. */
export const SHORT_SERVICE = ["ke-khai-kinh", "bat-nha-tam-kinh", "ke-hoi-huong"];
