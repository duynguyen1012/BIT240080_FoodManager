/**
 * BIT240080_FoodManager - Màn hình Quản lý Loại món (CategoryManagerScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Đảm bảo 100% yêu cầu Mục 4.1, 4.4, 4.5:
 * - Hiển thị danh sách loại món kèm số lượng món ăn đang thuộc loại đó
 * - Thêm mới và Chỉnh sửa (Edit) loại món ăn
 * - Kiểm tra trùng tên loại món, tên không rỗng
 * - RÀNG BUỘC 4.4: Tuyệt đối KHÔNG CHO XÓA loại món đang có món ăn sử dụng!
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BIT240080_CategoryWithCount, BIT240080_DishCategory } from '../types';
import {
  getAllCategoriesWithCount,
  insertCategory,
  updateCategory,
  deleteCategory,
  checkCategoryNameDuplicate,
} from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { syncData, isNetworkConnected } from '../services/syncService';

export default function CategoryManagerScreen() {
  const { t } = useLanguage();

  const [categories, setCategories] = useState<BIT240080_CategoryWithCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Thêm / Sửa
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategoriesWithCount();
      setCategories(data);
    } catch (error) {
      console.error('[BIT240080_Category] Lỗi tải loại món:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Bắt đầu chỉnh sửa 1 danh mục
  const startEditCategory = (cat: BIT240080_CategoryWithCount) => {
    setEditingId(cat.BIT240080_Id);
    setCatName(cat.BIT240080_Name);
    setCatDesc(cat.BIT240080_Description || '');
    setNameError(null);
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingId(null);
    setCatName('');
    setCatDesc('');
    setNameError(null);
  };

  // Lưu Thêm mới hoặc Cập nhật loại món
  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      setNameError(t('validation_category_name_required'));
      return;
    }

    try {
      // Kiểm tra trùng tên loại món
      const isDuplicate = await checkCategoryNameDuplicate(
        catName.trim(),
        editingId || undefined
      );

      if (isDuplicate) {
        setNameError(t('validation_category_name_duplicate'));
        return;
      }

      if (editingId) {
        // Cập nhật
        const updatedCategory: BIT240080_DishCategory = {
          BIT240080_Id: editingId,
          BIT240080_Name: catName.trim(),
          BIT240080_Description: catDesc.trim(),
        };
        await updateCategory(updatedCategory);
        Alert.alert(t('alert_success_category_update'));
      } else {
        // Thêm mới
        const newCategory: BIT240080_DishCategory = {
          BIT240080_Id: `cat-${Date.now()}`,
          BIT240080_Name: catName.trim(),
          BIT240080_Description: catDesc.trim(),
        };
        await insertCategory(newCategory);
        Alert.alert(t('alert_success_category_create'));
      }

      cancelEdit();
      await loadCategories();

      if (await isNetworkConnected()) {
        syncData();
      }
    } catch (error) {
      Alert.alert(t('alert_error_generic'));
    }
  };

  // Xóa loại món ăn (Ràng buộc nghiệp vụ 4.4)
  const handleDeleteCategory = (cat: BIT240080_CategoryWithCount) => {
    // 1. Kiểm tra trước: Nếu đang có món ăn sử dụng -> Chặn ngay lập tức
    if (cat.dishCount > 0) {
      Alert.alert(t('alert_delete_title'), t('alert_category_in_use'));
      return;
    }

    // 2. Nếu không có món nào -> Xác nhận xóa
    Alert.alert(
      t('alert_delete_title'),
      t('alert_delete_category_confirm', { name: cat.BIT240080_Name }),
      [
        { text: t('btn_cancel'), style: 'cancel' },
        {
          text: t('btn_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteCategory(cat.BIT240080_Id);
              if (!res.success && res.reason === 'CATEGORY_IN_USE') {
                Alert.alert(t('alert_category_in_use'));
                return;
              }

              Alert.alert(t('alert_success_delete'));
              if (editingId === cat.BIT240080_Id) {
                cancelEdit();
              }
              await loadCategories();

              if (await isNetworkConnected()) {
                syncData();
              }
            } catch (error) {
              Alert.alert(t('alert_error_generic'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Form Thêm mới / Chỉnh sửa */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? t('edit_category_title') : t('add_category_title')}
        </Text>

        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder={t('category_name_placeholder')}
          value={catName}
          onChangeText={(text) => {
            setCatName(text);
            if (nameError) setNameError(null);
          }}
        />
        {Boolean(nameError) && <Text style={styles.errorText}>{nameError}</Text>}

        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder={t('category_desc_placeholder')}
          value={catDesc}
          onChangeText={setCatDesc}
        />

        <View style={styles.formButtonRow}>
          {Boolean(editingId) && (
            <TouchableOpacity style={styles.btnCancelEdit} onPress={cancelEdit}>
              <Text style={styles.btnCancelEditText}>{t('btn_cancel')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnSave} onPress={handleSaveCategory}>
            <Text style={styles.btnSaveText}>
              {editingId ? t('btn_save') : t('btn_add')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách các loại món */}
      <Text style={styles.sectionTitle}>
        {t('screen_category_manager')} ({categories.length})
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.BIT240080_Id}
          renderItem={({ item }) => (
            <View style={styles.catCard}>
              <View style={styles.catInfo}>
                <View style={styles.catHeaderRow}>
                  <Text style={styles.catName}>{item.BIT240080_Name}</Text>
                  {/* Badge số lượng món ăn đang thuộc loại món (Mục 4.4) */}
                  <View
                    style={[
                      styles.countBadge,
                      item.dishCount > 0 ? styles.countBadgeActive : styles.countBadgeEmpty,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countBadgeText,
                        item.dishCount > 0 ? styles.countTextActive : styles.countTextEmpty,
                      ]}
                    >
                      {t('category_dish_count', { count: item.dishCount })}
                    </Text>
                  </View>
                </View>

                {Boolean(item.BIT240080_Description) && (
                  <Text style={styles.catDesc}>{item.BIT240080_Description}</Text>
                )}
                <Text style={styles.catId}>ID: {item.BIT240080_Id}</Text>
              </View>

              <View style={styles.catActions}>
                <TouchableOpacity
                  style={styles.btnEditCat}
                  onPress={() => startEditCategory(item)}
                >
                  <Text style={styles.btnEditCatText}>{t('btn_edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnDeleteCat,
                    item.dishCount > 0 && styles.btnDeleteCatDisabled,
                  ]}
                  onPress={() => handleDeleteCategory(item)}
                >
                  <Text
                    style={[
                      styles.btnDeleteCatText,
                      item.dishCount > 0 && styles.btnDeleteCatTextDisabled,
                    ]}
                  >
                    {t('btn_delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('empty_categories')}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
  formButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  btnCancelEdit: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnCancelEditText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  btnSave: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  catCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catInfo: {
    marginBottom: 10,
  },
  catHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  countBadgeEmpty: {
    backgroundColor: '#F3F4F6',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countTextActive: {
    color: '#1D4ED8',
  },
  countTextEmpty: {
    color: '#6B7280',
  },
  catDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  catId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  catActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 8,
  },
  btnEditCat: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnEditCatText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  btnDeleteCat: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnDeleteCatDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  btnDeleteCatText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12,
  },
  btnDeleteCatTextDisabled: {
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
  },
});
