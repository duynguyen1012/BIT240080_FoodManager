/**
 * BIT240080_FoodManager - App Entry Point
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Khởi tạo SQLite, Seed Data, Language Context, Safe Area và Navigation Container
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { initDatabase } from './src/database/db';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { syncData, isNetworkConnected } from './src/services/syncService';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log('[BIT240080] Bắt đầu khởi tạo hệ thống...');
        // 1. Khởi tạo SQLite Database & Seed Data
        await initDatabase();
        setDbReady(true);

        // 2. Nếu có mạng thì kích hoạt kiểm tra đồng bộ với MockAPI
        if (await isNetworkConnected()) {
          syncData().catch((err) =>
            console.warn('[BIT240080] Đồng bộ ban đầu gặp lỗi (vẫn tiếp tục với local):', err)
          );
        }
      } catch (e: any) {
        console.error('[BIT240080] Lỗi khởi tạo cơ sở dữ liệu:', e);
        setErrorMsg(e?.message || 'Lỗi khởi tạo CSDL SQLite');
      }
    }

    prepareApp();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.splashTitle}>BIT240080_FoodManager</Text>
        <Text style={styles.splashSubtitle}>Nguyễn Đức Duy - MSSV: BIT240080</Text>
        <Text style={styles.splashStatus}>
          {errorMsg ? `Lỗi: ${errorMsg}` : 'Đang khởi tạo CSDL SQLite...'}
        </Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  splashStatus: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 16,
  },
});
