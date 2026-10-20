/**
 * BIT240080_FoodManager - Màn hình Quản lý Loại món (CategoryManagerScreen)
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Hiển thị danh sách loại món, cho phép thêm mới và xóa loại món.
 * RÀNG BUỘC 4.4: Không cho xóa loại món đang được sử dụng bởi các món ăn!
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
import { BIT240080_DishCategory } from '../types';
import {
  getAllCategories,
  insertCategory,
  deleteCategory,
} from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { syncData, isNetworkConnected } from '../services/syncService';

export default function CategoryManagerScreen() {
  const { t } = useLanguage();

  const [categories, setCategories] = useState<BIT240080_DishCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
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

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert(t('validation_name_required'));
      return;
    }

    const newCategory: BIT240080_DishCategory = {
      BIT240080_Id: `cat-${Date.now()}`,
      BIT240080_Name: newCatName.trim(),
      BIT240080_Description: newCatDesc.trim(),
    };

    try {
      await insertCategory(newCategory);
      setNewCatName('');
      setNewCatDesc('');
      loadCategories();

      if (await isNetworkConnected()) {
        syncData();
      }
    } catch (error) {
      Alert.alert(t('alert_error_generic'));
    }
  };

  const handleDeleteCategory = (cat: BIT240080_DishCategory) => {
    Alert.alert(
      t('alert_delete_title'),
      t('alert_delete_category_confirm'),
      [
        { text: t('btn_cancel'), style: 'cancel' },
        {
          text: t('btn_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteCategory(cat.BIT240080_Id);
              if (!res.success && res.reason === 'CATEGORY_IN_USE') {
                // Ràng buộc nghiệp vụ 4.4
                Alert.alert(t('alert_category_in_use'));
                return;
              }

              Alert.alert(t('alert_success_delete'));
              loadCategories();

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
      {/* Form thêm loại món mới */}
      <View style={styles.addCard}>
        <Text style={styles.addTitle}>+ Thêm Loại Món Mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên loại món (Ví dụ: Khai vị, Đồ nướng...)"
          value={newCatName}
          onChangeText={setNewCatName}
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="Mô tả loại món (tùy chọn)"
          value={newCatDesc}
          onChangeText={setNewCatDesc}
        />
        <TouchableOpacity style={styles.btnAdd} onPress={handleAddCategory}>
          <Text style={styles.btnAddText}>{t('btn_add')}</Text>
        </TouchableOpacity>
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
                <Text style={styles.catName}>{item.BIT240080_Name}</Text>
                {Boolean(item.BIT240080_Description) && (
                  <Text style={styles.catDesc}>{item.BIT240080_Description}</Text>
                )}
                <Text style={styles.catId}>ID: {item.BIT240080_Id}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => handleDeleteCategory(item)}
              >
                <Text style={styles.btnDeleteText}>{t('btn_delete')}</Text>
              </TouchableOpacity>
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
  addCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addTitle: {
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
  },
  btnAdd: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAddText: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catInfo: {
    flex: 1,
    marginRight: 10,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  catDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  catId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  btnDelete: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDeleteText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
  },
});
