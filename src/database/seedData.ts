/**
 * BIT240080_FoodManager - Seed Data
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Dữ liệu mẫu chuẩn bị sẵn tối thiểu 03 loại món ăn và 05 món ăn chi tiết
 * Toàn bộ thuộc tính tuân thủ tiền tố BIT240080_
 */

import { BIT240080_DishCategory, BIT240080_Dish } from '../types';

export const SEED_CATEGORIES: BIT240080_DishCategory[] = [
  {
    BIT240080_Id: 'cat-1',
    BIT240080_Name: 'Món chính / Main Dishes',
    BIT240080_Description: 'Các món ăn chính thơm ngon, đậm đà hương vị truyền thống',
  },
  {
    BIT240080_Id: 'cat-2',
    BIT240080_Name: 'Tráng miệng / Desserts',
    BIT240080_Description: 'Món ngọt và tráng miệng thanh mát giải nhiệt sau bữa ăn',
  },
  {
    BIT240080_Id: 'cat-3',
    BIT240080_Name: 'Đồ uống / Beverages',
    BIT240080_Description: 'Thức uống giải khát mát lạnh và cà phê đậm đà',
  },
];

export const SEED_DISHES: BIT240080_Dish[] = [
  {
    BIT240080_Id: 'dish-1',
    BIT240080_Name: 'Phở Bò Tái Nạm',
    BIT240080_Price: 55000,
    BIT240080_PreparationTime: 12, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Phở bò truyền thống với nước dùng hầm xương bò 24h, thịt nạm mềm ngọt kèm hành ngò thơm nức.',
    BIT240080_DishCategoryId: 'cat-1',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-2',
    BIT240080_Name: 'Bún Chả Hà Nội',
    BIT240080_Price: 50000,
    BIT240080_PreparationTime: 20, // Regular (> 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Chả thịt nướng than hoa thơm lừng ăn kèm bún tươi, nước mắm pha chua ngọt và rau sống tươi xanh.',
    BIT240080_DishCategoryId: 'cat-1',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-3',
    BIT240080_Name: 'Cơm Tấm Sườn Bì Chả',
    BIT240080_Price: 65000,
    BIT240080_PreparationTime: 15, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Cơm tấm hạt dẻo thơm, sườn nướng mỡ hành đượm vị mật ong, chả trứng hấp thơm ngậy và bì dai giòn.',
    BIT240080_DishCategoryId: 'cat-1',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-4',
    BIT240080_Name: 'Chè Khúc Bạch Thanh Mát',
    BIT240080_Price: 30000,
    BIT240080_PreparationTime: 10, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Từng viên thạch khúc bạch sữa mềm mịn, vị nhãn ngọt thanh và hạnh nhân lát rang giòn rụm.',
    BIT240080_DishCategoryId: 'cat-2',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-5',
    BIT240080_Name: 'Bánh Flan Caramen Cốt Dừa',
    BIT240080_Price: 20000,
    BIT240080_PreparationTime: 5, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 0, // Stopped (Ngừng bán - kiểm tra bộ lọc trạng thái)
    BIT240080_Description: 'Bánh flan caramen mềm tan béo ngậy vị trứng gà tươi và nước cốt dừa, sốt caramen thơm dịu.',
    BIT240080_DishCategoryId: 'cat-2',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-6',
    BIT240080_Name: 'Trà Đào Cam Sả Hạt Chia',
    BIT240080_Price: 38000,
    BIT240080_PreparationTime: 8, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Trà thảo mộc thơm nồng sả tươi kết hợp vị cam vàng chua ngọt mát lạnh và miếng đào vàng giòn.',
    BIT240080_DishCategoryId: 'cat-3',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
  {
    BIT240080_Id: 'dish-7',
    BIT240080_Name: 'Cà Phê Muối Xứ Huế',
    BIT240080_Price: 32000,
    BIT240080_PreparationTime: 6, // Quick (<= 15 mins)
    BIT240080_IsAvailable: 1, // Available
    BIT240080_Description: 'Cà phê Robusta phin truyền thống hòa quyện cùng lớp kem béo mặn đặc trưng xứ Huế.',
    BIT240080_DishCategoryId: 'cat-3',
    BIT240080_DishImage: JSON.stringify([
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: true,
      },
      {
        BIT240080_ImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
        BIT240080_IsThumbnail: false,
      },
    ]),
    BIT240080_SyncStatus: 'SYNCED',
  },
];
