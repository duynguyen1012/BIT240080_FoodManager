/**
 * BIT240080_FoodManager - i18n Translations
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Mặc định: Tiếng Anh (English)
 * Hỗ trợ chuyển đổi song ngữ: English <-> Tiếng Việt
 */

export const translations = {
  en: {
    // Header & App Info
    app_header_student: 'BIT240080 - Nguyễn Đức Duy',
    app_title: 'BIT240080 Food Manager',

    // Screen Titles
    screen_dish_list: 'Dishes List',
    screen_dish_detail: 'Dish Details',
    screen_add_dish: 'Add New Dish',
    screen_edit_dish: 'Edit Dish',
    screen_category_manager: 'Manage Categories',

    // Action Buttons
    btn_add: 'Add New',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_save: 'Save Dish',
    btn_cancel: 'Cancel',
    btn_refresh: 'Refresh',
    btn_filter: 'Filter',
    btn_sort: 'Sort',
    btn_search: 'Search',
    btn_reset: 'Reset',
    btn_apply: 'Apply',
    btn_confirm: 'Confirm',
    btn_close: 'Close',
    btn_back: 'Back',
    btn_set_thumbnail: 'Set as Main',
    btn_add_image: 'Add Image URL',
    btn_manage_categories: 'Categories',
    btn_sync_now: 'Sync Now',

    // Dish Fields & Labels
    label_id: 'ID',
    label_name: 'Dish Name',
    label_category: 'Category',
    label_price: 'Price (VND)',
    label_prep_time: 'Preparation Time',
    label_status: 'Availability Status',
    label_description: 'Description',
    label_images: 'Dish Images',
    label_thumbnail: 'Main Thumbnail',
    label_speed: 'Speed Category',
    label_sync_status: 'Sync Status',
    label_actions: 'Actions',

    // Status Values
    status_available: 'Available / Selling',
    status_unavailable: 'Stopped / Unavailable',
    status_quick: 'Quick (≤ 15 mins)',
    status_regular: 'Regular (> 15 mins)',
    speed_quick_tag: 'Quick',
    speed_regular_tag: 'Regular',
    time_minutes: 'minutes',
    time_min: 'mins',

    // Sync Statuses
    sync_synced: 'Synced',
    sync_pending_create: 'Pending Create',
    sync_pending_update: 'Pending Update',
    sync_pending_delete: 'Pending Delete',
    network_online: 'Online Connected',
    network_offline: 'Offline Mode (Local Storage)',

    // Filter & Search
    search_placeholder: 'Search dish name...',
    filter_all_categories: 'All Categories',
    filter_price_from: 'Price From (VND)',
    filter_price_to: 'Price To (VND)',
    filter_status_label: 'Availability Status',
    filter_status_all: 'All Dishes (Management view)',
    filter_status_available_only: 'Available Only (Selling)',
    filter_available_only: 'Only Show Available (Selling)',
    filter_sort_by: 'Sort By',
    sort_price_asc: 'Price: Low to High',
    sort_price_desc: 'Price: High to Low',
    sort_prep_asc: 'Prep Time: Shortest first',
    sort_default: 'Default (Newest)',
    placeholder_min_price: 'Min (e.g. 20000)',
    placeholder_max_price: 'Max (e.g. 70000)',

    // Category Manager Specific
    add_category_title: '+ Add New Category',
    edit_category_title: '✎ Edit Category',
    category_name_placeholder: 'Category name (e.g. Appetizers, BBQ...)',
    category_desc_placeholder: 'Category description (optional)',
    category_dish_count: '{count} dishes',
    validation_category_name_required: 'Category name cannot be empty',
    validation_category_name_duplicate: 'Category name already exists',
    alert_success_category_create: 'Category created successfully!',
    alert_success_category_update: 'Category updated successfully!',

    // Validation & Errors
    validation_name_required: 'Dish name cannot be empty',
    validation_price_invalid: 'Price must be a valid number greater than 0',
    validation_price_negative: 'Price cannot be negative or zero',
    validation_prep_time_invalid: 'Preparation time must be greater than 0 minutes',
    validation_category_required: 'Please select a valid category from list',
    validation_name_duplicate: 'Dish name already exists in this category',
    validation_image_required: 'Please add at least one image URL',
    validation_image_url_invalid: 'Please enter a valid HTTP/HTTPS image URL',
    validation_price_range_invalid: 'Invalid price range: Min Price cannot be greater than Max Price!',

    // Confirmation & Alerts
    alert_delete_title: 'Delete Confirmation',
    alert_delete_dish_confirm: 'Are you sure you want to delete dish "{name}"?',
    alert_delete_category_confirm: 'Are you sure you want to delete category "{name}"?',
    alert_delete_image_confirm: 'Are you sure you want to delete this image?',
    alert_at_least_one_image: 'Each dish must keep at least one image!',
    alert_category_in_use: 'Cannot delete category that currently has dishes in use!',
    alert_success_create: 'Dish created successfully!',
    alert_success_update: 'Dish updated successfully!',
    alert_success_delete: 'Dish deleted successfully!',
    alert_error_generic: 'An error occurred. Please try again.',
    alert_mockapi_error: 'MockAPI request failed or network issue.',
    dish_not_found: 'Dish not found or has been deleted.',

    // Empty States
    empty_dishes: 'No dishes found matching your criteria.',
    empty_images: 'No images available for this dish.',
    empty_categories: 'No categories available.',

    // Language Toggle
    switch_language: 'Language',
    lang_en: 'English',
    lang_vi: 'Tiếng Việt',
  },
  vi: {
    // Header & App Info
    app_header_student: 'BIT240080 - Nguyễn Đức Duy',
    app_title: 'BIT240080 Quản Lý Món Ăn',

    // Screen Titles
    screen_dish_list: 'Danh Sách Món Ăn',
    screen_dish_detail: 'Chi Tiết Món Ăn',
    screen_add_dish: 'Thêm Món Ăn Mới',
    screen_edit_dish: 'Chỉnh Sửa Món Ăn',
    screen_category_manager: 'Quản Lý Loại Món',

    // Action Buttons
    btn_add: 'Thêm Mới',
    btn_edit: 'Chỉnh Sửa',
    btn_delete: 'Xóa Món',
    btn_save: 'Lưu Món Ăn',
    btn_cancel: 'Hủy Bỏ',
    btn_refresh: 'Làm Mới',
    btn_filter: 'Bộ Lọc',
    btn_sort: 'Sắp Xếp',
    btn_search: 'Tìm Kiếm',
    btn_reset: 'Đặt Lại',
    btn_apply: 'Áp Dụng',
    btn_confirm: 'Xác Nhận',
    btn_close: 'Đóng',
    btn_back: 'Quay Lại',
    btn_set_thumbnail: 'Đặt Làm Ảnh Chính',
    btn_add_image: 'Thêm Link Ảnh',
    btn_manage_categories: 'Loại Món',
    btn_sync_now: 'Đồng Bộ Ngay',

    // Dish Fields & Labels
    label_id: 'Mã (ID)',
    label_name: 'Tên Món Ăn',
    label_category: 'Loại Món Ăn',
    label_price: 'Giá Tiền (VNĐ)',
    label_prep_time: 'Thời Gian Chế Biến',
    label_status: 'Trạng Thái Kinh Doanh',
    label_description: 'Mô Tả Chi Tiết',
    label_images: 'Danh Sách Hình Ảnh',
    label_thumbnail: 'Ảnh Đại Diện Chính',
    label_speed: 'Phân Loại Tốc Độ',
    label_sync_status: 'Trạng Thái Đồng Bộ',
    label_actions: 'Thao Tác',

    // Status Values
    status_available: 'Đang bán (Available)',
    status_unavailable: 'Ngừng bán (Unavailable)',
    status_quick: 'Nhanh (≤ 15 phút)',
    status_regular: 'Thông thường (> 15 phút)',
    speed_quick_tag: 'Nhanh',
    speed_regular_tag: 'Thông thường',
    time_minutes: 'phút',
    time_min: 'phút',

    // Sync Statuses
    sync_synced: 'Đã đồng bộ',
    sync_pending_create: 'Chờ tạo (Offline)',
    sync_pending_update: 'Chờ sửa (Offline)',
    sync_pending_delete: 'Chờ xóa (Offline)',
    network_online: 'Đã kết nối Internet',
    network_offline: 'Chế độ Ngoại tuyến (Offline Local)',

    // Filter & Search
    search_placeholder: 'Tìm kiếm tên món ăn...',
    filter_all_categories: 'Tất cả loại món',
    filter_price_from: 'Giá từ (VNĐ)',
    filter_price_to: 'Giá đến (VNĐ)',
    filter_status_label: 'Trạng thái kinh doanh',
    filter_status_all: 'Tất cả món (Bao gồm món ngừng bán)',
    filter_status_available_only: 'Chỉ hiện món đang bán',
    filter_available_only: 'Chỉ hiện món đang bán',
    filter_sort_by: 'Sắp xếp theo',
    sort_price_asc: 'Giá: Thấp đến Cao',
    sort_price_desc: 'Giá: Cao đến Thấp',
    sort_prep_asc: 'Thời gian chế biến: Nhanh nhất',
    sort_default: 'Mặc định (Mới nhất)',
    placeholder_min_price: 'Từ (vd: 20000)',
    placeholder_max_price: 'Đến (vd: 70000)',

    // Category Manager Specific
    add_category_title: '+ Thêm Loại Món Mới',
    edit_category_title: '✎ Chỉnh Sửa Loại Món',
    category_name_placeholder: 'Tên loại món (Ví dụ: Khai vị, Đồ nướng...)',
    category_desc_placeholder: 'Mô tả loại món (tùy chọn)',
    category_dish_count: '{count} món',
    validation_category_name_required: 'Tên loại món không được để trống',
    validation_category_name_duplicate: 'Tên loại món đã tồn tại',
    alert_success_category_create: 'Đã thêm loại món thành công!',
    alert_success_category_update: 'Đã cập nhật loại món thành công!',

    // Validation & Errors
    validation_name_required: 'Tên món ăn không được để trống',
    validation_price_invalid: 'Giá tiền phải là số hợp lệ và lớn hơn 0',
    validation_price_negative: 'Giá tiền không được là số âm hoặc bằng 0',
    validation_prep_time_invalid: 'Thời gian chế biến phải là số hợp lệ và lớn hơn 0 phút',
    validation_category_required: 'Vui lòng chọn loại món ăn hợp lệ từ danh sách',
    validation_name_duplicate: 'Tên món đã tồn tại trong cùng loại món này',
    validation_image_required: 'Vui lòng nhập ít nhất một liên kết ảnh',
    validation_image_url_invalid: 'Vui lòng nhập định dạng link ảnh hợp lệ (http/https)',
    validation_price_range_invalid: 'Khoảng giá lọc không hợp lệ: Giá từ không được lớn hơn Giá đến!',

    // Confirmation & Alerts
    alert_delete_title: 'Xác Nhận Xóa',
    alert_delete_dish_confirm: 'Bạn có chắc chắn muốn xóa món "{name}" không?',
    alert_delete_category_confirm: 'Bạn có chắc chắn muốn xóa loại món "{name}" không?',
    alert_delete_image_confirm: 'Bạn có chắc chắn muốn xóa ảnh này không?',
    alert_at_least_one_image: 'Mỗi món ăn bắt buộc phải có tối thiểu một hình ảnh!',
    alert_category_in_use: 'Không cho xóa loại món đang có món ăn sử dụng!',
    alert_success_create: 'Đã thêm món ăn mới thành công!',
    alert_success_update: 'Đã cập nhật món ăn thành công!',
    alert_success_delete: 'Đã xóa món ăn thành công!',
    alert_error_generic: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    alert_mockapi_error: 'Lỗi kết nối hoặc truy cập MockAPI.',
    dish_not_found: 'Không tìm thấy món ăn hoặc món đã bị xóa.',

    // Empty States
    empty_dishes: 'Không tìm thấy món ăn nào phù hợp với bộ lọc.',
    empty_images: 'Chưa có ảnh nào cho món ăn này.',
    empty_categories: 'Chưa có danh mục nào.',

    // Language Toggle
    switch_language: 'Ngôn ngữ',
    lang_en: 'English',
    lang_vi: 'Tiếng Việt',
  },
};

export type LanguageType = 'en' | 'vi';
export type TranslationKey = keyof typeof translations.en;
