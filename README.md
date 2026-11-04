# Chùa Online — 3D Technical Prototype

Bản prototype theo PRD v1.0 (`docs/prd/chua-online-prd.txt`), tập trung vào bước **15. Technical Prototype**:
một ngôi chùa 3D chạy trên trình duyệt, ưu tiên mobile, cùng các tính năng tâm linh dùng được ngay mà không cần đăng ký.

## Chạy dự án

Yêu cầu: Node.js 18+ (khuyến nghị 20 hoặc 22).

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Muốn thử trên điện thoại: kết nối cùng Wi‑Fi rồi mở địa chỉ `Network:` mà Vite in ra (ví dụ `http://192.168.1.10:5173`).

```bash
npm run build     # type-check + build production vào dist/
npm run preview   # chạy thử bản build
```

> Ứng dụng dùng `BrowserRouter`. Khi deploy lên static hosting (Netlify, Vercel, S3…), cấu hình rewrite mọi đường dẫn về `index.html`.

## Có gì trong prototype

| Màn hình | Đường dẫn | Nội dung |
|---|---|---|
| Trang chủ | `/` | Giới thiệu, lối vào nhanh, thời kinh ngắn |
| Chùa 3D | `/chua` | Tam quan, sân chùa, lư hương, lầu chuông, ao sen, cội Bồ Đề, tượng Quán Âm, chánh điện với tượng Phật Thích Ca |
| Thư viện kinh | `/kinh`, `/kinh/:id` | Kệ khai kinh, Tâm Kinh, Tam tự quy, Kệ hồi hướng, Năm giới · chỉnh cỡ chữ · nghe đọc (Web Speech) · gõ mõ · lưu tiến trình |
| Thiền định | `/thien` | 3 / 5 / 10 / 15 phút, hướng dẫn hơi thở, chuông bắt đầu/kết thúc, dừng bất cứ lúc nào |
| Nhật ký | `/nhat-ky` | Profile khách, thống kê, lịch sử hoạt động |

### Trong chùa 3D

| Đối tượng | Hành động |
|---|---|
| Lư hương giữa sân | Thắp hương (khói bay lên ~2 phút) · Tìm hiểu |
| Đại hồng chung | Thỉnh chuông (chuông đung đưa + âm thanh tổng hợp) · Tìm hiểu |
| Tượng Phật Thích Ca | Lễ bái (3 vái) · Dâng hoa (sen xuất hiện trên hương án) · Tìm hiểu |
| Tượng Quán Âm | Lễ bái · Tìm hiểu |
| Bồ đoàn dưới cội Bồ Đề | Ngồi thiền ngay trong chùa |
| Tủ kinh trong chánh điện | Mở thư viện kinh |

**Điều khiển** — Desktop: `WASD`/mũi tên đi, `Shift` đi nhanh, kéo chuột xoay camera, lăn chuột zoom, `E` tương tác, `Esc` menu.
Mobile: nửa trái màn hình là joystick nổi, nửa phải vuốt xoay camera, nút tròn để tương tác.

Toàn bộ mô hình 3D được dựng từ khối hình học cơ bản và âm thanh được tổng hợp bằng Web Audio, **không cần tải asset hay file âm thanh** — để kiểm chứng kiến trúc trước khi đầu tư vào asset thật.

## Kiến trúc (đối chiếu PRD)

```
src/
├── app/                 router, layout
├── features/
│   ├── temple/
│   │   ├── domain/          interactables.ts (Interactable — PRD 5.3), world.ts (collider, khu vực, độ cao nền)
│   │   ├── application/     templeStore.ts (Zustand — UI state), actionHandler.ts (xử lý hành động)
│   │   ├── presentation/    TemplePage, HUD, TouchControls, fallback
│   │   └── game/
│   │       ├── scenes/        TempleScene
│   │       ├── entities/      MainHall, BuddhaStatue, Courtyard (lư hương, lầu chuông, ao sen…), Player, Roof
│   │       ├── controllers/   CameraController (third-person bán tự động, chống xuyên tường)
│   │       ├── interactions/  InteractionSystem (phát hiện đối tượng gần nhất)
│   │       └── systems/       runtime.ts (game state mỗi frame), quality.ts, events.ts
│   ├── sutra/  meditation/  journal/  home/
└── shared/              audio (Web Audio), lib (storage, guest, webgl), types, ui
```

Các nguyên tắc trong PRD đã được áp dụng:

- **Luồng sự kiện** `Player Input → InteractionSystem → actionHandler → Zustand / activityService` — mesh 3D không gọi API trực tiếp.
- **3 nhóm state** (PRD 9): vị trí player/camera nằm trong `game/systems/runtime.ts` (đối tượng mutable, không re-render React); Zustand chỉ giữ state thay đổi thưa (khu vực, đối tượng gần, panel, cài đặt); dữ liệu lâu dài đi qua service.
- **Không tự kích hoạt nghi thức** khi đi ngang qua — phải bấm `E`/nút tương tác rồi chọn hành động.
- **Đi chậm trong chánh điện** — tốc độ bị giới hạn khi ở trong khu vực trang nghiêm.
- **Quality profiles** Thấp/Trung bình/Cao (DPR, bóng đổ, số hạt khói) — tự chọn theo thiết bị, đổi được trong Cài đặt; có đồng hồ FPS để kiểm thử.
- **Fallback**: không có WebGL / lỗi khởi tạo / mất context → màn hình mời đọc kinh và thiền (TEM-006, PER-005).
- **Guest mode**: không cần đăng ký; session khách tạo phía client (`shared/lib/guest.ts`).
- **Tách bundle**: Three.js chỉ tải khi vào `/chua`.

## Thay mock bằng backend (NestJS + PostgreSQL)

Các service đã có interface khớp với API trong PRD mục 7, chỉ cần thay phần thân hàm:

| Service hiện tại (localStorage) | API production |
|---|---|
| `journal/application/activityService.ts` → `recordActivity`, `getActivityHistory` | `POST /api/v1/activities`, `GET /api/v1/activities/history` |
| `sutra/application/sutraProgress.ts` → `saveProgress` | `PUT /api/v1/sutras/:id/progress` |
| `meditation/application/meditationService.ts` → `saveMeditationSession` | `POST /api/v1/meditation/sessions` |
| `sutra/data/sutras.ts` | `GET /api/v1/sutras`, `GET /api/v1/sutras/:id` |
| `temple/domain/interactables.ts`, `world.ts` | `GET /api/v1/temples/:id/scene` |

## Acceptance criteria (PRD 12)

| ID | Trạng thái |
|---|---|
| TEM-001 Load chùa | ✅ |
| TEM-002 Di chuyển desktop + mobile | ✅ |
| TEM-003 Camera không xuyên tường | ✅ raycast vào tường/mái |
| TEM-004 Nhận diện đối tượng tương tác | ✅ |
| TEM-005 Loading indicator | ✅ |
| TEM-006 Fallback khi 3D lỗi | ✅ |
| WOR-001…004 Lễ bái, dâng hoa, thắp hương, prompt khi đủ gần | ✅ |
| WOR-005 Lưu hoạt động | ✅ trên thiết bị (chờ backend để lưu theo tài khoản) |
| SUT-001…003 Thư viện, reader mobile, phát/dừng audio | ✅ audio = Web Speech (cần bản ghi tụng kinh thật) |
| SUT-004 Lưu tiến trình | ✅ trên thiết bị |
| PER-001 Touch | ✅ |
| PER-002 Target FPS | ⏳ cần đo trên thiết bị thật (bật “Hiển thị FPS” trong Cài đặt) |
| PER-003 Loading & error | ✅ |
| PER-004 Bộ nhớ không tăng | ⏳ cần đo bằng DevTools |
| PER-005 Đọc kinh khi không có 3D | ✅ |

## Bước tiếp theo đề xuất

1. Đo FPS trên 2–3 điện thoại phổ thông, chỉnh quality profile.
2. Thay khối cơ bản bằng mô hình Blender (GLB + Draco/KTX2) — tải theo khu vực bằng `useGLTF` của drei.
3. Thay animation procedural bằng rig + `AnimationMixer` khi có nhân vật thật.
4. Bản ghi âm chuông và tụng kinh thật thay cho âm thanh tổng hợp / giọng máy.
5. Nhờ quý Thầy/Cô cố vấn rà soát nội dung kinh và phần giải thích.
6. Dựng backend NestJS + Prisma theo schema trong PRD, thay các service ở bảng trên.
