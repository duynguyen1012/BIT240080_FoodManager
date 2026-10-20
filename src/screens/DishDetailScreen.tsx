/**
 * BIT240080_FoodManager - Màn hình chi tiết món ăn (DishDetailScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Hiển thị nhiều ảnh, hỗ trợ đổi ảnh đại diện (Thumbnail), phân loại Quick/Regular,
 * trạng thái bán và thao tác Sửa/Xóa.
 */

import React, { useState, useEffect, useCallback } from 'react';
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

  const loadDishDetail = useCallback(async () => {
    try {
      const dishData = await getDishById(dishId);
      if (dishData) {
        setDish(dishData);
        const parsedImgs = parseDishImages(dishData.BIT240080_DishImage);
        setImages(parsedImgs);

        // Đặt index ban đầu vào ảnh thumbnail nếu có
        const thumbIdx = parsedImgs.findIndex((img) => img.BIT240080_IsThumbnail);
        setActiveImageIndex(thumbIdx >= 0 ? thumbIdx : 0);

        const catData = await getCategoryById(dishData.BIT240080_DishCategoryId);
        setCategory(catData);
      } else {
        Alert.alert(t('alert_error_generic'), 'Dish not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('[BIT240080_DishDetail] Lỗi tải dữ liệu chi tiết:', error);
    } finally {
      setLoading(false);
    }
  }, [dishId, navigation, t]);

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

  const handleDelete = () => {
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

  if (loading || !dish) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const speed = getSpeedType(dish.BIT240080_PreparationTime);
  const isSelling = dish.BIT240080_IsAvailable === 1;
  const currentImage = images[activeImageIndex];

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh chính lớn đang xem */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{
            uri:
              currentImage?.BIT240080_ImageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
          }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {currentImage?.BIT240080_IsThumbnail && (
          <View style={styles.thumbnailLabel}>
            <Text style={styles.thumbnailLabelText}>★ {t('label_thumbnail')}</Text>
          </View>
        )}
      </View>

      {/* Danh sách ảnh thu nhỏ cuộn ngang để chọn xem và đặt làm ảnh đại diện */}
      {images.length > 1 && (
        <View style={styles.gallerySection}>
          <Text style={styles.galleryTitle}>
            {t('label_images')} ({images.length})
          </Text>
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

          {/* Nút đặt ảnh đang chọn làm Thumbnail nếu chưa phải */}
          {!currentImage?.BIT240080_IsThumbnail && (
            <TouchableOpacity
              style={styles.setThumbBtn}
              onPress={() => handleSetThumbnail(activeImageIndex)}
            >
              <Text style={styles.setThumbBtnText}>★ {t('btn_set_thumbnail')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Thông tin chi tiết món ăn */}
      <View style={styles.contentSection}>
        <View style={styles.titleRow}>
          <Text style={styles.dishTitle}>{dish.BIT240080_Name}</Text>
          <Text style={styles.priceHighlight}>
            {dish.BIT240080_Price.toLocaleString()} đ
          </Text>
        </View>

        <Text style={styles.categorySub}>
          {t('label_category')}: <Text style={styles.boldText}>{category?.BIT240080_Name || dish.BIT240080_DishCategoryId}</Text>
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

        {/* Nút hành động Sửa & Xóa */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.btnEdit}
            onPress={() => navigation.navigate('DishForm', { dishId: dish.BIT240080_Id })}
          >
            <Text style={styles.btnEditText}>✎ {t('btn_edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDelete} onPress={handleDelete}>
            <Text style={styles.btnDeleteText}>✕ {t('btn_delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  gallerySection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  galleryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
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
});
