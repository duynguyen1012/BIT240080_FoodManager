/**
 * BIT240080_FoodManager - Type Definitions
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Lưu ý: Toàn bộ bảng và trường dữ liệu bắt buộc có tiền tố BIT240080_
 */

export interface BIT240080_DishImageItem {
  BIT240080_ImageUrl: string;
  BIT240080_IsThumbnail: boolean;
}

export interface BIT240080_DishCategory {
  BIT240080_Id: string;
  BIT240080_Name: string;
  BIT240080_Description?: string;
}

export interface BIT240080_CategoryWithCount extends BIT240080_DishCategory {
  dishCount: number;
}

export type BIT240080_SyncStatusType =
  | 'SYNCED'
  | 'PENDING_CREATE'
  | 'PENDING_UPDATE'
  | 'PENDING_DELETE';

export interface BIT240080_Dish {
  BIT240080_Id: string;
  BIT240080_Name: string;
  BIT240080_Price: number;
  BIT240080_PreparationTime: number; // in minutes
  BIT240080_IsAvailable: number; // 1: Đang bán (Available), 0: Ngừng bán (Unavailable)
  BIT240080_Description?: string;
  BIT240080_DishCategoryId: string;
  BIT240080_DishImage: string; // JSON string of BIT240080_DishImageItem[]
  BIT240080_SyncStatus?: BIT240080_SyncStatusType;
}

export interface DishFilterParams {
  searchQuery?: string;
  categoryId?: string;
  isAvailableOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'prep_asc';
}

export type RootStackParamList = {
  DishList: undefined;
  DishDetail: { dishId: string };
  DishForm: { dishId?: string; initialCategoryId?: string };
  CategoryManager: undefined;
};
