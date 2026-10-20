/**
 * BIT240080_FoodManager - REST API Service (MockAPI)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Base URL: https://6ad73e6095e98f36aef21c1e.mockapi.io
 * Các Endpoint bắt buộc có tiền tố: /BIT240080_DishCategory và /BIT240080_Dish
 */

import { BIT240080_DishCategory, BIT240080_Dish } from '../types';

export const MOCK_API_BASE_URL = 'https://6ad73e6095e98f36aef21c1e.mockapi.io';

const TIMEOUT_MS = 10000;

/**
 * Hàm gửi HTTP fetch có hỗ trợ Timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ==========================================
// REST API CHO BIT240080_DishCategory
// ==========================================

export async function fetchCategoriesApi(): Promise<BIT240080_DishCategory[]> {
  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_DishCategory`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function createCategoryApi(
  category: BIT240080_DishCategory
): Promise<BIT240080_DishCategory> {
  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_DishCategory`, {
    method: 'POST',
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error(`Failed to create category: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function updateCategoryApi(
  idOrCatId: string,
  category: Partial<BIT240080_DishCategory>
): Promise<BIT240080_DishCategory> {
  let targetId = idOrCatId;
  // Nếu ID là dạng chuỗi UUID hoặc cat-xxx, tìm MockAPI ID tương ứng
  if (!/^\d+$/.test(idOrCatId)) {
    try {
      const searchRes = await fetchWithTimeout(
        `${MOCK_API_BASE_URL}/BIT240080_DishCategory?BIT240080_Id=${encodeURIComponent(idOrCatId)}`
      );
      if (searchRes.ok) {
        const items = await searchRes.json();
        if (Array.isArray(items) && items.length > 0) {
          targetId = items[0].id;
        }
      }
    } catch (e) {
      console.warn('[BIT240080_API] Tra cứu id category thất bại:', e);
    }
  }

  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_DishCategory/${targetId}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    throw new Error(`Failed to update category: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function deleteCategoryApi(idOrCatId: string): Promise<void> {
  let targetId = idOrCatId;
  if (!/^\d+$/.test(idOrCatId)) {
    try {
      const searchRes = await fetchWithTimeout(
        `${MOCK_API_BASE_URL}/BIT240080_DishCategory?BIT240080_Id=${encodeURIComponent(idOrCatId)}`
      );
      if (searchRes.ok) {
        const items = await searchRes.json();
        if (Array.isArray(items) && items.length > 0) {
          targetId = items[0].id;
        }
      }
    } catch (e) {
      console.warn('[BIT240080_API] Tra cứu id category để xóa thất bại:', e);
    }
  }

  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_DishCategory/${targetId}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete category: HTTP ${response.status}`);
  }
}

// ==========================================
// REST API CHO BIT240080_Dish
// ==========================================

export async function fetchDishesApi(): Promise<BIT240080_Dish[]> {
  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_Dish`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dishes: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function fetchDishByIdApi(id: string): Promise<BIT240080_Dish> {
  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_Dish/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dish by id: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function createDishApi(dish: BIT240080_Dish): Promise<BIT240080_Dish> {
  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_Dish`, {
    method: 'POST',
    body: JSON.stringify(dish),
  });
  if (!response.ok) {
    throw new Error(`Failed to create dish: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function updateDishApi(
  idOrDishId: string,
  dish: Partial<BIT240080_Dish>
): Promise<BIT240080_Dish> {
  let targetId = idOrDishId;
  if (!/^\d+$/.test(idOrDishId)) {
    try {
      const searchRes = await fetchWithTimeout(
        `${MOCK_API_BASE_URL}/BIT240080_Dish?BIT240080_Id=${encodeURIComponent(idOrDishId)}`
      );
      if (searchRes.ok) {
        const items = await searchRes.json();
        if (Array.isArray(items) && items.length > 0) {
          targetId = items[0].id;
        }
      }
    } catch (e) {
      console.warn('[BIT240080_API] Tra cứu id dish thất bại:', e);
    }
  }

  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_Dish/${targetId}`, {
    method: 'PUT',
    body: JSON.stringify(dish),
  });
  if (!response.ok) {
    throw new Error(`Failed to update dish: HTTP ${response.status}`);
  }
  return await response.json();
}

export async function deleteDishApi(idOrDishId: string): Promise<void> {
  let targetId = idOrDishId;
  if (!/^\d+$/.test(idOrDishId)) {
    try {
      const searchRes = await fetchWithTimeout(
        `${MOCK_API_BASE_URL}/BIT240080_Dish?BIT240080_Id=${encodeURIComponent(idOrDishId)}`
      );
      if (searchRes.ok) {
        const items = await searchRes.json();
        if (Array.isArray(items) && items.length > 0) {
          targetId = items[0].id;
        }
      }
    } catch (e) {
      console.warn('[BIT240080_API] Tra cứu id dish để xóa thất bại:', e);
    }
  }

  const response = await fetchWithTimeout(`${MOCK_API_BASE_URL}/BIT240080_Dish/${targetId}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete dish: HTTP ${response.status}`);
  }
}
