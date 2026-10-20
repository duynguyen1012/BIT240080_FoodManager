/**
 * BIT240080_FoodManager - Navigation Configuration
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Thanh Header hiển thị rõ MSSV "BIT240080 - Nguyễn Đức Duy" phục vụ quay video chấm điểm
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

import DishListScreen from '../screens/DishListScreen';
import DishDetailScreen from '../screens/DishDetailScreen';
import DishFormScreen from '../screens/DishFormScreen';
import CategoryManagerScreen from '../screens/CategoryManagerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderTitleCustom() {
  const { t } = useLanguage();
  return (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitleName}>BIT240080 - Nguyễn Đức Duy</Text>
      <Text style={styles.headerSubtitle}>{t('app_title')}</Text>
    </View>
  );
}

function CategoryHeaderRight() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();

  return (
    <TouchableOpacity
      style={styles.headerBtn}
      onPress={() => navigation.navigate('CategoryManager')}
    >
      <Text style={styles.headerBtnText}>📁 {t('btn_manage_categories')}</Text>
    </TouchableOpacity>
  );
}

export default function RootNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      initialRouteName="DishList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E293B',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
        },
        headerBackTitle: t('btn_back'),
      }}
    >
      {/* Màn hình danh sách chính: Hiển thị nổi bật MSSV "BIT240080 - Nguyễn Đức Duy" */}
      <Stack.Screen
        name="DishList"
        component={DishListScreen}
        options={{
          headerTitle: () => <HeaderTitleCustom />,
          headerRight: () => <CategoryHeaderRight />,
        }}
      />

      {/* Màn hình chi tiết món ăn */}
      <Stack.Screen
        name="DishDetail"
        component={DishDetailScreen}
        options={{
          title: t('screen_dish_detail'),
        }}
      />

      {/* Màn hình thêm / sửa món ăn */}
      <Stack.Screen
        name="DishForm"
        component={DishFormScreen}
        options={({ route }) => ({
          title: route.params?.dishId ? t('screen_edit_dish') : t('screen_add_dish'),
        })}
      />

      {/* Màn hình quản lý danh mục */}
      <Stack.Screen
        name="CategoryManager"
        component={CategoryManagerScreen}
        options={{
          title: t('screen_category_manager'),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    justifyContent: 'center',
  },
  headerTitleName: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  headerBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  headerBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
});
