import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import i18n from "../locales/i18n";

type Props = {
  onLogout: () => void;
};

const SettingsScreen = ({ onLogout }: Props) => {
  
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Error clearing user data: ', error);
    }

    if (onLogout) onLogout();

    setTimeout(() => {
      router.replace('/');
    }, 500);
  };

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error(`Navigation failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Moved Footer to the Top */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>{i18n.t('settings.madeWithLove')}</Text>
          <Ionicons name="logo-instagram" size={24} color="#F5E6D9" style={styles.icon} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <Text style={styles.sectionTitle}>{i18n.t('settings.appSettings')}</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/user-account')}>
          <Ionicons name="person-circle-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.userAccount')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/change-language')}>
          <Ionicons name="language-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t("settings.changeLanguage")}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{i18n.t('settings.response')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/contact-us')}>
          <Ionicons name="mail-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.contactUs')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/write-review')}>
          <Ionicons name="thumbs-up-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.writeReview')}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{i18n.t('settings.about')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/our-story')}>
          <Ionicons name="heart-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.aboutApp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/dataintegritet')}>
          <Ionicons name="lock-closed-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.privacy')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/terms')}>
          <Ionicons name="document-text-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.terms')}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{i18n.t('settings.logout')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F5E6D9" />
          <Text style={styles.menuText}>{i18n.t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 20,
    backgroundColor: '#522f60ff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5E6D9',
    marginVertical: 5,
  },
  menuContainer: {
  paddingTop: 0,
  paddingBottom: 140, // Ökat utrymme för att säkerställa att knapparna är synliga
},

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14, // Liten ökning av padding för flikarna
    paddingHorizontal: 14, // Liten ökning av padding för flikarna
    marginBottom: 12,
    borderRadius: 12, // Liten ökning för rundade hörn
    backgroundColor: '#6a4b8d',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuText: {
    fontSize: 17, // Liten ökning i textstorlek för bättre synlighet
    marginLeft: 15,
    color: '#F5E6D9',
  },
  footer: {
    marginTop: 5,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#F5E6D9',
    textAlign: 'center',
    marginRight: 10,
  },
  icon: {
    marginLeft: -4,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },

  // New styles for language selection
  languageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageOption: {
    paddingVertical: 16, // Liten ökning av padding för flikarna
    paddingHorizontal: 28, // Liten ökning av padding för flikarna
    borderRadius: 25, // Behåller samma rundade hörn
    backgroundColor: '#7a5cae88',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#a98eee',
    borderColor: '#f5e6d9',
    shadowColor: '#f5e6d9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  languageText: {
    fontSize: 17, // Liten ökning i textstorlek
    color: '#f5e6d9',
    fontWeight: '600',
  },
  languageTextSelected: {
    color: '#522f60',
  },
  changeLanguageBtn: {
    marginTop: 5,
    backgroundColor: '#a98eee',
    borderRadius: 25,
    paddingVertical: 16, // Liten ökning för att göra knappen större
    paddingHorizontal: 45, // Liten ökning för att göra knappen större
    alignSelf: 'center',
    shadowColor: '#f5e6d9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  changeLanguageBtnText: {
    fontSize: 17, // Liten ökning i textstorlek
    fontWeight: '700',
    color: '#522f60',
    textAlign: 'center',
  },
});

export default SettingsScreen;

