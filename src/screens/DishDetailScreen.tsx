/**
 * BIT240080_FoodManager - Màn hình chi tiết món ăn (DishDetailScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Đảm bảo 100% yêu cầu Mục 4.1, 4.3, 4.4, 4.5:
 * - Xử lý trường hợp Id không tồn tại: hiển thị màn hình thông báo lỗi rõ ràng và nút Back
 * - Quản lý nhiều ảnh: hiển thị danh sách ảnh, thêm ảnh mới, xóa ảnh, đổi ảnh Thumbnail
 * - Đảm bảo quy tắc tối đa 01 ảnh IsThumbnail = true
 * - Hiển thị nhãn Quick/Regular, trạng thái bán, thông tin chi tiết
 * - Nút Sửa và Xóa kèm Alert xác nhận
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BIT240080_Dish,
  BIT240080_DishCategory,
  BIT240080_DishImageItem,
  RootStackParamList,
} from '../types';
import {
  getDishById,
  getCategoryById,
  updateDish,
  deleteDish,
  parseDishImages,
  getSpeedType,
  DEFAULT_PLACEHOLDER_IMAGE,
} from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { syncData, isNetworkConnected } from '../services/syncService';

type DetailRouteProp = RouteProp<RootStackParamList, 'DishDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const { dishId } = route.params;
  const [dish, setDish] = useState<BIT240080_Dish | null>(null);
  const [category, setCategory] = useState<BIT240080_DishCategory | null>(null);
  const [images, setImages] = useState<BIT240080_DishImageItem[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Modal thêm ảnh nhanh
  const [showAddImageModal, setShowAddImageModal] = useState<boolean>(false);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  const loadDishDetail = useCallback(async () => {
    try {
      setLoading(true);
      // Mục 4.4: Xử lý an toàn khi Id không tồn tại
      const dishData = await getDishById(dishId);
      if (!dishData) {
        setNotFound(true);
        setDish(null);
        return;
      }

      setNotFound(false);
      setDish(dishData);
      const parsedImgs = parseDishImages(dishData.BIT240080_DishImage);
      setImages(parsedImgs);

      // Đặt index ban đầu vào ảnh thumbnail nếu có
      const thumbIdx = parsedImgs.findIndex((img) => img.BIT240080_IsThumbnail);
      setActiveImageIndex(thumbIdx >= 0 ? thumbIdx : 0);

      const catData = await getCategoryById(dishData.BIT240080_DishCategoryId);
      setCategory(catData);
    } catch (error) {
      console.error('[BIT240080_DishDetail] Lỗi tải dữ liệu chi tiết:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [dishId]);

  useFocusEffect(
    useCallback(() => {
      loadDishDetail();
    }, [loadDishDetail])
  );

  // Đổi ảnh đại diện (Thumbnail) (Mục 4.3: mỗi món có tối đa 01 ảnh IsThumbnail = true)
  const handleSetThumbnail = async (targetIndex: number) => {
    if (!dish) return;

    const updatedImages = images.map((img, idx) => ({
      ...img,
      BIT240080_IsThumbnail: idx === targetIndex,
    }));

    const updatedDish: BIT240080_Dish = {
      ...dish,
      BIT240080_DishImage: JSON.stringify(updatedImages),
      BIT240080_SyncStatus: 'PENDING_UPDATE',
    };

    try {
      await updateDish(updatedDish);
      setImages(updatedImages);
      setActiveImageIndex(targetIndex);
      setDish(updatedDish);
      Alert.alert(t('alert_success_update'), t('btn_set_thumbnail'));

      if (await isNetworkConnected()) {
        syncData();
      }
    } catch (error) {
      Alert.alert(t('alert_error_generic'));
    }
  };

  // Thêm ảnh nhanh ngay tại màn hình Chi tiết (Mục 4.3)
  const handleQuickAddImage = async () => {
    if (!dish) return;

    if (!newImageUrl.trim()) {
      Alert.alert(t('validation_image_required'));
      return;
    }

    if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
      Alert.alert(t('validation_image_url_invalid'));
      return;
    }

    const hasThumbnail = images.some((img) => img.BIT240080_IsThumbnail);
    const updatedImages: BIT240080_DishImageItem[] = [
      ...images,
      {
        BIT240080_ImageUrl: newImageUrl.trim(),
        BIT240080_IsThumbnail: !hasThumbnail,
      },
    ];

    const updatedDish: BIT240080_Dish = {
      ...dish,
      BIT240080_DishImage: JSON.stringify(updatedImages),
      BIT240080_SyncStatus: 'PENDING_UPDATE',
    };

    try {
      await updateDish(updatedDish);
      setImages(updatedImages);
      setDish(updatedDish);
      setActiveImageIndex(updatedImages.length - 1);
      setNewImageUrl('');
      setShowAddImageModal(false);
      Alert.alert(t('alert_success_update'));

      if (await isNetworkConnected()) {
        syncData();
      }
    } catch (error) {
      Alert.alert(t('alert_error_generic'));
    }
  };

  // Xóa ảnh ngay tại màn hình Chi tiết
  const handleDeleteImage = (indexToDelete: number) => {
    if (!dish) return;

    if (images.length <= 1) {
      Alert.alert(t('alert_at_least_one_image'));
      return;
    }

    Alert.alert(t('alert_delete_title'), t('alert_delete_image_confirm'), [
      { text: t('btn_cancel'), style: 'cancel' },
      {
        text: t('btn_delete'),
        style: 'destructive',
        onPress: async () => {
          const wasThumbnail = images[indexToDelete].BIT240080_IsThumbnail;
          const remaining = images.filter((_, idx) => idx !== indexToDelete);

          if (wasThumbnail && remaining.length > 0) {
            remaining[0].BIT240080_IsThumbnail = true;
          }

          const updatedDish: BIT240080_Dish = {
            ...dish,
            BIT240080_DishImage: JSON.stringify(remaining),
            BIT240080_SyncStatus: 'PENDING_UPDATE',
          };

          try {
            await updateDish(updatedDish);
            setImages(remaining);
            setDish(updatedDish);
            setActiveImageIndex(0);
            Alert.alert(t('alert_success_delete'));

            if (await isNetworkConnected()) {
              syncData();
            }
          } catch (error) {
            Alert.alert(t('alert_error_generic'));
          }
        },
      },
    ]);
  };

  const handleDeleteDish = () => {
    if (!dish) return;

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
              if (await isNetworkConnected()) {
                syncData();
              }
              Alert.alert(t('alert_success_delete'));
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('alert_error_generic'));
            }
          },
        },
      ]
    );
  };

  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 2. Mục 4.4: Xử lý an toàn khi ID không tồn tại
  if (notFound || !dish) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundIcon}>⚠️</Text>
        <Text style={styles.notFoundTitle}>{t('dish_not_found')}</Text>
        <Text style={styles.notFoundSubtitle}>ID: {dishId}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← {t('btn_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const speed = getSpeedType(dish.BIT240080_PreparationTime);
  const isSelling = dish.BIT240080_IsAvailable === 1;
  const currentImage = images[activeImageIndex];
  const displayImageUri = currentImage?.BIT240080_ImageUrl || DEFAULT_PLACEHOLDER_IMAGE;

  return (
    <ScrollView style={styles.container}>
      {/* Khung ảnh chính lớn */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: displayImageUri }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {currentImage?.BIT240080_IsThumbnail && (
          <View style={styles.thumbnailLabel}>
            <Text style={styles.thumbnailLabelText}>★ {t('label_thumbnail')}</Text>
          </View>
        )}

        {/* Nút xóa ảnh đang xem */}
        {images.length > 1 && (
          <TouchableOpacity
            style={styles.deletePhotoBtn}
            onPress={() => handleDeleteImage(activeImageIndex)}
          >
            <Text style={styles.deletePhotoText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quản lý danh sách nhiều ảnh (Mục 4.3) */}
      <View style={styles.gallerySection}>
        <View style={styles.galleryHeaderRow}>
          <Text style={styles.galleryTitle}>
            {t('label_images')} ({images.length})
          </Text>
          <TouchableOpacity
            style={styles.addPhotoTrigger}
            onPress={() => setShowAddImageModal(true)}
          >
            <Text style={styles.addPhotoTriggerText}>+ {t('btn_add_image')}</Text>
          </TouchableOpacity>
        </View>

        {images.length === 0 ? (
          <Text style={styles.emptyPhotoText}>{t('empty_images')}</Text>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={images}
            keyExtractor={(_, index) => `img-${index}`}
            renderItem={({ item, index }) => {
              const isSelected = activeImageIndex === index;
              return (
                <TouchableOpacity
                  style={[
                    styles.thumbnailItem,
                    isSelected && styles.thumbnailItemSelected,
                    item.BIT240080_IsThumbnail && styles.thumbnailItemIsMain,
                  ]}
                  onPress={() => setActiveImageIndex(index)}
                >
                  <Image source={{ uri: item.BIT240080_ImageUrl }} style={styles.thumbMini} />
                  {item.BIT240080_IsThumbnail && (
                    <View style={styles.miniStar}>
                      <Text style={styles.miniStarText}>★</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Nút đặt ảnh đang chọn làm Thumbnail nếu chưa phải */}
        {images.length > 0 && !currentImage?.BIT240080_IsThumbnail && (
          <TouchableOpacity
            style={styles.setThumbBtn}
            onPress={() => handleSetThumbnail(activeImageIndex)}
          >
            <Text style={styles.setThumbBtnText}>★ {t('btn_set_thumbnail')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thông tin chi tiết món ăn */}
      <View style={styles.contentSection}>
        <View style={styles.titleRow}>
          <Text style={styles.dishTitle}>{dish.BIT240080_Name}</Text>
          <Text style={styles.priceHighlight}>
            {dish.BIT240080_Price.toLocaleString()} đ
          </Text>
        </View>

        <Text style={styles.categorySub}>
          {t('label_category')}:{' '}
          <Text style={styles.boldText}>
            {category?.BIT240080_Name || dish.BIT240080_DishCategoryId}
          </Text>
        </Text>

        {/* Thẻ trạng thái & phân loại tốc độ */}
        <View style={styles.badgeRow}>
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

          {/* Phân loại tốc độ chế biến tự động (Mục 4.3) */}
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
              {speed === 'Quick' ? t('status_quick') : t('status_regular')} (
              {dish.BIT240080_PreparationTime} {t('time_minutes')})
            </Text>
          </View>
        </View>

        {/* Chi tiết mô tả */}
        <View style={styles.descContainer}>
          <Text style={styles.descHeading}>{t('label_description')}</Text>
          <Text style={styles.descContent}>
            {dish.BIT240080_Description || 'Chưa có mô tả chi tiết cho món ăn này.'}
          </Text>
        </View>

        {/* Thông tin kỹ thuật MSSV & Đồng bộ */}
        <View style={styles.metaCard}>
          <Text style={styles.metaRow}>
            {t('label_id')}: <Text style={styles.monoText}>{dish.BIT240080_Id}</Text>
          </Text>
          <Text style={styles.metaRow}>
            {t('label_sync_status')}:{' '}
            <Text style={styles.monoText}>{dish.BIT240080_SyncStatus || 'SYNCED'}</Text>
          </Text>
        </View>

        {/* Nút hành động Sửa & Xóa (Mục 4.1) */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.btnEdit}
            onPress={() => navigation.navigate('DishForm', { dishId: dish.BIT240080_Id })}
          >
            <Text style={styles.btnEditText}>✎ {t('btn_edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteDish}>
            <Text style={styles.btnDeleteText}>✕ {t('btn_delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Thêm ảnh nhanh (Mục 4.3) */}
      <Modal visible={showAddImageModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('btn_add_image')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChangeText={setNewImageUrl}
              autoCapitalize="none"
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowAddImageModal(false);
                  setNewImageUrl('');
                }}
              >
                <Text style={styles.modalCancelText}>{t('btn_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleQuickAddImage}>
                <Text style={styles.modalAddText}>{t('btn_add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  mainImageContainer: {
    position: 'relative',
    width: '100%',
    height: 270,
    backgroundColor: '#E5E7EB',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  thumbnailLabelText: {
    color: '#FCD34D',
    fontWeight: '700',
    fontSize: 12,
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  gallerySection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  addPhotoTrigger: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addPhotoTriggerText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPhotoText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginVertical: 6,
  },
  thumbnailItem: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  thumbnailItemSelected: {
    borderColor: '#2563EB',
  },
  thumbnailItemIsMain: {
    borderColor: '#F59E0B',
  },
  thumbMini: {
    width: '100%',
    height: '100%',
  },
  miniStar: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  setThumbBtn: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  setThumbBtnText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 12,
  },
  contentSection: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  priceHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
  categorySub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  boldText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusUnavailable: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusAvailableText: {
    color: '#15803D',
  },
  statusUnavailableText: {
    color: '#B91C1C',
  },
  speedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  speedQuickBadge: {
    backgroundColor: '#E0F2FE',
  },
  speedRegularBadge: {
    backgroundColor: '#EDE9FE',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  speedQuickText: {
    color: '#0369A1',
  },
  speedRegularText: {
    color: '#6D28D9',
  },
  descContainer: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  descContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  metaCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metaRow: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  monoText: {
    fontFamily: 'monospace',
    color: '#111827',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 30,
  },
  btnEdit: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnEditText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDeleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  modalAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  modalAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
