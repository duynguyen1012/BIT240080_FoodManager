/**
 * BIT240080_FoodManager - SQLite Database Operations
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Lưu ý: Toàn bộ bảng và trường dữ liệu bắt buộc có tiền tố BIT240080_
 * Sử dụng thư viện expo-sqlite phiên bản hiện đại (openDatabaseAsync / runAsync / getAllAsync)
 */

import * as SQLite from 'expo-sqlite';
import {
  BIT240080_DishCategory,
  BIT240080_Dish,
  BIT240080_DishImageItem,
  BIT240080_CategoryWithCount,
  DishFilterParams,
} from '../types';
import { SEED_CATEGORIES, SEED_DISHES } from './seedData';

const DB_NAME = 'BIT240080_food_manager.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const DEFAULT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

/**
 * Lấy đối tượng kết nối SQLite (Singleton)
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không phân biệt có dấu / không dấu
 */
export function normalizeSearchText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Khởi tạo cơ sở dữ liệu: Tạo bảng và nạp dữ liệu mẫu ban đầu
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();

  // Bật hỗ trợ ràng buộc khóa ngoại
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // 1. Tạo bảng BIT240080_DishCategory
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS BIT240080_DishCategory (
      BIT240080_Id TEXT PRIMARY KEY NOT NULL,
      BIT240080_Name TEXT NOT NULL,
      BIT240080_Description TEXT
    );
  `);

  // 2. Tạo bảng BIT240080_Dish
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS BIT240080_Dish (
      BIT240080_Id TEXT PRIMARY KEY NOT NULL,
      BIT240080_Name TEXT NOT NULL,
      BIT240080_Price REAL NOT NULL,
      BIT240080_PreparationTime INTEGER NOT NULL,
      BIT240080_IsAvailable INTEGER NOT NULL,
      BIT240080_Description TEXT,
      BIT240080_DishCategoryId TEXT NOT NULL,
      BIT240080_DishImage TEXT NOT NULL,
      BIT240080_SyncStatus TEXT DEFAULT 'SYNCED',
      FOREIGN KEY (BIT240080_DishCategoryId) REFERENCES BIT240080_DishCategory (BIT240080_Id)
    );
  `);

  // Kiểm tra dữ liệu mẫu, nếu chưa có thì Seed Data
  const existingCategories = await db.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM BIT240080_DishCategory;'
  );

  if (existingCategories[0]?.count === 0) {
    console.log('[BIT240080_DB] Bắt đầu nạp dữ liệu mẫu ban đầu (Seed Data)...');

    // Nạp Categories
    for (const cat of SEED_CATEGORIES) {
      await db.runAsync(
        `INSERT INTO BIT240080_DishCategory (BIT240080_Id, BIT240080_Name, BIT240080_Description)
         VALUES (?, ?, ?);`,
        [cat.BIT240080_Id, cat.BIT240080_Name, cat.BIT240080_Description || '']
      );
    }

    // Nạp Dishes
    for (const dish of SEED_DISHES) {
      await db.runAsync(
        `INSERT INTO BIT240080_Dish (
          BIT240080_Id,
          BIT240080_Name,
          BIT240080_Price,
          BIT240080_PreparationTime,
          BIT240080_IsAvailable,
          BIT240080_Description,
          BIT240080_DishCategoryId,
          BIT240080_DishImage,
          BIT240080_SyncStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          dish.BIT240080_Id,
          dish.BIT240080_Name,
          dish.BIT240080_Price,
          dish.BIT240080_PreparationTime,
          dish.BIT240080_IsAvailable,
          dish.BIT240080_Description || '',
          dish.BIT240080_DishCategoryId,
          dish.BIT240080_DishImage,
          dish.BIT240080_SyncStatus || 'SYNCED',
        ]
      );
    }

    console.log('[BIT240080_DB] Đã hoàn thành Seed Data thành công!');
  }
}

// ==========================================
// THAO TÁC CRUD CHO BẢNG BIT240080_DishCategory
// ==========================================

export async function getAllCategories(): Promise<BIT240080_DishCategory[]> {
  const db = await getDatabase();
  return await db.getAllAsync<BIT240080_DishCategory>(
    'SELECT * FROM BIT240080_DishCategory ORDER BY BIT240080_Name ASC;'
  );
}

/**
 * Lấy danh sách loại món kèm số lượng món ăn đang sử dụng
 */
export async function getAllCategoriesWithCount(): Promise<BIT240080_CategoryWithCount[]> {
  const db = await getDatabase();
  const query = `
    SELECT 
      c.BIT240080_Id,
      c.BIT240080_Name,
      c.BIT240080_Description,
      COUNT(d.BIT240080_Id) as dishCount
    FROM BIT240080_DishCategory c
    LEFT JOIN BIT240080_Dish d 
      ON c.BIT240080_Id = d.BIT240080_DishCategoryId 
      AND d.BIT240080_SyncStatus != 'PENDING_DELETE'
    GROUP BY c.BIT240080_Id
    ORDER BY c.BIT240080_Name ASC;
  `;
  return await db.getAllAsync<BIT240080_CategoryWithCount>(query);
}

export async function getCategoryById(id: string): Promise<BIT240080_DishCategory | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<BIT240080_DishCategory>(
    'SELECT * FROM BIT240080_DishCategory WHERE BIT240080_Id = ?;',
    [id]
  );
  return result || null;
}

/**
 * Kiểm tra trùng tên loại món
 */
export async function checkCategoryNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
  const db = await getDatabase();
  let query = 'SELECT COUNT(*) as count FROM BIT240080_DishCategory WHERE LOWER(BIT240080_Name) = LOWER(?)';
  const params: string[] = [name.trim()];

  if (excludeId) {
    query += ' AND BIT240080_Id != ?';
    params.push(excludeId);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, params);
  return (result?.count || 0) > 0;
}

export async function insertCategory(category: BIT240080_DishCategory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO BIT240080_DishCategory (BIT240080_Id, BIT240080_Name, BIT240080_Description)
     VALUES (?, ?, ?);`,
    [category.BIT240080_Id, category.BIT240080_Name, category.BIT240080_Description || '']
  );
}

export async function updateCategory(category: BIT240080_DishCategory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE BIT240080_DishCategory
     SET BIT240080_Name = ?, BIT240080_Description = ?
     WHERE BIT240080_Id = ?;`,
    [category.BIT240080_Name, category.BIT240080_Description || '', category.BIT240080_Id]
  );
}

/**
 * Xóa danh mục món ăn. RÀNG BUỘC NGHIỆP VỤ 4.4:
 * Không cho xóa loại món đang được sử dụng bởi bất kỳ món ăn nào!
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; reason?: string }> {
  const db = await getDatabase();

  // Kiểm tra số lượng món ăn đang sử dụng danh mục này
  const dishCountResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM BIT240080_Dish
     WHERE BIT240080_DishCategoryId = ? AND BIT240080_SyncStatus != 'PENDING_DELETE';`,
    [id]
  );

  if (dishCountResult && dishCountResult.count > 0) {
    return {
      success: false,
      reason: 'CATEGORY_IN_USE',
    };
  }

  await db.runAsync('DELETE FROM BIT240080_DishCategory WHERE BIT240080_Id = ?;', [id]);
  return { success: true };
}

// ==========================================
// THAO TÁC CRUD CHO BẢNG BIT240080_Dish
// ==========================================

/**
 * Lấy danh sách món ăn kết hợp tìm kiếm, lọc đa điều kiện và sắp xếp (Mục 4.2)
 * Hỗ trợ tìm kiếm tiếng Việt không dấu và kiểm tra an toàn khoảng giá
 */
export async function getAllDishes(filter?: DishFilterParams): Promise<BIT240080_Dish[]> {
  const db = await getDatabase();
  const conditions: string[] = ["BIT240080_SyncStatus != 'PENDING_DELETE'"];
  const params: (string | number)[] = [];

  if (filter?.categoryId && filter.categoryId.trim().length > 0) {
    conditions.push('BIT240080_DishCategoryId = ?');
    params.push(filter.categoryId.trim());
  }

  if (filter?.isAvailableOnly) {
    conditions.push('BIT240080_IsAvailable = 1');
  }

  if (filter?.minPrice !== undefined && !isNaN(filter.minPrice) && filter.minPrice >= 0) {
    conditions.push('BIT240080_Price >= ?');
    params.push(filter.minPrice);
  }

  if (filter?.maxPrice !== undefined && !isNaN(filter.maxPrice) && filter.maxPrice >= 0) {
    conditions.push('BIT240080_Price <= ?');
    params.push(filter.maxPrice);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderByClause = 'ORDER BY BIT240080_Id DESC';
  if (filter?.sortBy === 'price_asc') {
    orderByClause = 'ORDER BY BIT240080_Price ASC';
  } else if (filter?.sortBy === 'price_desc') {
    orderByClause = 'ORDER BY BIT240080_Price DESC';
  } else if (filter?.sortBy === 'prep_asc') {
    orderByClause = 'ORDER BY BIT240080_PreparationTime ASC';
  }

  const query = `SELECT * FROM BIT240080_Dish ${whereClause} ${orderByClause};`;
  const rawList = await db.getAllAsync<BIT240080_Dish>(query, params);

  // Nếu có tìm kiếm bằng từ khóa, lọc bằng thuật toán chuẩn hóa tiếng Việt (không dấu / có dấu)
  if (filter?.searchQuery && filter.searchQuery.trim().length > 0) {
    const normalizedKeyword = normalizeSearchText(filter.searchQuery);
    return rawList.filter((item) => {
      const normalizedName = normalizeSearchText(item.BIT240080_Name);
      return normalizedName.includes(normalizedKeyword);
    });
  }

  return rawList;
}

export async function getDishById(id: string): Promise<BIT240080_Dish | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<BIT240080_Dish>(
    'SELECT * FROM BIT240080_Dish WHERE BIT240080_Id = ?;',
    [id]
  );
  return result || null;
}

/**
 * Kiểm tra ràng buộc dữ liệu mục 3:
 * Tên món không trùng trong cùng một loại (category)
 */
export async function checkDishNameDuplicate(
  name: string,
  categoryId: string,
  excludeDishId?: string
): Promise<boolean> {
  const db = await getDatabase();
  let query = `
    SELECT COUNT(*) as count FROM BIT240080_Dish
    WHERE LOWER(BIT240080_Name) = LOWER(?)
      AND BIT240080_DishCategoryId = ?
      AND BIT240080_SyncStatus != 'PENDING_DELETE'
  `;
  const params: string[] = [name.trim(), categoryId.trim()];

  if (excludeDishId) {
    query += ' AND BIT240080_Id != ?';
    params.push(excludeDishId);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, params);
  return (result?.count || 0) > 0;
}

export async function insertDish(dish: BIT240080_Dish): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO BIT240080_Dish (
      BIT240080_Id,
      BIT240080_Name,
      BIT240080_Price,
      BIT240080_PreparationTime,
      BIT240080_IsAvailable,
      BIT240080_Description,
      BIT240080_DishCategoryId,
      BIT240080_DishImage,
      BIT240080_SyncStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      dish.BIT240080_Id,
      dish.BIT240080_Name,
      dish.BIT240080_Price,
      dish.BIT240080_PreparationTime,
      dish.BIT240080_IsAvailable,
      dish.BIT240080_Description || '',
      dish.BIT240080_DishCategoryId,
      dish.BIT240080_DishImage,
      dish.BIT240080_SyncStatus || 'SYNCED',
    ]
  );
}

export async function updateDish(dish: BIT240080_Dish): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE BIT240080_Dish SET
      BIT240080_Name = ?,
      BIT240080_Price = ?,
      BIT240080_PreparationTime = ?,
      BIT240080_IsAvailable = ?,
      BIT240080_Description = ?,
      BIT240080_DishCategoryId = ?,
      BIT240080_DishImage = ?,
      BIT240080_SyncStatus = ?
    WHERE BIT240080_Id = ?;`,
    [
      dish.BIT240080_Name,
      dish.BIT240080_Price,
      dish.BIT240080_PreparationTime,
      dish.BIT240080_IsAvailable,
      dish.BIT240080_Description || '',
      dish.BIT240080_DishCategoryId,
      dish.BIT240080_DishImage,
      dish.BIT240080_SyncStatus || 'SYNCED',
      dish.BIT240080_Id,
    ]
  );
}

/**
 * Xóa món ăn. Nếu ở chế độ offline/cần sync MockAPI thì đánh dấu PENDING_DELETE,
 * nếu permanent = true thì xóa vĩnh viễn khỏi SQLite.
 */
export async function deleteDish(id: string, isPermanent = false): Promise<void> {
  const db = await getDatabase();
  if (isPermanent) {
    await db.runAsync('DELETE FROM BIT240080_Dish WHERE BIT240080_Id = ?;', [id]);
  } else {
    await db.runAsync(
      `UPDATE BIT240080_Dish SET BIT240080_SyncStatus = 'PENDING_DELETE' WHERE BIT240080_Id = ?;`,
      [id]
    );
  }
}

// ==========================================
// HELPER METHODS
// ==========================================

/**
 * Phân tích chuỗi JSON ảnh thành mảng đối tượng BIT240080_DishImageItem
 */
export function parseDishImages(dishImageJson: string): BIT240080_DishImageItem[] {
  try {
    const parsed = JSON.parse(dishImageJson);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.BIT240080_ImageUrl === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Lấy URL ảnh đại diện (Thumbnail) của món ăn
 * Mỗi món ăn có tối đa 01 ảnh IsThumbnail = true (Mục 4.3)
 */
export function getDishThumbnailUrl(dish: BIT240080_Dish): string {
  const images = parseDishImages(dish.BIT240080_DishImage);
  if (images.length === 0) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }
  const thumb = images.find((img) => img.BIT240080_IsThumbnail);
  return thumb ? thumb.BIT240080_ImageUrl : images[0].BIT240080_ImageUrl;
}

/**
 * Phân loại thời gian chế biến món ăn (Mục 4.3):
 * Quick <= 15 phút, Regular > 15 phút
 */
export function getSpeedType(prepTime: number): 'Quick' | 'Regular' {
  return prepTime <= 15 ? 'Quick' : 'Regular';
}

// ==========================================
// HỖ TRỢ ĐỒNG BỘ OFFLINE SYNC (Mục 5)
// ==========================================

export async function getPendingDishes(): Promise<BIT240080_Dish[]> {
  const db = await getDatabase();
  return await db.getAllAsync<BIT240080_Dish>(
    `SELECT * FROM BIT240080_Dish WHERE BIT240080_SyncStatus IN ('PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE');`
  );
}

export async function markDishSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE BIT240080_Dish SET BIT240080_SyncStatus = 'SYNCED' WHERE BIT240080_Id = ?;`,
    [id]
  );
}

export async function hardDeleteDish(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM BIT240080_Dish WHERE BIT240080_Id = ?;', [id]);
}

export async function upsertDishFromRemote(dish: BIT240080_Dish): Promise<void> {
  const db = await getDatabase();
  const existing = await getDishById(dish.BIT240080_Id);
  if (existing) {
    // Chỉ cập nhật nếu bản ghi local đang ở trạng thái SYNCED để tránh ghi đè thay đổi offline
    if (existing.BIT240080_SyncStatus === 'SYNCED') {
      await updateDish({ ...dish, BIT240080_SyncStatus: 'SYNCED' });
    }
  } else {
    await insertDish({ ...dish, BIT240080_SyncStatus: 'SYNCED' });
  }
}

export async function upsertCategoryFromRemote(category: BIT240080_DishCategory): Promise<void> {
  const db = await getDatabase();
  const existing = await getCategoryById(category.BIT240080_Id);
  if (existing) {
    await updateCategory(category);
  } else {
    await insertCategory(category);
  }
}
