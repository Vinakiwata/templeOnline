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

## Bố cục chùa (bản 2 — chùa lớn trên đồi)

Người chơi bắt đầu ở **chân đồi**, đi theo con đường quanh co lên **cổng Tam quan**. Trục chính (x = 0) từ ngoài vào trong:

| Khu vực | Nội dung | Tương tác |
|---|---|---|
| Đường lên chùa | Đường đá uốn lượn, đèn lồng, rừng cây hai bên | — |
| Tam quan | Ba lối (đại quan + hai tiểu quan), gác trên cổng | Tìm hiểu |
| Sân chùa | Gác chuông (trái), gác trống (phải), cây phướn, lư hương, tháp đá, ao sen + Quán Âm lộ thiên, cội Bồ Đề | Thỉnh chuông, đánh trống, thắp hương, lễ bái, ngồi thiền |
| Tiền đường | Ban Đức Ông (trái), ban Thánh Hiền – A Nan Đà (phải), mỗi ban 2 thị giả, Bát bộ Kim Cương hai bên | Lễ bái, tìm hiểu |
| Thiêu hương | Gian nối, bàn hương | Thắp hương |
| Thượng điện | Bàn thờ 4 cấp: Tam Thế Phật → Di Đà tam tôn → Thích Ca → Cửu Long | Lễ bái, dâng hoa, tìm hiểu |
| Hành lang | Hai dãy ôm khu trung tâm, Thập bát La Hán (9 vị mỗi bên) | Tìm hiểu |
| Nhà Tổ | Ba vị Tổ sư, bài vị | Lễ bái |
| Điện Mẫu | Tam tòa Thánh Mẫu (xanh – đỏ – trắng) | Lễ bái |
| Phụ trợ | Tăng xá, Trai đường (có bếp), Giảng đường (mở thư viện kinh), Bảo tháp 7 tầng | Tìm hiểu / đọc kinh |

Tiền đường + Thiêu hương + Thượng điện tạo mặt bằng **chữ Công (工)**; hai dãy hành lang + Nhà Tổ khép lại thành **chữ Quốc (国)**.

- **Bản đồ**: nút bản đồ trên HUD (desktop có thêm bản đồ nhỏ góc phải) — chạm tên địa điểm để đi nhanh.
- **Hiệu năng**: rừng cây dùng InstancedMesh; tượng trong các điện chỉ hiển thị khi người chơi ở gần (`Near`), bán kính giảm ở chất lượng Thấp; vùng đổ bóng đi theo người chơi.
- Dữ liệu bố cục (địa hình, nền, collider, khu vực, địa điểm) nằm trong `src/features/temple/domain/world.ts`.

## Thiền đường, Giảng đường & nhân vật (bản 3)

- **Thiền đường** (góc sau bên phải, lối vào từ phía Nhà Tổ): 12 bồ đoàn quay về bàn Phật, Thầy hướng dẫn ngồi phía trước cùng chuông gia trì và mõ, hương luôn được thắp. Bồ đoàn trống ở hàng giữa dành cho người chơi → **Ngồi thiền** cùng đại chúng.
- **Giảng đường**: bục giảng có Thầy ngồi giảng, chú tiểu đứng hầu, đại chúng ngồi trên chiếu. Hành động mới **Nghe giảng** mở bài pháp ngắn (Sống trong hiện tại · Nuôi dưỡng lòng từ · Vô thường), có thể nghe máy đọc và ghi vào nhật ký. Nội dung trong `src/features/sutra/data/dharmaTalks.ts` (cần quý Thầy rà soát).
- **Nhân vật** (`src/features/temple/domain/npcs.ts`, ~35 người):
  - *Chư Tăng*: thầy thiền hành quanh sân, thầy tụng kinh gõ mõ ở Thượng điện, thầy giảng pháp, thầy hướng dẫn thiền, thầy đi lại trước Tăng xá.
  - *Chú tiểu*: quét sân, dâng hương ở Nhà Tổ, ngồi tụng kinh, hầu thầy ở Giảng đường, ngồi thiền.
  - *Người hành hương*: đi lên/xuống đường (có người đội nón lá), viếng một vòng sân (lư hương → Tiền đường → Quán Âm), dâng hương, lễ Phật, lễ Đức Ông, viếng hành lang La Hán, nghe pháp, ngồi thiền.
  - Mỗi nhân vật tự ẩn khi ở xa người chơi; người chơi không đi xuyên qua nhân vật.

## Thiện Phúc Tự & nhân vật người chơi (bản 4)

- Tên chùa **Thiện Phúc Tự (善福寺)**: hoành phi cổng Tam quan (mặt ngoài chữ Quốc ngữ, mặt trong chữ Hán), bia đá ở chân đồi, màn hình chờ. Đổi tên tại `TEMPLE_NAME` trong `src/features/temple/domain/world.ts`.
- **Chọn nhân vật**: lần đầu vào chùa, chọn Nam / Nữ và đặt tên (tối đa 24 ký tự). Nam: áo tràng lam đậm, tóc ngắn; Nữ: áo tràng lam nhạt, tóc vấn búi buông dài. Tên hiện trên đầu nhân vật. Đổi lại trong **Cài đặt → Đổi nhân vật** hoặc trang **Nhật ký**. Lưu trên thiết bị (`src/shared/lib/guest.ts`).

## Trai đường & nhà trù (bản 5)

- **Trai đường** (bên phải, cửa hướng ra sân): bàn Phật đầu nhà, bàn và chỗ ngồi của Thầy trụ trì, hai dãy bàn thấp có chiếu, bát cơm, bát canh, đũa, ấm trà; khánh đồng treo ở hiên. Đại chúng (thầy, chú tiểu, Phật tử) đang thọ trai, chú tiểu bưng khay đi giữa lối.
- **Thọ trai**: đến chỗ ngồi còn trống ở dãy bàn bên trái gần cửa → *Thọ trai*: nhân vật ngồi xuống, lần lượt quán tưởng năm điều trước bữa ăn rồi dùng bữa trong chánh niệm; ghi vào nhật ký.
- **Nhà trù** (phía sau, cửa ở góc phải vách ngăn): bếp lò hai nồi lớn đang bốc hơi, lu nước, bàn sơ chế rau, kệ bát, củi; chú tiểu nấu cơm và Phật tử công quả nhặt rau.
- Biển tên chữ cho **Trai đường**, **Giảng đường**, **Thiền đường**.

## Câu đối cổng & chỗ ngồi thọ trai (bản 6)

- **Câu đối** trên hai trụ đại quan (chữ vàng nền son, viết dọc), lồng tên chùa:
  - Trụ trái (vế đầu): *Thiện niệm khởi tâm, muôn nẻo an lành về cửa Phật*
  - Trụ phải (vế sau): *Phúc duyên gieo hạt, ngàn đời hoan hỷ hướng đường Thiền*
  - Sửa nội dung tại `GATE_COUPLET` trong `src/features/temple/domain/world.ts`.
- **Trai đường**: mọi chỗ ngồi còn trống đều có thể ngồi xuống *Thọ trai*.
