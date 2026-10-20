# HƯỚNG DẪN QUAY VIDEO DEMO VÀ THUYẾT MINH MÃ NGUỒN
## BÀI KIỂM TRA GIỮA KỲ: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
- **Họ và tên sinh viên:** Nguyễn Đức Duy
- **Mã số sinh viên (MSSV):** BIT240080
- **Tên Project:** `BIT240080_FoodManager`
- **Công nghệ sử dụng:** React Native (Expo TypeScript), SQLite (`expo-sqlite`), MockAPI REST API
- **MockAPI Base URL:** `https://6ad73e6095e98f36aef21c1e.mockapi.io`

---

## PHẦN A: HƯỚNG DẪN KHỞI CHẠY DỰ ÁN TRÊN MÁY TÍNH

1. **Mở thư mục dự án trên Terminal / VS Code:**
   ```bash
   cd C:\Users\Admin\.gemini\antigravity\scratch\BIT240080_FoodManager
   ```

2. **Khởi chạy máy chủ phát triển Expo:**
   ```bash
   npx expo start
   ```
   *(Hoặc `npm start`)*

3. **Lựa chọn thiết bị hiển thị:**
   - **Chạy trên trình duyệt Web (Nhanh nhất để quay video mượt mà):** Nhấn phím `w` trên bàn phím terminal. Trình duyệt sẽ tự động mở tại `http://localhost:8081`. Bấm phím `F12` và chuyển sang chế độ Device Toolbar (mô phỏng màn hình điện thoại iPhone hoặc Pixel) để có kích thước chuẩn di động.
   - **Chạy trên máy ảo Android (Android Emulator):** Mở máy ảo Android Studio, sau đó nhấn phím `a` trên terminal.
   - **Chạy trên điện thoại thật:** Tải app **Expo Go** trên CH Play hoặc App Store, mở camera quét mã QR hiển thị trên màn hình terminal.

---

## PHẦN B: KỊCH BẢN QUAY VIDEO 1 – DEMO ỨNG DỤNG (2,0 ĐIỂM)
*(Hạn nộp: Nộp ngay trong ca học kiểm tra trên LMS. Thời lượng khuyến nghị: 4 – 6 phút)*

### 🎬 Bước 1: Giới thiệu thông tin sinh viên & Giao diện tổng quan
- **Hành động:** Khi mở ứng dụng lên, phóng to con trỏ chuột chỉ vào:
  1. Thanh Header tiêu đề màu xanh hiển thị rõ: **`BIT240080 - Nguyễn Đức Duy`** và tên ứng dụng `BIT240080 Food Manager`.
  2. Dải banner thông tin MSSV `BIT240080 - Nguyễn Đức Duy` và chấm tròn mạng màu xanh kèm chữ `Online Connected`.
- **Lời nói mẫu:**
  > *"Em chào thầy/cô! Em tên là Nguyễn Đức Duy, mã số sinh viên BIT240080. Hôm nay em xin phép demo bài kiểm tra giữa kỳ môn Phát triển ứng dụng di động với đề tài Quản lý món ăn, tên project là BIT240080_FoodManager."*

### 🎬 Bước 2: Chuyển đổi đa ngôn ngữ (Mục 4.5)
- **Hành động:**
  1. Chỉ ra giao diện ban đầu mặc định là **Tiếng Anh (English)**: tiêu đề *Dishes List*, các nút *Filter*, nhãn trạng thái *Available / Selling*, nhãn tốc độ *Quick / Regular*.
  2. Bấm vào nút chuyển đổi ngôn ngữ ở góc trên bên phải: `🇻🇳 VI`.
  3. Quan sát toàn bộ giao diện lập tức chuyển sang **Tiếng Việt**: *Danh Sách Món Ăn, Bộ Lọc, Đang bán, Nhanh, Thông thường*.
  4. Bấm vào xem Chi tiết 1 món ăn hoặc bấm nút Thêm mới -> thấy giao diện màn hình mới vẫn giữ nguyên Tiếng Việt (chứng minh lưu ngôn ngữ vào `AsyncStorage`).
  5. Bấm nút chuyển lại sang `🇬🇧 EN` để tiếp tục demo.

### 🎬 Bước 3: Tìm kiếm, Lọc kết hợp nhiều điều kiện & Sắp xếp (Mục 4.2 & 4.4)
- **Hành động:**
  1. **Tìm kiếm:** Gõ vào ô tìm kiếm chữ `bo` -> Danh sách lọc ra món *"Phở Bò Tái Nạm"* (chứng minh tìm kiếm tiếng Việt không phân biệt hoa thường và không dấu).
  2. **Lọc theo loại:** Bấm chọn các tab cuộn ngang: chọn *Desserts* -> chỉ hiện các món tráng miệng; chọn *Beverages* -> chỉ hiện đồ uống; bấm chọn lại *All Categories*.
  3. **Lọc trạng thái bán & Khoảng giá:** Bấm vào nút `⚙ Filter`:
     - Chọn *Only Show Available (Selling)* -> Món *"Bánh Flan Caramen"* (đang ngừng bán) bị ẩn đi.
     - Thử nghiệm bắt lỗi khoảng giá không hợp lệ (Mục 4.4): Nhập `Min: 70000`, `Max: 30000` -> Hệ thống lập tức xuất hiện dòng cảnh báo màu đỏ: `⚠️ Invalid price range: Min Price cannot be greater than Max Price!`.
     - Nhập khoảng giá hợp lệ: `Min: 20000`, `Max: 55000` -> Bấm *Apply*. Danh sách lọc chính xác các món trong tầm giá.
  4. **Sắp xếp:** Mở lại Filter, chọn *Price: Low to High* -> Bấm *Apply*, các món được xếp theo giá tăng dần.
  5. **Bảo lưu bộ lọc khi back (Mục 4.2):** Bấm vào 1 món bất kỳ để xem Chi tiết -> Bấm nút Back quay ra ngoài -> Chỉ cho giảng viên thấy: từ khóa tìm kiếm, loại món đã chọn, khoảng giá và kết quả danh sách vẫn được giữ nguyên vẹn 100%.

### 🎬 Bước 4: Màn hình Chi tiết, Quản lý ảnh & Tốc độ chế biến (Mục 4.3)
- **Hành động:**
  1. Bấm vào món *"Phở Bò Tái Nạm"*:
     - Chỉ vào ảnh lớn và danh sách thumbnail các góc ảnh khác nhau cuộn ngang bên dưới.
     - Bấm chọn ảnh thứ 2 hoặc thứ 3 -> Bấm nút `★ Set as Main / Đặt Làm Ảnh Chính` -> Ảnh chính đổi ngay lập tức và xuất hiện huy hiệu `★ Main Thumbnail`.
     - Bấm `+ Add Image URL` -> Dán 1 link ảnh mới -> Ảnh mới xuất hiện trong gallery.
     - Bấm nút `✕` trên góc ảnh để xóa ảnh.
  2. Chỉ vào nhãn phân loại tốc độ:
     - Món có thời gian `<= 15 phút` (như Phở Bò 12 phút): Hiển thị huy hiệu xanh lá `Quick (≤ 15 mins)`.
     - Bấm Back ra ngoài và bấm vào món *"Bún Chả Hà Nội"* (20 phút): Hiển thị huy hiệu `Regular (> 15 mins)`.

### 🎬 Bước 5: Thêm, Sửa, Xóa món ăn & Validation nghiệp vụ (Mục 3 & 4.1)
- **Hành động:**
  1. **Thêm món mới:** Bấm nút `+ Add New` ở góc dưới:
     - Thử nghiệm nhập trùng tên (Mục 3): Chọn loại *Món chính* và gõ tên trùng *"Phở Bò Tái Nạm"* -> Bấm Lưu -> Hệ thống chặn lại và báo lỗi: `Dish name already exists in this category`.
     - Đổi tên thành món mới: *"Gỏi Cuốn Tôm Thịt"*, Giá: `35000`, Thời gian: `10`, chọn loại *Món chính*, thêm link ảnh -> Bấm *Save Dish* -> Thông báo thành công và món xuất hiện trên đầu danh sách.
  2. **Sửa món:** Bấm nút *Edit* ở món vừa tạo -> Sửa giá thành `40000` -> Bấm Lưu -> Dữ liệu cập nhật ngay.
  3. **Xóa món:** Bấm nút *Delete* -> Xuất hiện hộp thoại xác nhận `Are you sure you want to delete...?` -> Bấm Confirm -> Món ăn bị xóa khỏi danh sách.

### 🎬 Bước 6: Quản lý loại món & Ràng buộc không cho xóa loại đang dùng (Mục 4.4)
- **Hành động:**
  1. Bấm vào nút `📁 Categories` trên thanh Header.
  2. Màn hình hiển thị danh sách các loại món kèm số lượng món ăn đang sử dụng (ví dụ: *Main Dishes (3 dishes)*).
  3. Bấm nút *Delete* vào loại món *Main Dishes* (đang có 3 món ăn) -> Hệ thống lập tức bật hộp thoại cảnh báo: **`Cannot delete category that currently has dishes in use! / Không cho xóa loại món đang có món ăn sử dụng!`** và không xóa.
  4. Thêm một loại món mới: *"Món Ăn Vặt"* (số lượng là 0 món).
  5. Bấm nút *Delete* loại *Món Ăn Vặt* vừa tạo -> Xóa thành công.

### 🎬 Bước 7: Tính năng Nâng cao: Offline Mode & Tự động đồng bộ lên MockAPI (1,5 điểm)
- **Hành động:**
  1. Mở trình duyệt vào trang MockAPI: `https://6ad73e6095e98f36aef21c1e.mockapi.io/BIT240080_Dish` cho giảng viên thấy dữ liệu hiện tại.
  2. **Tắt mạng Internet:** Tắt Wi-Fi máy tính (hoặc bật Airplane Mode trên điện thoại/máy ảo).
  3. Quan sát thanh trạng thái trên app lập tức đổi thành: `Offline Mode (Local Storage)` với chấm tròn màu cam.
  4. Bấm `+ Add New` tạo 1 món ăn mới khi đang Offline:
     - Tên món: *"Bánh Mì Chảo Hà Nội"*
     - Giá: `45000`, Thời gian: `12` phút, chọn loại *Món chính*.
     - Bấm *Save Dish* -> Món ăn lưu thành công vào SQLite cục bộ và xuất hiện ngay trên danh sách với huy hiệu màu cam **`Pending Update / Offline`**.
  5. **Bật lại mạng Internet:** Bật lại Wi-Fi.
  6. Quan sát màn hình app: **KHÔNG CẦN BẤM BẤT KỲ NÚT ĐỒNG BỘ NÀO**, thanh thông báo tự động xuất hiện:
     `🔄 Auto-syncing with MockAPI...` ➔ `✅ Synced 1 item(s) with MockAPI`.
     Huy hiệu trên món ăn tự động đổi sang màu xanh lá: **`✓ Synced`**.
  7. Quay lại trình duyệt tab MockAPI, nhấn F5 (Refresh) -> Cho giảng viên thấy bản ghi *"Bánh Mì Chảo Hà Nội"* đã được tự động đẩy lên MockAPI thành công, không hề bị trùng lặp bản ghi!
- **Kết thúc Video 1:** Cảm ơn thầy cô đã theo dõi phần demo.

---

## PHẦN C: KỊCH BẢN THUYẾT MINH MÃ NGUỒN CHO VIDEO 2 (2,0 ĐIỂM)
*(Hạn nộp: Chậm nhất ngày 23/10/2026 trên LMS)*

Khi quay Video 2, mở mã nguồn dự án trên VS Code và trình bày theo trình tự sau:

### 1. Cấu trúc Project & Đặt tên tiền tố `BIT240080_` (Mục 1 & 2 đề thi)
- **Mở file `app.json` (dòng 3 - 4) và `package.json` (dòng 2):**
  Chỉ rõ tên project được đặt theo đúng cấu trúc đề thi: `BIT240080_FoodManager`.
- **Mở file `src/types/index.ts`:**
  - Model `BIT240080_DishCategory` (dòng 11 - 15): gồm các trường `BIT240080_Id`, `BIT240080_Name`, `BIT240080_Description`.
  - Model `BIT240080_Dish` (dòng 28 - 38): gồm các trường `BIT240080_Id`, `BIT240080_Name`, `BIT240080_Price`, `BIT240080_PreparationTime`, `BIT240080_IsAvailable`, `BIT240080_Description`, `BIT240080_DishCategoryId`, `BIT240080_DishImage`, `BIT240080_SyncStatus`.
  - Cấu trúc ảnh `BIT240080_DishImageItem` (dòng 6 - 9): `BIT240080_ImageUrl` và `BIT240080_IsThumbnail`.
  > *Nhấn mạnh: 100% bảng và cột đều tuân thủ nghiêm ngặt tiền tố MSSV `BIT240080_` để không bị trừ 1 - 3 điểm.*

### 2. Thiết kế CSDL SQLite & Dữ liệu mẫu ban đầu (`src/database/db.ts` & `seedData.ts`)
- **Mở file `src/database/db.ts`:**
  - Dòng 58 - 84: Câu lệnh `CREATE TABLE IF NOT EXISTS BIT240080_DishCategory` và `BIT240080_Dish` kèm khóa ngoại tham chiếu `FOREIGN KEY (BIT240080_DishCategoryId) REFERENCES BIT240080_DishCategory(BIT240080_Id)`.
  - Dòng 86 - 150: Hàm `initDatabase()` kiểm tra dữ liệu, tự động nạp **3 loại món ăn** và **7 món ăn mẫu** với đầy đủ các ảnh Unsplash, trạng thái bán và thời gian nấu khác nhau.
  - Dòng 217 - 239: Hàm `deleteCategory()` thực hiện truy vấn `SELECT COUNT(*) FROM BIT240080_Dish WHERE BIT240080_DishCategoryId = ?` để **ngăn chặn xóa loại món đang có món ăn sử dụng** (Mục 4.4).
  - Dòng 310 - 331: Hàm `checkDishNameDuplicate()` kiểm tra **tên món không trùng trong cùng loại** (có tham số `excludeDishId` khi sửa).
  - Dòng 252 - 300: Hàm `getAllDishes()` truy vấn kết hợp tìm kiếm, lọc theo loại, lọc theo trạng thái đang bán, lọc khoảng giá an toàn và sắp xếp.

### 3. Đa ngôn ngữ i18n (`src/i18n/LanguageContext.tsx` & `translations.ts`)
- **Mở file `src/i18n/translations.ts`:**
  Chỉ rõ từ điển song ngữ hoàn chỉnh cho `en` (mặc định) và `vi` bao gồm toàn bộ tiêu đề, nhãn nút, nhãn tốc độ Quick/Regular, thông báo lỗi validation và cảnh báo xác nhận.
- **Mở file `src/i18n/LanguageContext.tsx`:**
  Giải thích việc lưu trạng thái ngôn ngữ đã chọn vào `AsyncStorage` bằng key `@bit240080_app_language` để duy trì khi chuyển màn hình hoặc khởi động lại app.

### 4. Kết nối REST API MockAPI (`src/services/api.ts`)
- **Mở file `src/services/api.ts`:**
  - Dòng 10: MockAPI Base URL `https://6ad73e6095e98f36aef21c1e.mockapi.io`.
  - Các hàm gọi API tương ứng 2 endpoint: `/BIT240080_DishCategory` và `/BIT240080_Dish`.
  - Cơ chế timeout và hàm tìm kiếm thông minh theo `BIT240080_Id` trước khi thực hiện PUT/DELETE để tương thích hoàn toàn với MockAPI.

### 5. Hoạt động Offline & Tự động đồng bộ 2 chiều chống trùng lặp (`src/services/syncService.ts`)
- **Mở file `src/services/syncService.ts`:**
  - Dòng 220 - 245: Hàm `setupAutoSync()` sử dụng `NetInfo.addEventListener` để lắng nghe mạng. Khi phát hiện mạng từ offline chuyển sang online, tự động kích hoạt hàm `syncData()` mà không cần người dùng thao tác.
  - Dòng 90 - 215: Hàm `syncData()`:
    + Đẩy các bản ghi `PENDING_CREATE`, `PENDING_UPDATE`, `PENDING_DELETE` lên MockAPI.
    + **Cơ chế chống phát sinh bản ghi trùng (Mục 5):** Trước khi gọi `createDishApi`, kiểm tra xem món ăn với `BIT240080_Id` hoặc cặp `(Tên món + Loại món)` đã có trên MockAPI chưa. Nếu đã có thì gọi `updateDishApi` (PUT), chưa có mới gọi `createDishApi` (POST).
    + Sau khi đẩy thành công, cập nhật trạng thái cục bộ `BIT240080_SyncStatus = 'SYNCED'`.
    + Đồng thời tải các bản ghi mới từ MockAPI về SQLite nhưng không ghi đè lên các bản ghi đang chờ offline (`PENDING_*`).

---

## PHẦN D: THÔNG TIN LINK NỘP BÀI TRÊN LMS
- **Link mã nguồn GitHub:** [https://github.com/duynguyen1012/BIT240080_FoodManager](https://github.com/duynguyen1012/BIT240080_FoodManager)
- **Link Video 1 (Demo ứng dụng):** *(Điền link Google Drive / YouTube Unlisted của bạn)*
- **Link Video 2 (Thuyết minh code):** *(Điền link Google Drive / YouTube Unlisted của bạn)*
