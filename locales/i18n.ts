import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import en from "./en";
import es from "./es";
import sv from "./sv";

const STORAGE_KEY = "appLanguage";

const i18n = new I18n({
  en,
  es,
  sv,
});

// Default fallback & default locale
i18n.defaultLocale = "en";
i18n.enableFallback = true;

// Function to initialize locale from AsyncStorage or device
export async function initI18n() {
  try {
    const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLang && ["en", "es", "sv"].includes(savedLang)) {
      i18n.locale = savedLang;
    } else {
      // fallback to device language
      const deviceLanguage = getLocales()[0]?.languageCode || "en";
      i18n.locale = ["en", "es", "sv"].includes(deviceLanguage) ? deviceLanguage : "en";
    }
  } catch (e) {
    // If error, just use default
    i18n.locale = "en";
  }
}

// Save new app language to AsyncStorage and update i18n locale
export async function setAppLanguage(lang: string) {
  if (["en", "es", "sv"].includes(lang)) {
    i18n.locale = lang;
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  }
}
// New function to get current language
export async function getCurrentLang(): Promise<string> {
  try {
    const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLang && ["en", "es", "sv"].includes(savedLang)) {
      return savedLang;
    }
  } catch (e) {
    // ignore errors
  }
  return i18n.locale;
}

export default i18n;
