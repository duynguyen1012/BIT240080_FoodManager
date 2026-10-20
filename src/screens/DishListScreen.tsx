/**
 * BIT240080_FoodManager - Màn hình danh sách món ăn (DishListScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Đảm bảo 100% yêu cầu Mục 4.1, 4.2, 4.3, 4.4, 4.5:
 * - Hiển thị ảnh đại diện (kèm fallback placeholder an toàn khi URL lỗi)
 * - Tự động phân loại tốc độ: Quick (<= 15p) / Regular (> 15p)
 * - Bộ lọc đồng thời: Tên (không dấu/có dấu), Loại món, Trạng thái bán (Tất cả / Đang bán), Khoảng giá
 * - Xử lý lỗi khoảng giá không hợp lệ (Min > Max, số âm) hiển thị cảnh báo trực quan
 * - Sắp xếp: Giá tăng/giảm, Thời gian chế biến tăng
 * - Giữ nguyên trạng thái bộ lọc và sắp xếp khi quay lại màn hình
 * - Xóa nhanh kèm xác nhận Alert đa ngôn ngữ
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import {
  BIT240080_Dish,
  BIT240080_DishCategory,
  DishFilterParams,
  RootStackParamList,
} from '../types';
import {
  getAllDishes,
  getAllCategories,
  deleteDish,
  getDishThumbnailUrl,
  getSpeedType,
  DEFAULT_PLACEHOLDER_IMAGE,
} from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { syncData, setupAutoSync } from '../services/syncService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DishList'>;

export default function DishListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { language, toggleLanguage, t } = useLanguage();

  const [dishes, setDishes] = useState<BIT240080_Dish[]>([]);
  const [categories, setCategories] = useState<BIT240080_DishCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Lưu trữ ảnh bị lỗi để fallback sang placeholder
  const [failedImageMap, setFailedImageMap] = useState<Record<string, boolean>>({});

  // Bộ lọc và tìm kiếm (Mục 4.2: ĐƯỢC GIỮ NGUYÊN KHI CHUYỂN MÀN HÌNH)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAvailableOnly, setIsAvailableOnly] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [priceRangeError, setPriceRangeError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'prep_asc' | undefined>(
    undefined
  );

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Kiểm tra và validate khoảng giá (Mục 4.4: Xử lý hợp lý khi khoảng giá không hợp lệ)
  const validatePriceRange = (minStr: string, maxStr: string): boolean => {
    const minVal = minStr.trim() === '' ? undefined : parseFloat(minStr);
    const maxVal = maxStr.trim() === '' ? undefined : parseFloat(maxStr);

    if (minVal !== undefined && (isNaN(minVal) || minVal < 0)) {
      setPriceRangeError(t('validation_price_negative'));
      return false;
    }

    if (maxVal !== undefined && (isNaN(maxVal) || maxVal < 0)) {
      setPriceRangeError(t('validation_price_negative'));
      return false;
    }

    if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
      setPriceRangeError(t('validation_price_range_invalid'));
      return false;
    }

    setPriceRangeError(null);
    return true;
  };

  // Tải dữ liệu từ SQLite áp dụng đầy đủ bộ lọc và sắp xếp hiện tại
  const loadData = useCallback(async () => {
    try {
      const minVal = minPrice.trim() === '' ? undefined : parseFloat(minPrice);
      const maxVal = maxPrice.trim() === '' ? undefined : parseFloat(maxPrice);

      // Nếu khoảng giá có lỗi (min > max), không áp dụng khoảng giá sai nhưng không crash danh sách
      const isPriceValid =
        minVal === undefined || maxVal === undefined || minVal <= maxVal;

      const filter: DishFilterParams = {
        searchQuery,
        categoryId: selectedCategory || undefined,
        isAvailableOnly,
        minPrice: isPriceValid && minVal !== undefined && !isNaN(minVal) && minVal >= 0 ? minVal : undefined,
        maxPrice: isPriceValid && maxVal !== undefined && !isNaN(maxVal) && maxVal >= 0 ? maxVal : undefined,
        sortBy,
      };

      const [dishesData, categoriesData] = await Promise.all([
        getAllDishes(filter),
        getAllCategories(),
      ]);

      setDishes(dishesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('[BIT240080_DishList] Lỗi tải danh sách món:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, isAvailableOnly, minPrice, maxPrice, sortBy]);

  // Mục 4.2: Giữ các điều kiện đã chọn khi quay về màn hình danh sách
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Đăng ký tự động đồng bộ khi có kết nối mạng (Yêu cầu nâng cao 5)
  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    const unsubSync = setupAutoSync(() => {
      loadData();
    });

    return () => {
      unsubNet();
      unsubSync();
    };
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isOnline) {
      await syncData();
    }
    await loadData();
    setRefreshing(false);
  };

  // Xóa món ăn với xác nhận Alert (Mục 4.1)
  const handleDeleteDish = (dish: BIT240080_Dish) => {
    Alert.alert(
      t('alert_delete_title'),
      t('alert_delete_dish_confirm', { name: dish.BIT240080_Name }),
      [
        { text: t('btn_cancel'), style: 'cancel' },
        {
          text: t('btn_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDish(dish.BIT240080_Id);
              Alert.alert(t('alert_success_delete'));
              if (isOnline) {
                syncData();
              }
              loadData();
            } catch (error) {
              Alert.alert(t('alert_error_generic'));
            }
          },
        },
      ]
    );
  };

  const getCategoryName = (categoryId: string): string => {
    const cat = categories.find((c) => c.BIT240080_Id === categoryId);
    return cat ? cat.BIT240080_Name : categoryId;
  };

  const handleApplyFilter = () => {
    const isValid = validatePriceRange(minPrice, maxPrice);
    if (isValid) {
      setShowFilterModal(false);
      loadData();
    } else {
      Alert.alert(t('alert_error_generic'), t('validation_price_range_invalid'));
    }
  };

  const handleResetFilter = () => {
    setSelectedCategory('');
    setIsAvailableOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setPriceRangeError(null);
    setSortBy(undefined);
  };

  const hasActiveFilter = Boolean(
    selectedCategory || isAvailableOnly || sortBy || minPrice || maxPrice || priceRangeError
  );

  const renderDishItem = ({ item }: { item: BIT240080_Dish }) => {
    const rawThumbUrl = getDishThumbnailUrl(item);
    // Sử dụng placeholder nếu ảnh bị lỗi khi tải (onError)
    const thumbUrl = failedImageMap[item.BIT240080_Id]
      ? DEFAULT_PLACEHOLDER_IMAGE
      : rawThumbUrl;

    const speed = getSpeedType(item.BIT240080_PreparationTime);
    const isSelling = item.BIT240080_IsAvailable === 1;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DishDetail', { dishId: item.BIT240080_Id })}
      >
        <Image
          source={{ uri: thumbUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => {
            setFailedImageMap((prev) => ({ ...prev, [item.BIT240080_Id]: true }));
          }}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.dishName} numberOfLines={1}>
              {item.BIT240080_Name}
            </Text>
            {item.BIT240080_SyncStatus && item.BIT240080_SyncStatus !== 'SYNCED' ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{t('sync_pending_update')}</Text>
              </View>
            ) : (
              <View style={styles.syncedBadge}>
                <Text style={styles.syncedText}>✓ {t('sync_synced')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.categoryText} numberOfLines={1}>
            {getCategoryName(item.BIT240080_DishCategoryId)}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{item.BIT240080_Price.toLocaleString()} đ</Text>

            {/* Phân loại tốc độ chế biến tự động (Mục 4.3): Quick <= 15, Regular > 15 */}
            <View
              style={[
                styles.speedBadge,
                speed === 'Quick' ? styles.speedQuickBadge : styles.speedRegularBadge,
              ]}
            >
              <Text
                style={[
                  styles.speedText,
                  speed === 'Quick' ? styles.speedQuickText : styles.speedRegularText,
                ]}
              >
                {speed === 'Quick' ? t('speed_quick_tag') : t('speed_regular_tag')} (
                {item.BIT240080_PreparationTime} {t('time_min')})
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            {/* Trạng thái bán (Mục 4.1 & 4.4) */}
            <View
              style={[
                styles.statusBadge,
                isSelling ? styles.statusAvailable : styles.statusUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isSelling ? styles.statusAvailableText : styles.statusUnavailableText,
                ]}
              >
                {isSelling ? t('status_available') : t('status_unavailable')}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionBtnEdit}
                onPress={() => navigation.navigate('DishForm', { dishId: item.BIT240080_Id })}
              >
                <Text style={styles.actionBtnEditText}>{t('btn_edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnDelete}
                onPress={() => handleDeleteDish(item)}
              >
                <Text style={styles.actionBtnDeleteText}>{t('btn_delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner MSSV & Mạng & Chuyển đổi ngôn ngữ */}
      <View style={styles.topInfoBar}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentMSSV}>BIT240080 - Nguyễn Đức Duy</Text>
          <View style={styles.networkBadge}>
            <View
              style={[
                styles.networkDot,
                { backgroundColor: isOnline ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.networkText}>
              {isOnline ? t('network_online') : t('network_offline')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.langToggleBtn}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.langToggleText}>
            {language === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm và nút mở bộ lọc */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_placeholder')}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={[styles.filterTriggerBtn, hasActiveFilter && styles.filterTriggerActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text
            style={[
              styles.filterTriggerText,
              hasActiveFilter && styles.filterTriggerTextActive,
            ]}
          >
            ⚙ {t('btn_filter')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cảnh báo lỗi khoảng giá nếu người dùng nhập không hợp lệ */}
      {Boolean(priceRangeError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {priceRangeError}</Text>
        </View>
      )}

      {/* Danh mục cuộn ngang (Quick filter theo loại món) */}
      <View style={styles.categoryScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ BIT240080_Id: '', BIT240080_Name: t('filter_all_categories') }, ...categories]}
          keyExtractor={(item) => item.BIT240080_Id}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.BIT240080_Id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.BIT240080_Id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item.BIT240080_Name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách món ăn */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.BIT240080_Id}
          renderItem={renderDishItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('empty_dishes')}</Text>
            </View>
          }
        />
      )}

      {/* Nút thêm mới Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DishForm', {})}
      >
        <Text style={styles.fabText}>+ {t('btn_add')}</Text>
      </TouchableOpacity>

      {/* Modal Lọc và Sắp xếp đa điều kiện (Mục 4.2) */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {t('btn_filter')} & {t('btn_sort')}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Lọc theo trạng thái bán (Mục 4.2 & 4.4) */}
            <Text style={styles.modalLabel}>{t('filter_status_label')}</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  !isAvailableOnly && styles.statusToggleBtnActive,
                ]}
                onPress={() => setIsAvailableOnly(false)}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    !isAvailableOnly && styles.statusToggleTextActive,
                  ]}
                >
                  {t('filter_status_all')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  isAvailableOnly && styles.statusToggleBtnActive,
                ]}
                onPress={() => setIsAvailableOnly(true)}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    isAvailableOnly && styles.statusToggleTextActive,
                  ]}
                >
                  {t('filter_status_available_only')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lọc theo khoảng giá (Min - Max) */}
            <Text style={[styles.modalLabel, { marginTop: 14 }]}>
              {t('label_price')}
            </Text>
            <View style={styles.priceInputRow}>
              <TextInput
                style={[styles.priceInput, priceRangeError ? styles.inputError : null]}
                placeholder={t('placeholder_min_price')}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={(text) => {
                  setMinPrice(text);
                  validatePriceRange(text, maxPrice);
                }}
              />
              <Text style={{ marginHorizontal: 8, color: '#6B7280' }}>-</Text>
              <TextInput
                style={[styles.priceInput, priceRangeError ? styles.inputError : null]}
                placeholder={t('placeholder_max_price')}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={(text) => {
                  setMaxPrice(text);
                  validatePriceRange(minPrice, text);
                }}
              />
            </View>

            {Boolean(priceRangeError) && (
              <Text style={styles.fieldErrorText}>{priceRangeError}</Text>
            )}

            {/* Sắp xếp (Mục 4.2) */}
            <Text style={[styles.modalLabel, { marginTop: 14 }]}>
              {t('filter_sort_by')}
            </Text>
            <View style={styles.sortButtonsRow}>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === undefined && styles.sortOptionActive]}
                onPress={() => setSortBy(undefined)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === undefined && styles.sortOptionTextActive,
                  ]}
                >
                  {t('sort_default')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'price_asc' && styles.sortOptionActive]}
                onPress={() => setSortBy('price_asc')}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === 'price_asc' && styles.sortOptionTextActive,
                  ]}
                >
                  {t('sort_price_asc')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'price_desc' && styles.sortOptionActive]}
                onPress={() => setSortBy('price_desc')}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === 'price_desc' && styles.sortOptionTextActive,
                  ]}
                >
                  {t('sort_price_desc')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'prep_asc' && styles.sortOptionActive]}
                onPress={() => setSortBy('prep_asc')}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === 'prep_asc' && styles.sortOptionTextActive,
                  ]}
                >
                  {t('sort_prep_asc')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nút Áp dụng & Đặt lại */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalResetBtn} onPress={handleResetFilter}>
                <Text style={styles.modalResetText}>{t('btn_reset')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalApplyBtn} onPress={handleApplyFilter}>
                <Text style={styles.modalApplyText}>{t('btn_apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  studentInfo: {
    flex: 1,
  },
  studentMSSV: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  langToggleBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langToggleText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 12,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTriggerBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterTriggerActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  filterTriggerText: {
    fontWeight: '600',
    color: '#334155',
    fontSize: 13,
  },
  filterTriggerTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 14,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryScrollContainer: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 90,
    paddingTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  thumbnail: {
    width: 110,
    height: 125,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '600',
  },
  syncedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncedText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedQuickBadge: {
    backgroundColor: '#DCFCE7',
  },
  speedRegularBadge: {
    backgroundColor: '#E0F2FE',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  speedQuickText: {
    color: '#15803D',
  },
  speedRegularText: {
    color: '#0369A1',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: '#F0FDF4',
  },
  statusUnavailable: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusAvailableText: {
    color: '#16A34A',
  },
  statusUnavailableText: {
    color: '#DC2626',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnEdit: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnEditText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtnDelete: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionBtnDeleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statusToggleBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  statusToggleText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusToggleTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  sortButtonsRow: {
    gap: 6,
  },
  sortOption: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  sortOptionText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalResetBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalResetText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalApplyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
