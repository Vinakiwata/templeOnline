/**
 * Thông tin trang "Nhà phát triển".
 * ✏️  Chỉ cần sửa file này — trang /nha-phat-trien sẽ tự cập nhật.
 * Các giá trị có dấu [ ] là chỗ cần điền; để chuỗi rỗng "" thì mục đó sẽ được ẩn.
 */

export interface DeveloperLink {
  label: string;
  url: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Chữ cái hiển thị trong avatar khi chưa có ảnh. */
  initials: string;
  /** Đường dẫn ảnh trong thư mục public/, ví dụ "/team/ten.jpg". Để "" nếu chưa có. */
  avatar: string;
  links: DeveloperLink[];
  /** Lĩnh vực / thế mạnh nổi bật, hiển thị dạng thẻ. */
  highlights?: string[];
}

export const PROJECT = {
  name: "Chùa Online",
  version: "0.1.0 — Technical Prototype",
  mission:
    "Chùa Online là một không gian chùa trực tuyến, nơi mọi người có thể ghé thăm, lễ bái, đọc kinh, ngồi thiền và kết nối với cộng đồng — ở bất cứ đâu, vào bất cứ lúc nào.",
  story:
    "Chùa Online ra đời từ một niềm tin giản dị: mỗi người đều có thể tự gieo hạt cho điều mình mong cầu. Khi ta lặng lại trước tượng Phật, thắp một nén tâm hương hay ngồi yên vài phút theo dõi hơi thở, ý nguyện trong lòng trở nên rõ ràng hơn. Đó là lúc ta “manifest” — biến điều mình hướng tới thành lời phát nguyện, rồi thành hành động mỗi ngày. Trang web này được tạo ra để giúp bất kỳ ai, ở bất cứ đâu, có một không gian yên tĩnh để nuôi dưỡng ý nguyện tốt đẹp và từng bước sống đúng với nó.",
  principles: [
    { title: "Miễn phí cho mọi người", text: "Không quảng cáo, không bán tính năng. Mọi hoạt động tu tập cơ bản đều mở cho tất cả." },
    { title: "Tôn trọng truyền thống", text: "Nội dung kinh sách ghi rõ nguồn và được mời quý Thầy/Cô cố vấn rà soát trước khi phát hành." },
    { title: "Riêng tư trước hết", text: "Không bắt buộc đăng ký. Nhật ký tu tập ở chế độ khách chỉ lưu trên thiết bị của bạn." },
    { title: "Nhẹ nhàng trên mọi thiết bị", text: "Ưu tiên điện thoại phổ thông; vẫn đọc kinh và thiền được khi máy không hỗ trợ 3D." },
  ],
  contactEmail: "[email-lien-he@example.com]",
  feedbackUrl: "",
  sourceUrl: "",
};

export const TEAM: TeamMember[] = [
  {
    name: "Bùi Hải Bằng",
    role: "Founder · Chuyên gia phát triển sản phẩm đa nền tảng",
    bio: "Chuyên gia phát triển sản phẩm trên các nền tảng web, mobile và hệ thống, với kinh nghiệm xây dựng giải pháp cho nhiều lĩnh vực như logistics và ngân hàng (banking) — nơi sự chính xác, ổn định và trải nghiệm người dùng là yếu tố sống còn. Mang tinh thần đó vào Chùa Online, anh mong muốn tạo ra một không gian tâm linh số vừa đẹp, vừa nhẹ nhàng, giúp mỗi người nuôi dưỡng ý nguyện và biến điều tốt đẹp mình hướng tới thành hiện thực.",
    initials: "HB",
    avatar: "",
    highlights: ["Phát triển sản phẩm đa nền tảng", "Logistics", "Banking", "Web & Mobile", "3D Web Experience"],
    links: [
      { label: "GitHub", url: "" },
      { label: "LinkedIn", url: "" },
      { label: "Website", url: "" },
    ],
  },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Giao diện", items: ["React 18", "TypeScript", "Vite", "React Router"] },
  { group: "Thế giới 3D", items: ["Three.js", "React Three Fiber", "Drei", "Web Audio API"] },
  { group: "Trạng thái", items: ["Zustand", "Game runtime state"] },
  { group: "Dự kiến", items: ["NestJS", "PostgreSQL", "Prisma", "TanStack Query"] },
];

export const ROADMAP: { phase: string; title: string; status: "done" | "current" | "next" }[] = [
  { phase: "Giai đoạn 1", title: "PRD & Technical Prototype 3D", status: "current" },
  { phase: "Giai đoạn 2", title: "3D MVP — chánh điện, nhân vật, tương tác, âm thanh", status: "next" },
  { phase: "Giai đoạn 3", title: "Đọc kinh, thiền định, tài khoản, nhật ký", status: "next" },
  { phase: "Giai đoạn 4", title: "Sự kiện, cộng đồng, kiểm duyệt", status: "next" },
  { phase: "Giai đoạn 5", title: "Public Beta", status: "next" },
];

export const CREDITS: string[] = [
  "Kinh và kệ truyền thống: văn bản phiên âm Hán‑Việt thuộc phạm vi công cộng.",
  "Thư viện mã nguồn mở: React, Three.js, React Three Fiber, Drei, Zustand, Vite.",
  "Font chữ: Be Vietnam Pro và Noto Serif (Google Fonts, SIL Open Font License).",
];

/** Chuỗi còn là placeholder "[...]" hoặc rỗng thì coi như chưa điền. */
export function isFilled(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && !(v.startsWith("[") && v.endsWith("]"));
}
