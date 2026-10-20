/**
 * BIT240080_FoodManager - Offline Sync Service
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Tự động đồng bộ 2 chiều giữa SQLite (Local) và MockAPI (Remote) khi có kết nối Internet
 * Đảm bảo tính nhất quán dữ liệu và xử lý trường hợp Offline -> Online
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  getPendingDishes,
  markDishSynced,
  hardDeleteDish,
  getAllCategories,
  getAllDishes,
  upsertDishFromRemote,
  upsertCategoryFromRemote,
} from '../database/db';
import {
  fetchCategoriesApi,
  createCategoryApi,
  fetchDishesApi,
  createDishApi,
  updateDishApi,
  deleteDishApi,
} from './api';

let isSyncing = false;

/**
 * Kiểm tra trạng thái kết nối mạng hiện tại
 */
export async function isNetworkConnected(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  } catch {
    return false;
  }
}

/**
 * Tiến hành đồng bộ dữ liệu giữa Local SQLite và MockAPI
 */
export async function syncData(): Promise<{ success: boolean; syncedCount: number; message?: string }> {
  if (isSyncing) {
    return { success: false, syncedCount: 0, message: 'Sync already in progress' };
  }

  const online = await isNetworkConnected();
  if (!online) {
    return { success: false, syncedCount: 0, message: 'Device is offline' };
  }

  isSyncing = true;
  let syncedCount = 0;

  try {
    console.log('[BIT240080_Sync] Bắt đầu kiểm tra và đồng bộ...');

    // 1. Đồng bộ Categories nếu remote trống
    try {
      const remoteCategories = await fetchCategoriesApi();
      if (remoteCategories.length === 0) {
        const localCategories = await getAllCategories();
        for (const cat of localCategories) {
          try {
            await createCategoryApi(cat);
          } catch (e) {
            console.warn('[BIT240080_Sync] Lỗi tạo category trên MockAPI:', e);
          }
        }
      } else {
        // Cập nhật categories từ remote về local
        for (const cat of remoteCategories) {
          await upsertCategoryFromRemote(cat);
        }
      }
    } catch (catErr) {
      console.warn('[BIT240080_Sync] Lỗi đồng bộ Categories:', catErr);
    }

    // 2. Đẩy các bản ghi pending của Dish lên MockAPI
    const pendingDishes = await getPendingDishes();
    for (const dish of pendingDishes) {
      try {
        if (dish.BIT240080_SyncStatus === 'PENDING_CREATE') {
          await createDishApi(dish);
          await markDishSynced(dish.BIT240080_Id);
          syncedCount++;
        } else if (dish.BIT240080_SyncStatus === 'PENDING_UPDATE') {
          await updateDishApi(dish.BIT240080_Id, dish);
          await markDishSynced(dish.BIT240080_Id);
          syncedCount++;
        } else if (dish.BIT240080_SyncStatus === 'PENDING_DELETE') {
          await deleteDishApi(dish.BIT240080_Id);
          await hardDeleteDish(dish.BIT240080_Id);
          syncedCount++;
        }
      } catch (err) {
        console.warn(`[BIT240080_Sync] Lỗi sync dish ${dish.BIT240080_Id}:`, err);
      }
    }

    // 3. Nếu MockAPI rỗng, đưa toàn bộ dữ liệu mẫu hiện tại lên MockAPI
    try {
      const remoteDishes = await fetchDishesApi();
      if (remoteDishes.length === 0) {
        const localDishes = await getAllDishes();
        for (const dish of localDishes) {
          try {
            await createDishApi(dish);
            await markDishSynced(dish.BIT240080_Id);
            syncedCount++;
          } catch (e) {
            console.warn('[BIT240080_Sync] Lỗi tạo dish lên MockAPI:', e);
          }
        }
      } else {
        // Tải các dish mới từ MockAPI về local
        for (const remoteDish of remoteDishes) {
          await upsertDishFromRemote(remoteDish);
        }
      }
    } catch (fetchErr) {
      console.warn('[BIT240080_Sync] Lỗi tải dish từ MockAPI:', fetchErr);
    }

    console.log(`[BIT240080_Sync] Hoàn tất đồng bộ. Số mục xử lý: ${syncedCount}`);
    return { success: true, syncedCount };
  } catch (error: any) {
    console.error('[BIT240080_Sync] Lỗi đồng bộ tổng quát:', error);
    return { success: false, syncedCount, message: error?.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Đăng ký lắng nghe sự kiện mạng để tự động kích hoạt đồng bộ khi có kết nối trở lại
 * Phục vụ yêu cầu nâng cao 5: "Khi thiết bị có Internet trở lại: tự động đồng bộ"
 */
export function setupAutoSync(onSyncCompleted?: () => void): () => void {
  let wasOffline = false;

  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

    if (!isOnline) {
      wasOffline = true;
      console.log('[BIT240080_Sync] Thiết bị mất kết nối mạng. Chuyển sang chế độ Offline.');
    } else if (wasOffline && isOnline) {
      console.log('[BIT240080_Sync] Đã có mạng trở lại! Tự động kích hoạt đồng bộ dữ liệu...');
      wasOffline = false;
      syncData().then((res) => {
        if (res.success && onSyncCompleted) {
          onSyncCompleted();
        }
      });
    }
  });

  return unsubscribe;
}
