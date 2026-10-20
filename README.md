# BIT240080_FoodManager - Ứng Dụng Quản Lý Món Ăn

> **BÀI KIỂM TRA GIỮA KỲ: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG**  
> **Sinh viên:** Nguyễn Đức Duy  
> **MSSV:** BIT240080  
> **Repository:** [https://github.com/duynguyen1012/BIT240080_FoodManager](https://github.com/duynguyen1012/BIT240080_FoodManager)  
> **MockAPI REST API:** [https://6ad73e6095e98f36aef21c1e.mockapi.io](https://6ad73e6095e98f36aef21c1e.mockapi.io)

---

## 📌 1. Giới thiệu dự án

Dự án **BIT240080_FoodManager** được xây dựng trên nền tảng **React Native (Expo TypeScript)** với công nghệ lưu trữ **SQLite (`expo-sqlite`)** kết hợp dịch vụ đám mây **MockAPI qua REST API**. Ứng dụng đáp ứng trọn vẹn 100% các tiêu chí từ cơ bản đến nâng cao trong barem chấm điểm giữa kỳ:

- **Quy định đặt tên dữ liệu nghiêm ngặt:** Toàn bộ bảng CSDL (`BIT240080_DishCategory`, `BIT240080_Dish`) và mọi thuộc tính dữ liệu (`BIT240080_Id`, `BIT240080_Name`, `BIT240080_Price`, `BIT240080_PreparationTime`, `BIT240080_IsAvailable`, `BIT240080_Description`, `BIT240080_DishCategoryId`, `BIT240080_DishImage`, `BIT240080_SyncStatus`) đều bắt buộc có tiền tố **`BIT240080_`**.
- **Quản lý danh sách, chi tiết, thêm, sửa, xóa món ăn:** CRUD hoàn chỉnh với giao diện hiện đại, trực quan.
- **Tìm kiếm & Lọc đa điều kiện (Mục 4.2):** Tìm kiếm tên món (tiếng Việt không dấu/có dấu), lọc theo loại, lọc theo trạng thái đang bán, lọc khoảng giá (bắt lỗi hợp lý `Min > Max`), sắp xếp theo giá và thời gian nấu; bảo lưu trạng thái lọc khi chuyển màn hình.
- **Quản lý ảnh đại diện & Phân loại tốc độ (Mục 4.3):**
  - Quản lý danh sách ảnh với đúng 01 ảnh đại diện chính `BIT240080_IsThumbnail = true`, cho phép đổi ảnh thumbnail trực tiếp.
  - Tự động hiển thị huy hiệu **"Quick / Nhanh"** khi thời gian chế biến $\le 15$ phút, và **"Regular / Thông thường"** khi $> 15$ phút.
- **Ràng buộc nghiệp vụ & Validation (Mục 3 & 4.4):**
  - Tên món không được trùng trong cùng loại (loại trừ chính nó khi sửa).
  - Không cho xóa loại món đang có món ăn sử dụng.
  - Xử lý lỗi an toàn khi Id không tồn tại, ảnh lỗi URL, hoặc lỗi truy cập MockAPI.
- **Đa ngôn ngữ toàn diện (Mục 4.5):** Mặc định là **Tiếng Anh (English)**, hỗ trợ chuyển đổi linh hoạt sang **Tiếng Việt (Vietnamese)** và lưu trạng thái vào `AsyncStorage`.
- **Yêu cầu nâng cao (1.5 điểm - Mục 5):**
  - Hoạt động Offline-First: mất mạng vẫn thao tác bình thường, lưu hàng đợi `PENDING_*` vào SQLite.
  - Tự động phát hiện mạng qua `NetInfo` và đồng bộ 2 chiều với MockAPI khi có mạng trở lại, không đòi hỏi người dùng bấm nút đồng bộ.
  - Thuật toán chống trùng lặp bản ghi (Deduplication).

---

## 🚀 2. Hướng dẫn khởi chạy ứng dụng

```bash
# 1. Clone repository
git clone https://github.com/duynguyen1012/BIT240080_FoodManager.git
cd BIT240080_FoodManager

# 2. Cài đặt các gói phụ thuộc (nếu chưa có node_modules)
npm install

# 3. Khởi chạy Expo Server
npx expo start
```

### Các tùy chọn chạy:
- Nhấn phím `w` để chạy trên trình duyệt Web (khuyến nghị khi quay video demo).
- Nhấn phím `a` để mở trên Android Emulator.
- Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại thật.

---

## 📂 3. Cấu trúc thư mục

```text
BIT240080_FoodManager/
├── HUONG_DAN_QUAY_VIDEO_BIT240080.md # Kịch bản chi tiết quay Video 1 & Video 2
├── app.json                          # Cấu hình Expo, tên app BIT240080_FoodManager
├── App.tsx                           # Điểm khởi chạy ứng dụng, Safe Area & Database Init
├── package.json                      # Danh sách dependencies
├── tsconfig.json                     # Cấu hình TypeScript
└── src/
    ├── database/
    │   ├── db.ts                     # CSDL SQLite, tạo bảng BIT240080_, CRUD & Ràng buộc
    │   └── seedData.ts               # Dữ liệu mẫu 3 categories, 7 dishes chuẩn Unsplash
    ├── i18n/
    │   ├── LanguageContext.tsx       # React Context lưu ngôn ngữ vào AsyncStorage
    │   └── translations.ts           # Từ điển hoàn chỉnh English (mặc định) & Tiếng Việt
    ├── navigation/
    │   └── RootNavigator.tsx         # Stack Navigator, Header chuẩn "BIT240080 - Nguyễn Đức Duy"
    ├── screens/
    │   ├── CategoryManagerScreen.tsx # Quản lý loại món & chặn xóa loại đang dùng
    │   ├── DishDetailScreen.tsx      # Chi tiết món, gallery nhiều ảnh, đổi ảnh Thumbnail
    │   ├── DishFormScreen.tsx        # Form Thêm/Sửa món, chọn loại, validation chặt chẽ
    │   └── DishListScreen.tsx        # Danh sách món ăn, tìm kiếm, lọc đa điều kiện, auto-sync
    ├── services/
    │   ├── api.ts                    # REST API gọi tới MockAPI (/BIT240080_Dish & /BIT240080_DishCategory)
    │   └── syncService.ts            # Tự động đồng bộ 2 chiều SQLite <-> MockAPI khi có mạng
    └── types/
        └── index.ts                  # Type definitions với 100% thuộc tính tiền tố BIT240080_
```

---

## 📹 4. Tài liệu quay Video nộp bài

Xem chi tiết trong file [`HUONG_DAN_QUAY_VIDEO_BIT240080.md`](./HUONG_DAN_QUAY_VIDEO_BIT240080.md):
- **Video 1 (2.0 điểm):** Kịch bản quay trực tiếp màn hình demo đầy đủ chức năng, quay offline tắt/bật Wi-Fi tự động đồng bộ.
- **Video 2 (2.0 điểm):** Kịch bản thuyết minh mã nguồn theo từng file và số dòng code liên quan đến MSSV `BIT240080`.
