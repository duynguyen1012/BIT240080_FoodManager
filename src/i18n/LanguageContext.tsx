/**
 * BIT240080_FoodManager - Language Context & Hook
 * Sinh viên: Nguyễn Đức Duy - MSSV: BIT240080
 * Mặc định: 'en' (Tiếng Anh)
 * Lưu trữ trạng thái lựa chọn bằng AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageType, TranslationKey } from './translations';

const LANGUAGE_STORAGE_KEY = '@bit240080_app_language';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  toggleLanguage: async () => {},
  t: (key: TranslationKey) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mặc định là Tiếng Anh (English) theo đúng yêu cầu đề bài
  const [language, setLanguageState] = useState<LanguageType>('en');

  useEffect(() => {
    // Tải ngôn ngữ đã lưu khi khởi chạy ứng dụng
    const loadStoredLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang === 'en' || storedLang === 'vi') {
          setLanguageState(storedLang);
        }
      } catch (error) {
        console.error('[BIT240080_i18n] Lỗi đọc ngôn ngữ từ storage:', error);
      }
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = async (newLang: LanguageType) => {
    try {
      setLanguageState(newLang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (error) {
      console.error('[BIT240080_i18n] Lỗi lưu ngôn ngữ:', error);
    }
  };

  const toggleLanguage = async () => {
    const nextLang: LanguageType = language === 'en' ? 'vi' : 'en';
    await setLanguage(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
