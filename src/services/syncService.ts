/**
 * BIT240080_FoodManager - Offline-First & Auto-Sync Service
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Tự động đồng bộ 2 chiều giữa SQLite (Local) và MockAPI (Remote) khi có kết nối Internet
 * Đảm bảo tính nhất quán dữ liệu, chống phát sinh bản ghi trùng và xử lý an toàn mọi lỗi mạng.
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
  updateCategoryApi,
  fetchDishesApi,
  createDishApi,
  updateDishApi,
  deleteDishApi,
} from './api';
import { BIT240080_Dish, BIT240080_DishCategory } from '../types';

export type SyncState = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';

export interface SyncNotification {
  state: SyncState;
  message: string;
  syncedCount?: number;
  timestamp: number;
}

type SyncListener = (notification: SyncNotification) => void;

let isSyncing = false;
const syncListeners: Set<SyncListener> = new Set();

/**
 * Đăng ký lắng nghe trạng thái tiến trình đồng bộ (để hiển thị Toast/Banner trên UI)
 */
export function addSyncListener(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

function notifySyncListeners(notification: SyncNotification) {
  syncListeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (e) {
      console.warn('[BIT240080_Sync] Lỗi trong sync listener:', e);
    }
  });
}

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
 * Tiến hành đồng bộ dữ liệu giữa Local SQLite và MockAPI với thuật toán chống trùng lặp (Mục 5)
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

  notifySyncListeners({
    state: 'SYNCING',
    message: 'Auto-syncing with MockAPI...',
    timestamp: Date.now(),
  });

  try {
    console.log('[BIT240080_Sync] Bắt đầu quá trình đồng bộ 2 chiều...');

    // 1. ĐỒNG BỘ CATEGORIES
    let remoteCategories: BIT240080_DishCategory[] = [];
    try {
      remoteCategories = await fetchCategoriesApi();
    } catch (catFetchErr) {
      console.warn('[BIT240080_Sync] Lỗi tải categories từ MockAPI:', catFetchErr);
    }

    const localCategories = await getAllCategories();

    // 1.1. Đẩy các category local chưa có trên MockAPI lên remote
    for (const localCat of localCategories) {
      const existsOnRemote = remoteCategories.find(
        (rc) =>
          rc.BIT240080_Id === localCat.BIT240080_Id ||
          rc.BIT240080_Name.trim().toLowerCase() === localCat.BIT240080_Name.trim().toLowerCase()
      );

      if (!existsOnRemote) {
        try {
          await createCategoryApi(localCat);
          syncedCount++;
        } catch (catCreateErr) {
          console.warn('[BIT240080_Sync] Lỗi tạo category trên MockAPI:', catCreateErr);
        }
      }
    }

    // 1.2. Kéo các category mới từ remote về local SQLite
    for (const remCat of remoteCategories) {
      try {
        await upsertCategoryFromRemote(remCat);
      } catch (upsertCatErr) {
        console.warn('[BIT240080_Sync] Lỗi lưu category về local:', upsertCatErr);
      }
    }

    // 2. LẤY DANH SÁCH DISH HIỆN TẠI TRÊN MOCKAPI ĐỂ CHỐNG TRÙNG LẶP
    let remoteDishes: BIT240080_Dish[] = [];
    try {
      remoteDishes = await fetchDishesApi();
    } catch (dishFetchErr) {
      console.warn('[BIT240080_Sync] Lỗi tải dishes từ MockAPI:', dishFetchErr);
    }

    // 3. XỬ LÝ CÁC THAY ĐỔI OFFLINE ĐANG PENDING TRONG SQLITE
    const pendingDishes = await getPendingDishes();
    for (const dish of pendingDishes) {
      try {
        if (dish.BIT240080_SyncStatus === 'PENDING_CREATE') {
          // Kiểm tra xem đã tồn tại trên MockAPI chưa (tránh tạo trùng lặp khi mạng chập chờn)
          const existingRemote = remoteDishes.find(
            (rd) =>
              rd.BIT240080_Id === dish.BIT240080_Id ||
              (rd.BIT240080_Name.trim().toLowerCase() === dish.BIT240080_Name.trim().toLowerCase() &&
                rd.BIT240080_DishCategoryId === dish.BIT240080_DishCategoryId)
          );

          if (existingRemote) {
            // Đã có -> Cập nhật (PUT)
            await updateDishApi(existingRemote.BIT240080_Id || (existingRemote as any).id, dish);
          } else {
            // Chưa có -> Tạo mới (POST)
            await createDishApi(dish);
          }
          await markDishSynced(dish.BIT240080_Id);
          syncedCount++;
        } else if (dish.BIT240080_SyncStatus === 'PENDING_UPDATE') {
          // Cập nhật lên MockAPI
          await updateDishApi(dish.BIT240080_Id, dish);
          await markDishSynced(dish.BIT240080_Id);
          syncedCount++;
        } else if (dish.BIT240080_SyncStatus === 'PENDING_DELETE') {
          // Xóa khỏi MockAPI
          await deleteDishApi(dish.BIT240080_Id);
          await hardDeleteDish(dish.BIT240080_Id);
          syncedCount++;
        }
      } catch (itemSyncErr) {
        console.warn(`[BIT240080_Sync] Lỗi sync dish ${dish.BIT240080_Id} (sẽ thử lại sau):`, itemSyncErr);
      }
    }

    // 4. NẾU MOCKAPI ĐANG TRỐNG, TỰ ĐỘNG ĐẨY TOÀN BỘ LOCAL DISHES LÊN MOCKAPI
    if (remoteDishes.length === 0) {
      const allLocalDishes = await getAllDishes();
      for (const d of allLocalDishes) {
        try {
          await createDishApi(d);
          await markDishSynced(d.BIT240080_Id);
          syncedCount++;
        } catch (seedPushErr) {
          console.warn('[BIT240080_Sync] Lỗi nạp dish ban đầu lên MockAPI:', seedPushErr);
        }
      }
    } else {
      // 5. KÉO CÁC DISH MỚI TỪ MOCKAPI VỀ LOCAL (KHÔNG GHI ĐÈ BẢN GHI ĐANG CHỜ OFFLINE)
      for (const remDish of remoteDishes) {
        try {
          await upsertDishFromRemote(remDish);
        } catch (upsertDishErr) {
          console.warn('[BIT240080_Sync] Lỗi nạp dish từ remote về local:', upsertDishErr);
        }
      }
    }

    console.log(`[BIT240080_Sync] Hoàn tất đồng bộ thành công! Số bản ghi xử lý: ${syncedCount}`);

    notifySyncListeners({
      state: 'SUCCESS',
      message: syncedCount > 0 ? `Synced ${syncedCount} item(s) with MockAPI` : 'Data is up-to-date',
      syncedCount,
      timestamp: Date.now(),
    });

    return { success: true, syncedCount };
  } catch (error: any) {
    console.error('[BIT240080_Sync] Lỗi đồng bộ tổng thể:', error);

    notifySyncListeners({
      state: 'ERROR',
      message: error?.message || 'Sync failed, will retry when network restores',
      timestamp: Date.now(),
    });

    return { success: false, syncedCount, message: error?.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Đăng ký lắng nghe sự kiện mạng để TỰ ĐỘNG KÍCH HOẠT ĐỒNG BỘ khi có mạng trở lại (Mục 5)
 * Không đòi hỏi người dùng phải bấm nút!
 */
export function setupAutoSync(onSyncCompleted?: () => void): () => void {
  let wasOffline = false;

  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

    if (!isOnline) {
      wasOffline = true;
      console.log('[BIT240080_Sync] 📡 Thiết bị Offline (mất mạng). Mọi thay đổi sẽ lưu vào SQLite local.');
    } else if (wasOffline && isOnline) {
      console.log('[BIT240080_Sync] 🌐 Đã có mạng trở lại! Tự động kích hoạt đồng bộ 2 chiều lên MockAPI...');
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
