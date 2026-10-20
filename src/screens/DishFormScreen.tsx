/**
 * BIT240080_FoodManager - Màn hình Thêm / Chỉnh sửa món ăn (DishFormScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Đảm bảo 100% yêu cầu Mục 3, 4.1, 4.3, 4.4, 4.5:
 * - Chọn loại món ăn từ SQLite
 * - Quản lý nhiều link ảnh, chọn Thumbnail duy nhất, xóa ảnh
 * - Validation chặt chẽ: Name không rỗng, Price > 0, PrepTime > 0, CategoryId hợp lệ
 * - Ràng buộc: Tên món không trùng trong cùng loại (loại trừ chính nó khi Edit)
 * - Đa ngôn ngữ EN/VI toàn diện
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BIT240080_Dish,
  BIT240080_DishCategory,
  BIT240080_DishImageItem,
  RootStackParamList,
} from '../types';
import {
  getDishById,
  getAllCategories,
  insertDish,
  updateDish,
  checkDishNameDuplicate,
  parseDishImages,
} from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { syncData, isNetworkConnected } from '../services/syncService';

type FormRouteProp = RouteProp<RootStackParamList, 'DishForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DishForm'>;

export default function DishFormScreen() {
  const route = useRoute<FormRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  const dishId = route.params?.dishId;
  const isEditing = Boolean(dishId);

  const [categories, setCategories] = useState<BIT240080_DishCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields (toàn bộ tương ứng cột BIT240080_)
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [prepTime, setPrepTime] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [images, setImages] = useState<BIT240080_DishImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Lỗi validation hiển thị trực quan dưới từng trường
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initForm = async () => {
      try {
        const catList = await getAllCategories();
        setCategories(catList);

        if (isEditing && dishId) {
          const existingDish = await getDishById(dishId);
          if (existingDish) {
            setName(existingDish.BIT240080_Name);
            setPrice(existingDish.BIT240080_Price.toString());
            setPrepTime(existingDish.BIT240080_PreparationTime.toString());
            setIsAvailable(existingDish.BIT240080_IsAvailable === 1);
            setDescription(existingDish.BIT240080_Description || '');
            setCategoryId(existingDish.BIT240080_DishCategoryId);
            const parsedImgs = parseDishImages(existingDish.BIT240080_DishImage);
            setImages(parsedImgs);
          }
        } else {
          // Thêm mới: Mặc định chọn category đầu tiên nếu có
          if (catList.length > 0) {
            setCategoryId(catList[0].BIT240080_Id);
          }
          // Ảnh mẫu mặc định
          setImages([
            {
              BIT240080_ImageUrl:
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
              BIT240080_IsThumbnail: true,
            },
          ]);
        }
      } catch (error) {
        console.error('[BIT240080_DishForm] Lỗi nạp form:', error);
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [dishId, isEditing]);

  // Thêm một ảnh mới vào danh sách
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      Alert.alert(t('validation_image_required'));
      return;
    }

    if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
      Alert.alert(t('validation_image_url_invalid'));
      return;
    }

    const hasThumbnail = images.some((img) => img.BIT240080_IsThumbnail);
    const updatedImages = [
      ...images,
      {
        BIT240080_ImageUrl: newImageUrl.trim(),
        BIT240080_IsThumbnail: !hasThumbnail, // Nếu chưa có thumbnail thì đây là thumbnail
      },
    ];

    setImages(updatedImages);
    setNewImageUrl('');
    // Xóa lỗi ảnh nếu có
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  // Chọn ảnh làm Thumbnail duy nhất (Mục 4.3)
  const handleSetThumbnail = (targetIndex: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      BIT240080_IsThumbnail: idx === targetIndex,
    }));
    setImages(updated);
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (targetIndex: number) => {
    if (images.length <= 1) {
      Alert.alert(t('alert_at_least_one_image'));
      return;
    }

    const wasThumbnail = images[targetIndex].BIT240080_IsThumbnail;
    const remaining = images.filter((_, idx) => idx !== targetIndex);

    // Nếu ảnh vừa xóa là thumbnail thì chuyển thumbnail sang ảnh đầu tiên
    if (wasThumbnail && remaining.length > 0) {
      remaining[0].BIT240080_IsThumbnail = true;
    }

    setImages(remaining);
  };

  // Rà soát và kiểm tra toàn bộ validation đầu vào
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // 1. Name không rỗng
    if (!name.trim()) {
      newErrors.name = t('validation_name_required');
    }

    // 2. Price > 0
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = t('validation_price_invalid');
    }

    // 3. PreparationTime > 0
    const parsedPrepTime = parseInt(prepTime, 10);
    if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
      newErrors.prepTime = t('validation_prep_time_invalid');
    }

    // 4. CategoryId hợp lệ
    if (!categoryId.trim()) {
      newErrors.category = t('validation_category_required');
    }

    // 5. Ít nhất 1 ảnh
    if (images.length === 0) {
      newErrors.images = t('validation_image_required');
    }

    // 6. Kiểm tra trùng tên trong cùng loại (Mục 3)
    if (name.trim() && categoryId.trim()) {
      const isDuplicate = await checkDishNameDuplicate(
        name.trim(),
        categoryId,
        isEditing ? dishId : undefined
      );

      if (isDuplicate) {
        newErrors.name = t('validation_name_duplicate');
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorMessage = Object.values(newErrors)[0];
      Alert.alert(t('alert_error_generic'), firstErrorMessage);
      return false;
    }

    return true;
  };

  // Lưu món ăn
  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setSubmitting(true);

    try {
      const parsedPrice = parseFloat(price);
      const parsedPrepTime = parseInt(prepTime, 10);

      // Đảm bảo đúng 1 ảnh có BIT240080_IsThumbnail = true
      let sanitizedImages = [...images];
      const thumbCount = sanitizedImages.filter((img) => img.BIT240080_IsThumbnail).length;
      if (thumbCount !== 1) {
        sanitizedImages = sanitizedImages.map((img, idx) => ({
          ...img,
          BIT240080_IsThumbnail: idx === 0,
        }));
      }

      const dishData: BIT240080_Dish = {
        BIT240080_Id: isEditing && dishId ? dishId : `dish-${Date.now()}`,
        BIT240080_Name: name.trim(),
        BIT240080_Price: parsedPrice,
        BIT240080_PreparationTime: parsedPrepTime,
        BIT240080_IsAvailable: isAvailable ? 1 : 0,
        BIT240080_Description: description.trim(),
        BIT240080_DishCategoryId: categoryId,
        BIT240080_DishImage: JSON.stringify(sanitizedImages),
        BIT240080_SyncStatus: isEditing ? 'PENDING_UPDATE' : 'PENDING_CREATE',
      };

      if (isEditing) {
        await updateDish(dishData);
        Alert.alert(t('alert_success_update'));
      } else {
        await insertDish(dishData);
        Alert.alert(t('alert_success_create'));
      }

      // Kích hoạt đồng bộ ngầm nếu đang có kết nối mạng
      if (await isNetworkConnected()) {
        syncData();
      }

      navigation.goBack();
    } catch (error) {
      console.error('[BIT240080_DishForm] Lỗi lưu món ăn:', error);
      Alert.alert(t('alert_error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        {/* Tên món ăn */}
        <Text style={styles.label}>
          {t('label_name')} <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          placeholder="Ví dụ: Phở Bò Tái Nạm"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) {
              setErrors((prev) => {
                const c = { ...prev };
                delete c.name;
                return c;
              });
            }
          }}
        />
        {Boolean(errors.name) && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Loại món ăn (Category) */}
        <Text style={styles.label}>
          {t('label_category')} <Text style={styles.requiredMark}>*</Text>
        </Text>
        <View style={styles.categorySelector}>
          {categories.map((cat) => {
            const isSelected = categoryId === cat.BIT240080_Id;
            return (
              <TouchableOpacity
                key={cat.BIT240080_Id}
                style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                onPress={() => {
                  setCategoryId(cat.BIT240080_Id);
                  if (errors.category) {
                    setErrors((prev) => {
                      const c = { ...prev };
                      delete c.category;
                      return c;
                    });
                  }
                }}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    isSelected && styles.categoryOptionTextSelected,
                  ]}
                >
                  {cat.BIT240080_Name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {Boolean(errors.category) && <Text style={styles.errorText}>{errors.category}</Text>}

        {/* Giá tiền & Thời gian nấu */}
        <View style={styles.row}>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>
              {t('label_price')} <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.price ? styles.inputError : null]}
              placeholder="50000"
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) {
                  setErrors((prev) => {
                    const c = { ...prev };
                    delete c.price;
                    return c;
                  });
                }
              }}
            />
            {Boolean(errors.price) && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.flexHalf, { marginLeft: 12 }]}>
            <Text style={styles.label}>
              {t('label_prep_time')} ({t('time_minutes')}){' '}
              <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.prepTime ? styles.inputError : null]}
              placeholder="15"
              keyboardType="numeric"
              value={prepTime}
              onChangeText={(text) => {
                setPrepTime(text);
                if (errors.prepTime) {
                  setErrors((prev) => {
                    const c = { ...prev };
                    delete c.prepTime;
                    return c;
                  });
                }
              }}
            />
            {Boolean(errors.prepTime) && (
              <Text style={styles.errorText}>{errors.prepTime}</Text>
            )}
          </View>
        </View>

        {/* Trạng thái bán */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>{t('label_status')}</Text>
            <Text style={styles.subLabel}>
              {isAvailable ? t('status_available') : t('status_unavailable')}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={isAvailable ? '#16A34A' : '#9CA3AF'}
          />
        </View>

        {/* Mô tả chi tiết */}
        <Text style={styles.label}>{t('label_description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả nguyên liệu, hương vị món ăn..."
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* Danh sách hình ảnh và đặt ảnh đại diện */}
        <Text style={[styles.label, { marginTop: 14 }]}>
          {t('label_images')} <Text style={styles.requiredMark}>*</Text>
        </Text>
        <Text style={styles.subLabel}>
          (Mỗi món có tối đa 01 ảnh đại diện chính. Nhấn vào ảnh để chọn làm Thumbnail)
        </Text>

        <View style={styles.imageListContainer}>
          {images.map((img, index) => (
            <View key={`img-${index}`} style={styles.imageCard}>
              <Image source={{ uri: img.BIT240080_ImageUrl }} style={styles.previewImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={[
                    styles.thumbToggleBtn,
                    img.BIT240080_IsThumbnail && styles.thumbToggleActive,
                  ]}
                  onPress={() => handleSetThumbnail(index)}
                >
                  <Text
                    style={[
                      styles.thumbToggleText,
                      img.BIT240080_IsThumbnail && styles.thumbToggleTextActive,
                    ]}
                  >
                    {img.BIT240080_IsThumbnail ? '★ Main' : 'Set Main'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        {Boolean(errors.images) && <Text style={styles.errorText}>{errors.images}</Text>}

        {/* Thêm link ảnh mới */}
        <View style={styles.addImageRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Dán link ảnh (https://...)"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.btnAddImage} onPress={handleAddImage}>
            <Text style={styles.btnAddImageText}>+ {t('btn_add')}</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Lưu và Hủy */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.btnCancelText}>{t('btn_cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSave}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnSaveText}>{t('btn_save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  requiredMark: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  flexHalf: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  imageCard: {
    width: 95,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImage: {
    width: '100%',
    height: 80,
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  thumbToggleBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  thumbToggleActive: {
    backgroundColor: '#FEF3C7',
  },
  thumbToggleText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  thumbToggleTextActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  removeImageBtn: {
    padding: 4,
  },
  removeImageText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  addImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  btnAddImage: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAddImageText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 26,
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSave: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
