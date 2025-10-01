import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { languageEvents } from '../hooks/languageEvents';
import i18n, { getCurrentLang, setAppLanguage } from '../locales/i18n';

const LANGUAGES = [
  { code: 'en', labelKey: 'settings.languageEnglish', icon: 'flag-outline' as const },
  { code: 'es', labelKey: 'settings.languageSpanish', icon: 'flag-outline' as const },
  { code: 'sv', labelKey: 'settings.languageSwedish', icon: 'flag-outline' as const },
];

const ChangeLanguageScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isChanging, setIsChanging] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const currentLang = await getCurrentLang();
      setSelectedLanguage(currentLang);
    })();
  }, []);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      navigation.goBack();
    }
  };

  const changeLanguage = async (langCode: string) => {
    if (isChanging || langCode === selectedLanguage) return;
    try {
      setIsChanging(true);
      await setAppLanguage(langCode);
      languageEvents.emit('languageChanged', langCode);
      setSelectedLanguage(langCode);
    } catch (error) {
      Alert.alert(i18n.t('error'), i18n.t('settings.languageChangeError'));
      console.error(error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#522f60ff' }]}>
      {/* Header - Title and Back Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{i18n.t('settings.selectLanguage')}</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {/* Language section title */}
        <Text style={styles.sectionTitle}>{i18n.t('settings.languageSectionTitle') || 'SPRÅK'}</Text>

        {/* Current language */}
        <View style={styles.menuItem}>
          <Ionicons name="language-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>
            {i18n.t('settings.currentLanguage') || 'Nuvarande språk'}: {selectedLanguage.toUpperCase()}
          </Text>
        </View>

        {/* Language options */}
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.menuItem, isSelected && styles.menuItemSelected]}
              onPress={() => changeLanguage(lang.code)}
              disabled={isChanging}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isChanging }}
            >
              <Ionicons name={lang.icon} size={24} color="#F5E6D9" />
              <Text style={styles.menuText}>{i18n.t(lang.labelKey)}</Text>
              <View style={{ flex: 1 }} />
              {isSelected && <Ionicons name="checkmark-circle" size={22} color="#F5E6D9" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gjort med ❤️ av Reactcap</Text>
        <View style={styles.socialLinks}>
          <Ionicons name="logo-instagram" size={24} color="#F5E6D9" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,  // Adjusted to add space from the top
    marginBottom: 20,
    justifyContent: 'center',  // Center both the icon and header
  },
   backButton: {
    position: 'absolute',
    left: 0, // Move back button to the left
    zIndex: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F5E6D9',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5E6D9',
    marginVertical: 10,
  },
  menuContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#6a4b8d',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuItemSelected: {
    backgroundColor: '#7a5cae',
    borderWidth: 1,
    borderColor: '#F5E6D9',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#F5E6D9',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#F5E6D9',
    textAlign: 'center',
    marginBottom: 10,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
});

export default ChangeLanguageScreen;
